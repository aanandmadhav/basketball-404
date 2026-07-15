# Basketball 404

A playful lost-user experience where navigation becomes a tiny basketball game. Route balls fall with gravity, collide, and can be dragged or flicked through a layered hoop to open a page.

[View the original live 404](https://aanandmadhav.com/this-page-does-not-exist) · [Open in StackBlitz](https://stackblitz.com/github/aanandmadhav/basketball-404?file=src%2Fdestinations.ts)

Created by [Aanand Madhav](https://aanandmadhav.com).

## Why this exists

Most 404 pages stop at an apology and a home link. This one turns recovery into interaction without sacrificing accessibility:

- Hand-built, dependency-free 2D physics
- Drag, flick, collision, bounce, and rim-crossing detection
- Navigation only after a deliberate throw through the hoop
- Layered backboard and net so a scored ball appears to pass through
- Initial-animation guard so falling balls cannot navigate accidentally
- Keyboard and reduced-motion visitors get simple clickable balls
- Responsive desktop and mobile layouts

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Make it yours

1. Edit `src/destinations.ts` to change ball labels and destination URLs.
2. Edit the heading and supporting copy near the bottom of `src/App.tsx`.
3. Change the color variables and ball tones in `src/styles.css`.
4. Replace the studio and hoop files in `public/assets` if you want a different visual world.

The project deliberately keeps its customization surface small. No physics package is required.

## Use it in a real site

This repository is a standalone React/Vite demo. The original production version is a route-scoped Next.js component, so its animation code and assets load only on the 404 route instead of slowing down the rest of the website.

For Next.js, move the component into your app and render it from `app/not-found.tsx`. Replace `window.location.assign(...)` with your router if you want client-side navigation.

## Adapt it with an AI coding tool

[`PROMPT.md`](./PROMPT.md) contains a reusable brief. Give it to your coding assistant together with your site’s design tokens and navigation list, then ask it to integrate the experience into your framework.

## License

[MIT](./LICENSE). Use it, remix it, and make the lost corner of your site more memorable. A credit or link back is appreciated, but not required.
