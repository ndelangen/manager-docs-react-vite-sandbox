# manager-docs-react-vite

Isolated Storybook sandbox for `@storybook/experimental-addon-manager-docs`.

Generated from `react-vite/default-ts` with `--skip-template-stories`, then wired to the in-repo experimental addon. It is not Mealdrop.

## Run

From the Storybook monorepo root:

```bash
cd sandbox/manager-docs-react-vite
yarn storybook --port 6008 --ci
```

Docs pages:

- http://127.0.0.1:6008/?path=/docs/stories-button--docs
- http://127.0.0.1:6008/?path=/docs/stories-sizing--docs

Do not use ports 6011 or 6012.

Vite 8's Rolldown React Fast Refresh wrapper 500s Storybook `iframe.html` (`Missing field moduleType`). `.storybook/main.ts` removes that plugin; component edits full-reload instead of Fast Refresh. `resolve.dedupe` for `react` / `react-dom` keeps the production preview on one React copy.

## Static build

```bash
cd sandbox/manager-docs-react-vite
yarn build-storybook
```

Output is `storybook-static/`. Story frames load MDX from `manager-docs.json`. Custom component blocks load from `manager-docs-blocks.js`.

A same-stories control using `@storybook/addon-docs` (no manager-docs MDX) lives in `.storybook-addon-docs` and builds with:

```bash
yarn build-storybook -c .storybook-addon-docs -o storybook-static-addon-docs
```

## Regenerate

```bash
STORYBOOK_SANDBOX_ROOT=./sandbox yarn task --task sandbox --template react-vite/default-ts --dir manager-docs-react-vite --skip-template-stories --start-from auto
```

Then restore the manager-docs addons, stories, and MDX in this folder. `/sandbox` is gitignored.
