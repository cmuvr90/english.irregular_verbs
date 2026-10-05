import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  IconChoice,
  IconFillBlanks,
  IconFlashcards,
  IconListening,
  IconMastered,
  IconStar,
  IconStreak,
  IconTrophy,
  IconVerbs,
  IconXp,
} from "../icons";
import { tones } from "../tones";
import { Badge } from "./badge";
import { iconArg } from "./icon-arg";
import { IconTile } from "./icon-tile";
import { VerbForm } from "./verb-form";

const meta = {
  title: "Примитивы/Метки и плашки",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "B1 · Intermediate", tone: "ink", variant: "soft", size: "md" },
  argTypes: {
    icon: iconArg,
    tone: { control: "select", options: tones },
    variant: { control: "inline-radio", options: ["soft", "solid", "outline"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BadgePlayground: Story = { name: "Badge", args: { icon: IconStar } };

export const BadgeMatrix: Story = {
  name: "Badge · все тоны",
  render: () => (
    <div className="flex flex-col gap-3">
      {(["soft", "solid", "outline"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="gold" variant="solid" icon={IconXp}>+120 XP</Badge>
        <Badge tone="v2" icon={IconStreak}>7 дней</Badge>
        <Badge tone="success" icon={IconMastered}>Выучен</Badge>
        <Badge tone="danger" size="sm">повторить</Badge>
        <Badge tone="ink" variant="outline" size="sm">новое</Badge>
      </div>
    </div>
  ),
};

export const IconTiles: Story = {
  name: "IconTile",
  render: () => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        {tones.map((tone) => (
          <IconTile key={tone} icon={IconVerbs} tone={tone} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {tones.map((tone) => (
          <IconTile key={tone} icon={IconTrophy} tone={tone} variant="solid" />
        ))}
      </div>
      <div className="flex items-end gap-3">
        <IconTile icon={IconFlashcards} tone="v3" size="sm" />
        <IconTile icon={IconChoice} tone="v1" size="md" />
        <IconTile icon={IconFillBlanks} tone="v2" size="lg" />
        <IconTile icon={IconListening} tone="ink" size="xl" variant="solid" />
      </div>
    </div>
  ),
};

export const VerbForms: Story = {
  name: "VerbForm",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <VerbForm form="v1" word="begin" />
        <VerbForm form="v2" word="began" />
        <VerbForm form="v3" word="begun" />
      </div>
      <div className="flex flex-wrap gap-2">
        <VerbForm form="v1" size="sm" />
        <VerbForm form="v2" size="sm" />
        <VerbForm form="v3" size="sm" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <VerbForm form="v1" word="write" size="lg" />
        <VerbForm form="v2" word="wrote" size="lg" />
        <VerbForm form="v3" word="written" size="lg" />
      </div>
      <div className="flex flex-col gap-2">
        <VerbForm form="v1" variant="label" />
        <VerbForm form="v2" variant="label" />
        <VerbForm form="v3" variant="label" />
      </div>
      <p className="t-body text-fg">
        She has <VerbForm form="v3" word="written" variant="text" size="sm" /> three letters since she{" "}
        <VerbForm form="v2" word="came" variant="text" size="sm" /> home.
      </p>
    </div>
  ),
};
