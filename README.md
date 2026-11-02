# manager-docs-react-vite

Isolated Storybook sandbox for `@storybook/experimental-addon-manager-docs`.

Generated from `react-vite/default-ts` with `--skip-template-stories`, then wired to the in-repo experimental addon. It is not Mealdrop.

This is a prototype, not a ship proposal. The addon is unpublished. You cannot install it with `npx storybook@latest add`.

Yarn `portal:` resolutions in `package.json` point at `../../code/...`. This repo has to live at `sandbox/manager-docs-react-vite` inside a Storybook checkout. A standalone clone will not install or run.

## Try it locally

Commands below are the source of truth for this spike.

### 1. Check out Storybook

The addon lives on `norbert/0423fe9b` in [storybookjs/storybook](https://github.com/storybookjs/storybook).

Compare: https://github.com/storybookjs/storybook/compare/next...norbert/0423fe9b

```bash
git clone git@github.com:storybookjs/storybook.git
cd storybook
git checkout norbert/0423fe9b
```

Use the Node version in `.nvmrc`. Package manager is Yarn Berry. From the Storybook repo root:

```bash
yarn
yarn nx run-many -t compile
```

Do not run `yarn start`. Do not run `yarn task dev` without an explicit sandbox template.

### 2. Clone this sandbox into that checkout

Branch: `manager-docs-iframe-pool` on [ndelangen/manager-docs-react-vite-sandbox](https://github.com/ndelangen/manager-docs-react-vite-sandbox).

Compare: https://github.com/ndelangen/manager-docs-react-vite-sandbox/compare/main...manager-docs-iframe-pool

From the Storybook repo root:

```bash
git clone -b manager-docs-iframe-pool git@github.com:ndelangen/manager-docs-react-vite-sandbox.git sandbox/manager-docs-react-vite
cd sandbox/manager-docs-react-vite
yarn
```

After `yarn`, `node_modules/@storybook/experimental-addon-manager-docs` is the monorepo package (`portal:../../code/addons/manager-docs`). The other Storybook packages in `resolutions` are the same kind of portal (or `file:` for `@storybook/addon-vitest`).

If `yarn` fails on those resolutions, the sandbox is not at `sandbox/manager-docs-react-vite` relative to a compiled Storybook checkout.

### 3. Run the sandbox Storybook

From `sandbox/manager-docs-react-vite`:

```bash
yarn storybook --port 6008 --ci
```

The `package.json` script defaults to port 6006. Pass `--port 6008` so this spike stays on the port we have been using.

Docs pages:

- http://127.0.0.1:6008/?path=/docs/stories-button--docs
- http://127.0.0.1:6008/?path=/docs/stories-sizing--docs
- http://127.0.0.1:6008/?path=/docs/stories-scale6--docs
- http://127.0.0.1:6008/?path=/docs/stories-scale12--docs
- http://127.0.0.1:6008/?path=/docs/stories-scale24--docs

The addon starts a companion Vite server for custom component blocks on Storybook's port + 1 (6009 when Storybook is on 6008). That server does not use a fixed port (`strictPort` is off). You do not open that URL yourself. Do not use ports 6011 or 6012.

Vite 8's Rolldown React Fast Refresh wrapper 500s Storybook `iframe.html` (`Missing field moduleType`). `.storybook/main.ts` removes that plugin; component edits full-reload instead of Fast Refresh. `resolve.dedupe` for `react` / `react-dom` keeps the production preview on one React copy.

### 4. Change addon code

Edit `code/addons/manager-docs` in the Storybook checkout.

The sandbox loads the addon's `dist/` (`./manager` and `./preset` export to `dist/`, not `src/`). Vite HMR does not pick up addon source edits. Recompile, then refresh or restart.

From the Storybook repo root:

```bash
yarn nx compile addon-manager-docs
```

- Manager or runtime changes: compile, then refresh the browser.
- Preset, server, or open-service changes: compile, then restart `yarn storybook --port 6008 --ci`.

Portal linking means the sandbox sees the new `dist/` immediately. There is no extra copy step.

## Static build

```bash
cd sandbox/manager-docs-react-vite
yarn build-storybook
```

Output is `storybook-static/`. Story frames load MDX from the open-service static snapshot. Custom component blocks load from `manager-docs-blocks.js`.

A same-stories control using `@storybook/addon-docs` (no manager-docs MDX) lives in `.storybook-addon-docs` and builds with:

```bash
yarn build-storybook -c .storybook-addon-docs -o storybook-static-addon-docs
```

## Regenerate

```bash
STORYBOOK_SANDBOX_ROOT=./sandbox yarn task --task sandbox --template react-vite/default-ts --dir manager-docs-react-vite --skip-template-stories --start-from auto
```

Then restore the manager-docs addons, stories, and MDX in this folder. `/sandbox` is gitignored in the Storybook repo.
