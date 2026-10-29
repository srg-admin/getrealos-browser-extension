# Chrome Web Store listing - RealOS

Paste-ready text for the Developer Dashboard
(https://chrome.google.com/webstore/devconsole). Upload `dist\realos-extension-<version>.zip`
from `.\build.ps1`.

## Account

- Publisher name: Solutions Resource Group
- Contact email: admin@srgstl.com
- Trader: yes - TMS73 LLC (business address, admin@srgstl.com)
- Verified domain: getrealos.com (via Google Search Console)

## Store listing tab

**Title** (from manifest): RealOS

**Summary** (from manifest, max 132 chars):
Adds what each Amazon charge was for to your RealOS books, from your Amazon order history.

**Description:**

```
Your bank statement just says "Amazon" - RealOS shows what you actually bought.

The RealOS extension is a companion to RealOS (getrealos.com), the operating system for real estate agents. When you sync from RealOS, it reads your Amazon order history and card charges right in your own browser, and matches each order to the Amazon charges in your RealOS books - so every charge shows the items it paid for and is easy to categorize.

How it works
- In RealOS, go to Accounting > Configuration > Import and click Sync from Amazon.
- The extension opens your Amazon orders in a background tab, using the Amazon account you're already signed in to.
- RealOS matches each order to its card charges by amount and date, and shows you the matches to review before anything changes in your books.
- Don't like the result? Undo removes everything the sync added.

Private by design
- Your Amazon password never leaves Amazon. Nothing signs in for you - the extension only reads pages you can already see.
- It reads only order numbers, dates, totals, item names and quantities, and the date and amount of each card charge, for the period you choose.
- It runs only when you start a sync from RealOS, sends what it reads only to your RealOS account, and has no tracking or analytics.

Requires a RealOS account with Accounting and an amazon.com account. Works in Google Chrome and Microsoft Edge on desktop.

Questions? admin@srgstl.com
Privacy policy: https://getrealos.com/privacy/#browser-extension
```

**Category:** Productivity (Tools also fits)

**Language:** English (United States)

**Graphics:**
- Store icon 128x128: `store/store-icon-128.png` (96x96 artwork + 16px transparent padding, per store guidelines)
- Small promo tile 440x280: `store/promo-440x280.png`
- Screenshots 1280x800, in this order:
  1. `store/screenshot-2-matches.png` - the review screen with matched charges
     (item names, order numbers and card digits replaced with sample data)
  2. `store/screenshot-1-import.png` - the Import page's Sync from Amazon panel

**Official URL:** https://getrealos.com (after verifying the domain)
**Homepage URL:** https://getrealos.com
**Support URL:** mailto:admin@srgstl.com (or https://getrealos.com/about/)

## Privacy practices tab

**Single purpose:**

```
Imports the user's own Amazon order history into their RealOS account so RealOS can show what each Amazon card charge paid for.
```

**Permission justification - scripting:**

```
Used to run the extension's own bundled script (amazon.js) in a background amazon.com tab that the extension opens when the user starts a sync from RealOS. The script reads the user's order list, order details and card charges from those pages. No code is downloaded or run from anywhere else.
```

**Permission justification - host permission (https://www.amazon.com/*):**

```
Needed to open and read the signed-in user's own Amazon pages (Your Orders, each order's details page, and Your Payments > Transactions), and to let the RealOS web app (app.getrealos.com) start a sync and receive its results. The extension reads nothing on amazon.com until the user starts a sync from RealOS, and it never submits forms or changes anything on Amazon.
```

**Content script on app.getrealos.com / app-dev.getrealos.com** (if asked):

```
A small script on RealOS's own web app lets the RealOS page start a sync and receive its results. It only exchanges messages with the RealOS page and does not read the page's content.
```

**Remote code:** No, I am not using remote code.

**Data usage - what's collected** (tick these):
- Financial and payment information - the date and amount of Amazon card charges and order totals (no card numbers)
- Website content - Amazon order numbers, order dates, item names and quantities

Leave unticked: personally identifiable information, health, authentication
information, personal communications, location, web history, user activity.

**Certifications** (tick all three):
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://getrealos.com/privacy/

## Distribution tab

- Visibility: Unlisted (anyone with the link can install it; switch to Public later)
- Regions: all regions (or United States only - it only reads amazon.com)

## Test instructions for the reviewer (Test instructions tab)

```
The extension needs a RealOS account and an Amazon account with orders.
1. Sign in at https://app.getrealos.com/login with the test account below.
2. Go to Accounting > Configuration > Import.
3. Sign in to amazon.com in another tab, then click "Sync from Amazon" in RealOS.
The extension reads the Amazon orders in a background tab and RealOS shows the review screen.

RealOS test account: <email> / <password>
```

Set up a reviewer account in a demo organization (with Accounting) before submitting,
and fill in the credentials above.

## After approval

Add the store link to the frontend build in `webapp/.github/workflows/deploy.yml`, next to
`VITE_APP_NAME`:

```
VITE_BROWSER_EXTENSION_URL="https://chromewebstore.google.com/detail/<id>"
```
