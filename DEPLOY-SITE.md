# Site — deploying to GitHub Pages

**Deploy the backend first.** Then this.

## Every release

1. Go to your repository on github.com (`moborex/Moborex-Invoice`).
2. **Add file → Upload files.**
3. Drag in **every file from this folder** — including `sw.js`, `order.html` and `rider.html`,
   not just `index.html`. A partial upload leaves the ordering pages on an older version.
4. **Commit changes.**
5. Wait a minute or two for GitHub Pages to publish.

## Confirm it worked

Open the app → **Sync & Backup**. The line near the bottom reads:

    App build v75

If it shows an older number, the browser is serving a cached copy:

- **Desktop:** Ctrl + Shift + R
- **Phone:** close the app completely from the app switcher and reopen it

The app also checks for new versions itself and prompts you, so this usually resolves on its own
within a few minutes.

## Do this first after deploying

**Sync & Backup → "Check what the server has".** It lists every business on your account with its
real size and record counts, so your genuine business is obvious against any empty ones left
behind by the earlier fault. Download yours, then remove the empty ones. The screen cannot remove
anything that holds records, and the server refuses even if the button is pressed.

## Files in this folder

| File | What it is |
|---|---|
| `index.html` | the app |
| `order.html` | customer ordering page (QR and online link) |
| `rider.html` | delivery rider app |
| `sw.js` | offline support and update detection |
| `manifest.json`, icons | what the phone shows when the app is installed |

`DEPLOY-SITE.md` (this file) does not need uploading, though it does no harm.
