import { defineMain } from '@storybook/react-vite/node';

// Same Vite 8 Rolldown workaround as `.storybook/main.ts`:
// `builtin:vite-react-refresh-wrapper` 500s iframe.html (`Missing field moduleType`).
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
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
  },
  viteFinal: (config) => ({
    ...config,
    plugins: withoutReactRefreshWrapper(config.plugins),
  }),
});
