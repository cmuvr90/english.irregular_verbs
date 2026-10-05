import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { tones } from "../tones";
import { AnimatedNumber } from "./animated-number";
import { Button } from "./button";
import { ProgressBar } from "./progress-bar";
import { ProgressRing } from "./progress-ring";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Примитивы/Прогресс",
  component: ProgressBar,
  tags: ["autodocs"],
  args: { value: 60, tone: "ink", size: "sm", shimmer: false, label: "Прогресс" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    tone: { control: "select", options: tones },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = { name: "ProgressBar" };

export const BarTones: Story = {
  name: "ProgressBar · тоны",
  render: () => (
    <div className="flex flex-col gap-3">
      {tones.map((tone, i) => (
        <ProgressBar key={tone} tone={tone} value={30 + i * 9} label={tone} />
      ))}
      <ProgressBar tone="v2" value={72} size="lg" shimmer label="Сессия" />
    </div>
  ),
};

export const Rings: Story = {
  name: "ProgressRing",
  decorators: [(Story) => <div className="w-auto"><Story /></div>],
  render: function Render() {
    const [v, setV] = useState(65);
    return (
      <div className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-6">
          <ProgressRing value={v} tone="ink" label="Тренажёр" />
          <ProgressRing value={v * 0.8} tone="v1" size={64} thickness={7} label="V1" />
          <ProgressRing value={v * 0.6} tone="v2" size={64} thickness={7} label="V2" />
          <ProgressRing value={v * 0.4} tone="v3" size={64} thickness={7} label="V3" />
          <ProgressRing value={100} tone="success" size={96} thickness={10} label="Цель">
            <span className="t-heading text-success-700">✓</span>
          </ProgressRing>
        </div>
        <div className="grain flex items-center gap-4 rounded-xl bg-grad-ink p-4 text-white">
          <ProgressRing value={v} onColor size={76} label="На цветном" />
          <span className="t-body-sm">onColor — на цветных карточках</span>
        </div>
        <Button variant="soft" size="sm" onClick={() => setV(Math.round(Math.random() * 100))}>
          Случайное значение
        </Button>
      </div>
    );
  },
};

export const Numbers: Story = {
  name: "AnimatedNumber",
  decorators: [(Story) => <div className="w-auto"><Story /></div>],
  render: function Render() {
    const [xp, setXp] = useState(1240);
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="flex items-baseline gap-8">
          <AnimatedNumber value={152} className="t-stat text-v1-700" />
          <AnimatedNumber value={xp} suffix=" XP" className="t-stat text-grad-gold" />
        </div>
        <Button variant="soft" size="sm" onClick={() => setXp((x) => x + 50)}>
          +50 XP
        </Button>
      </div>
    );
  },
};

export const Skeletons: Story = {
  name: "Skeleton",
  render: () => (
    <div className="flex items-center gap-4 rounded-xl bg-surface p-4 shadow-sm">
      <Skeleton className="size-12 rounded-md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
      </div>
    </div>
  ),
};
