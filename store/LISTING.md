# Chrome Web Store listing - Brumilo

Paste-ready text for the Developer Dashboard
(https://chrome.google.com/webstore/devconsole). Upload `dist\brumilo-extension-<version>.zip`
from `.\build.ps1`.

## Account

- Publisher name: Solutions Resource Group
- Contact email: admin@srgstl.com
- Trader: yes - TMS73 LLC (business address, admin@srgstl.com)
- Verified domain: brumilo.com (via Google Search Console)

## Store listing tab

**Title** (from manifest): Brumilo

**Summary** (from manifest, max 132 chars):
Shows what each card charge was for in your Brumilo books, starting with your Amazon order history.

**Description:**

```
Your bank statement just says "Amazon" - Brumilo shows what you actually bought.

Card statements show a store name and a total. The Brumilo extension fills in the detail: when you sync from Brumilo (brumilo.com), it reads your online order history right in your own browser and matches each order to the card charges in your Brumilo books, so every charge shows the items it paid for and is easy to categorize. Amazon is the first supported store, with more to come.

How it works
- In Brumilo, go to Accounting > Configuration > Import and click Sync from Amazon.
- The extension opens your Amazon orders in a background tab, using the Amazon account you're already signed in to.
- Brumilo matches each order to its card charges by amount and date, and shows you the matches to review before anything changes in your books.
- Don't like the result? Undo removes everything the sync added.

Private by design
- Your store password never leaves the store. Nothing signs in for you - the extension only reads pages you can already see.
- It reads only order numbers, dates, totals, item names and quantities, and the date and amount of each card charge, for the period you choose.
- It runs only when you start a sync from Brumilo, sends what it reads only to your Brumilo account, and has no tracking or analytics.

Requires a Brumilo account with Accounting and an account with a supported store (today: amazon.com). Works in Google Chrome and Microsoft Edge on desktop.

Questions? admin@brumilo.com
Privacy policy: https://brumilo.com/privacy/#browser-extension
```

**Category:** Productivity (Tools also fits)

**Language:** English (United States)

**Graphics:**
- Store icon 128x128: `store/store-icon-128.png` (96x96 artwork + 16px transparent padding, per store guidelines)
- Small promo tile 440x280: `store/promo-440x280.png`
- Screenshots 1280x800, in this order:
  1. `store/store-image-1.png` - the review screen with matched charges
     (item names, order numbers and card digits replaced with sample data)
  2. `store/store-image-2.png` - the Import page's Sync from Amazon panel

**Official URL:** https://brumilo.com (after verifying the domain)
**Homepage URL:** https://brumilo.com
**Support URL:** mailto:admin@srgstl.com (or https://brumilo.com/about/)

## Privacy practices tab

**Single purpose:**

```
Imports the user's own online order history from supported stores (currently Amazon) into their Brumilo account so Brumilo can show what each card charge paid for.
```

**Permission justification - scripting:**

```
Used to run the extension's own bundled script (amazon.js) in a background amazon.com tab that the extension opens when the user starts a sync from Brumilo. The script reads the user's order list, order details and card charges from those pages. No code is downloaded or run from anywhere else.
```

**Permission justification - host permission (https://www.amazon.com/*):**

```
Needed to open and read the signed-in user's own Amazon pages (Your Orders, each order's details page, and Your Payments > Transactions), and to let the Brumilo web app (app.brumilo.com) start a sync and receive its results. The extension reads nothing on amazon.com until the user starts a sync from Brumilo, and it never submits forms or changes anything on Amazon.
```

**Content script on app.brumilo.com / app-dev.brumilo.com** (if asked):

```
A small script on Brumilo's own web app lets the Brumilo page start a sync and receive its results. It only exchanges messages with the Brumilo page and does not read the page's content.
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

**Privacy policy URL:** https://brumilo.com/privacy/

## Distribution tab

- Visibility: Unlisted (anyone with the link can install it; switch to Public later)
- Regions: all regions (or United States only - it only reads amazon.com)

## Test instructions for the reviewer (Test instructions tab)

```
The extension needs a Brumilo account and an Amazon account with orders.
1. Sign in at https://app.brumilo.com/login with the test account below.
2. Go to Accounting > Configuration > Import.
3. Sign in to amazon.com in another tab, then click "Sync from Amazon" in Brumilo.
The extension reads the Amazon orders in a background tab and Brumilo shows the review screen.

Brumilo test account: <email> / <password>
```

Set up a reviewer account in a demo organization (with Accounting) before submitting,
and fill in the credentials above.

## After approval

Add the store link to the frontend build in `webapp/.github/workflows/deploy.yml`, next to
`VITE_APP_NAME`:

```
VITE_BROWSER_EXTENSION_URL="https://chromewebstore.google.com/detail/<id>"
```
