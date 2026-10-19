# Nadeem Ahmad · Portfolio

Personal site of Nadeem Ahmad, full stack developer (Salesforce and Java).

Live: https://nadeemci7.github.io/Portfolio/

Built with React, TypeScript, Vite, three.js (react-three-fiber, Rapier physics) and Motion.

## Run it locally

```bash
npm install
npm run dev      # http://127.0.0.1:5173
```

## Change the content

All text, projects, timeline and skills live in `src/data.ts`. To add a project, copy one
block in `PROJECTS` and edit it. The CV files are in `public/cv/` (the `.tex` source opens in Overleaf).

## Colour themes

Try a theme with `?theme=` in the address, for example `http://127.0.0.1:5173/?theme=lime`.
Themes: `night`, `studio`, `lime`, `lime-light`, `cobalt`, `brutal`, `ink`.
Set the default in `src/theme.ts`.

## Publish

The site is served by GitHub Pages from the `gh-pages` branch, which holds the built files.

```bash
npm run build
```

then push the contents of `dist/` to the `gh-pages` branch.
