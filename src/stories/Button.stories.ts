import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button';

/** Button stories used by the manager-docs example pages. */
const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Large',
  },
};

export const Clicked: Story = {
  args: {
    primary: true,
    label: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Click me' }));
    await expect(canvas.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  args: {
    primary: true,
    label: 'Mobile',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
