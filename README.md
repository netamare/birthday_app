# Birthday Surprise

A responsive birthday page built with React, TypeScript, and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Make it yours

- Edit `src/birthday.ts` to change the nickname, birthday date, secret entrance, birthday notes, gallery captions/photos, timeline, quiz, all 100 reasons, treasure clues, awards, vault passphrase, and final letter.
- A date can be set in that file or selected in the on-page countdown; the selected date is saved in this browser.
- Add a photo under `public/memories` and set its path in `src/birthday.ts` to add it to the gallery.
- Change between blue, black, and cream themes using the theme buttons. The choice is saved in this browser.
- The music controls play a small generated tune only after the play button is pressed. Mute and volume controls work while it plays.
- The time capsule, theme, countdown date, and favorite memories are saved in this browser. The vault passphrase is a playful page gate, not secure storage.
- Type `bro` anywhere on the page to find the hidden easter egg.

Four saved photos are copied unchanged into `public/memories` for Vite to serve; the originals in the project root are left untouched.

Build for production with `npm run build`.
