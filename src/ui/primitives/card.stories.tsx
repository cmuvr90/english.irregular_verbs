import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { tones } from "../tones";
import { Card } from "./card";

const meta = {
  title: "Примитивы/Card",
  component: Card,
  tags: ["autodocs"],
  args: { variant: "paper", padding: "md", interactive: false, tone: "ink" },
  argTypes: {
    variant: { control: "inline-radio", options: ["paper", "sunken", "glass", "gradient", "outline", "notebook"] },
    tone: { control: "select", options: tones },
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
  },
  render: (args) => (
    <Card {...args} className="w-72">
      <p className="t-heading">Карточка</p>
      <p className="t-body-sm mt-1 opacity-75">Базовая поверхность дизайн-системы.</p>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: "Песочница" };

export const Variants: Story = {
  name: "Варианты",
  parameters: { layout: "padded" },
  render: () => (
    <div className="bg-aurora grid gap-5 rounded-2xl p-6 sm:grid-cols-3">
      {(["paper", "sunken", "glass", "outline", "notebook"] as const).map((v) => (
        <Card key={v} variant={v} className={v === "notebook" ? "pl-12" : undefined}>
          <p className="t-subheading text-fg-strong">{v}</p>
          <p className="t-body-sm mt-1 text-fg-muted">Пример содержимого</p>
        </Card>
      ))}
      <Card variant="gradient" tone="ink" interactive>
        <p className="t-subheading">gradient + interactive</p>
        <p className="t-body-sm mt-1 opacity-80">Наведи и нажми</p>
      </Card>
    </div>
  ),
};

export const GradientTones: Story = {
  name: "Градиентные тоны",
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {tones.map((tone) => (
        <Card key={tone} variant="gradient" tone={tone} interactive className="h-28">
          <p className="t-heading">{tone}</p>
        </Card>
      ))}
    </div>
  ),
};
