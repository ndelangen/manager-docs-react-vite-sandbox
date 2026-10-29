import { defineMain } from '@storybook/react-vite/node';

// Vite 8's Rolldown `builtin:vite-react-refresh-wrapper` 500s Storybook's iframe.html
// (`Missing field moduleType`). Component edits full-reload instead of Fast Refresh.
function withoutReactRefreshWrapper(plugins: unknown): unknown[] {
  if (!Array.isArray(plugins)) {
    return plugins ? [plugins] : [];
  }
  return plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) {
      return withoutReactRefreshWrapper(plugin);
    }
    if (
      plugin &&
      typeof plugin === 'object' &&
      'name' in plugin &&
      (plugin as { name: string }).name === 'vite:react:refresh-wrapper'
    ) {
      return [];
    }
    return [plugin];
  });
}

export default defineMain({
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/experimental-addon-manager-docs',
  ],
  framework: '@storybook/react-vite',
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
  },
  viteFinal: (config) => ({
    ...config,
    plugins: withoutReactRefreshWrapper(config.plugins),
    resolve: {
      ...config.resolve,
      dedupe: [...new Set([...(config.resolve?.dedupe ?? []), 'react', 'react-dom'])],
    },
    optimizeDeps: {
      ...config.optimizeDeps,
      force: true,
    },
    server: {
      ...config.server,
      fs: {
        ...config.server?.fs,
        allow: ['src', 'node_modules', ...(config.server?.fs?.allow || [])],
      },
    },
  }),
});
