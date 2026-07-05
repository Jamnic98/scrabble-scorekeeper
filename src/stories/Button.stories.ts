// Button.stories.ts
// Replace your-framework with the framework you are using, e.g. react-vite, nextjs, nextjs-vite, etc.
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './Button'

const meta = {
  // 👇 The component you're working on
  component: Button,
} satisfies Meta<typeof Button>

export default meta
// 👇 Type helper to reduce boilerplate
type Story = StoryObj<typeof meta>

// 👇 A story named Primary that renders `<Button primary label="Button" />`
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
}
