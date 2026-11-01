// A Brumilo page asks for a sync over a port (see bridge.js). Amazon is read
// in a background tab, as the user - nothing signs in for them. amazon.js
// lists the orders from inside amazon.com, then reads the card charges on
// the transactions page, then opens each order's page in the tab and reads
// it once Amazon has filled it in (Amazon encrypts order details in the
// page it sends; only the loaded page shows them).
const ORDERS_URL = 'https://www.amazon.com/your-orders/orders';
const ORDER_URL = 'https://www.amazon.com/gp/css/summary/print.html?orderID=';
const TRANSACTIONS_URL = 'https://www.amazon.com/cpe/yourpayments/transactions';
const BRUMILO = [/^https:\/\/app(-dev)?\.brumilo\.com\//, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//];
const PAGE_TIMEOUT_MS = 30000;

let current = null; // { port, tabId }

// Resolves once the tab's next page has loaded (or after a timeout).
function nextLoad(tabId) {
    return new Promise((resolve) => {
        const done = () => {
            clearTimeout(timer);
            chrome.tabs.onUpdated.removeListener(onUpdated);
            resolve();
        };
        const onUpdated = (id, info) => {
            if (id === tabId && info.status === 'complete') done();
        };
        const timer = setTimeout(done, PAGE_TIMEOUT_MS);
        chrome.tabs.onUpdated.addListener(onUpdated);
    });
}

async function open(tabId, url) {
    const loaded = nextLoad(tabId);
    await chrome.tabs.update(tabId, { url });
    await loaded;
}

// Runs one of amazon.js's functions in the tab's current page.
async function inAmazon(tabId, func, args) {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['amazon.js'] });
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId }, func, args });
    return result;
}

// The page may have gone away mid-sync; there's no one left to tell.
function tell(port, message) {
    try {
        port.postMessage(message);
    } catch {
        // Disconnected.
    }
}

const stillWanted = (port) => current?.port === port;

async function sync(port, since) {
    const loaded = new Promise((resolve) => {
        chrome.tabs.create({ url: ORDERS_URL, active: false }, (tab) => {
            current = { port, tabId: tab.id };
            nextLoad(tab.id).then(() => resolve(tab));
        });
    });
    const tab = await loaded;
    let keepTab = false;

    // Signed out or a robot check: show the user the Amazon tab to sort it out.
    const needsUser = async (result) => {
        if (!result?.signedOut && !result?.blocked) return false;
        keepTab = true;
        await chrome.tabs.update(tab.id, { active: true, url: ORDERS_URL });
        tell(port, result.blocked
            ? { type: 'error', error: 'blocked', message: "Amazon wants to check you're not a robot - finish its check in the Amazon tab, then sync again." }
            : { type: 'error', error: 'signed-out', message: 'Sign in to Amazon, then sync again.' });
        return true;
    };

    try {
        const listed = await inAmazon(tab.id, (from) => brumiloAmazon.listOrders(from), [since]);
        console.log('Brumilo Amazon sync - listing', { since, listed: listed?.orders?.length }, (listed?.log ?? []).join('\n'));
        if (await needsUser(listed)) return;

        tell(port, { type: 'progress', message: 'Reading card charges…' });
        await open(tab.id, TRANSACTIONS_URL);
        const paid = await inAmazon(tab.id, (from) => brumiloAmazon.readTransactions(from), [since]);
        if (await needsUser(paid)) return;
        const charges = new Map();
        for (const { orderId, date, cents } of paid?.charges ?? []) {
            charges.set(orderId, [...(charges.get(orderId) ?? []), { date, cents }]);
        }
        console.log('Brumilo Amazon sync - charges', { charges: paid?.charges?.length, orders: charges.size });

        const orders = [];
        let skipped = 0;
        for (const [i, { id, date }] of listed.orders.entries()) {
            if (!stillWanted(port)) return;
            tell(port, { type: 'progress', message: `Reading order ${i + 1} of ${listed.orders.length}…` });

            await open(tab.id, ORDER_URL + encodeURIComponent(id));
            const read = await inAmazon(tab.id, (orderId, listedDate) => brumiloAmazon.readOrder(orderId, listedDate), [id, date]);
            if (await needsUser(read)) return;

            if (!read?.order) {
                console.log('Brumilo Amazon sync - could not read', id);
                skipped++;
            } else if (read.order.order_date < since) {
                break; // Newest first, so the rest are older still.
            } else {
                orders.push({ ...read.order, charges: charges.get(id) ?? read.order.charges });
            }
        }

        console.log('Brumilo Amazon sync - done', { read: orders.length, skipped });
        tell(port, { type: 'done', orders, skipped, listed: listed.orders.length });
    } catch (e) {
        console.error('Brumilo Amazon sync failed', e);
        tell(port, { type: 'error', error: 'failed', message: `Couldn't read your Amazon orders (${e.message}).` });
    } finally {
        if (stillWanted(port)) current = null;
        if (!keepTab) chrome.tabs.remove(tab.id).catch(() => {});
    }
}

chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'amazon-sync' || !BRUMILO.some((pattern) => pattern.test(port.sender?.url ?? ''))) {
        port.disconnect();
        return;
    }

    port.onMessage.addListener(({ since }) => {
        if (current) {
            port.postMessage({ type: 'error', error: 'busy', message: 'A sync is already running in another tab.' });
            return;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(since ?? '')) {
            port.postMessage({ type: 'error', error: 'failed', message: 'No start date for the sync.' });
            return;
        }
        sync(port, since);
    });

    // The Brumilo tab went away - stop reading Amazon.
    port.onDisconnect.addListener(() => {
        if (current?.port === port) {
            chrome.tabs.remove(current.tabId).catch(() => {});
            current = null;
        }
    });
});

// Progress from the Amazon tab while it lists orders, passed on to the page.
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.type === 'amazon-progress' && current && sender.tab?.id === current.tabId) {
        tell(current.port, { type: 'progress', message: message.message });
    }
});
