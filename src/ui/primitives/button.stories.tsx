import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { fn } from "storybook/test";

import { IconAdmin, IconBell, IconCheck, IconClose, IconNext, IconPlay, IconSettings, IconSpeaker } from "../icons";
import { Button } from "./button";
import { buttonClass } from "./button-styles";
import { IconButton } from "./icon-button";
import { IconButtonLink } from "./icon-button-link";
import { iconArg } from "./icon-arg";

const meta = {
  title: "Примитивы/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Продолжить", variant: "primary", size: "md", onClick: fn() },
  argTypes: {
    icon: iconArg,
    iconRight: iconArg,
    variant: { control: "inline-radio", options: ["primary", "success", "danger", "secondary", "inverse", "soft", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Тактильная кнопка: основные варианты стоят на цветном бортике и «проваливаются» при нажатии. soft/ghost — плоские, пружинят масштабом. Для ссылок — `buttonClass()` на next/link.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: "Песочница", args: { iconRight: IconNext } };

export const Variants: Story = {
  name: "Варианты",
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} variant="primary">Продолжить</Button>
      <Button {...args} variant="success" icon={IconCheck}>Проверить</Button>
      <Button {...args} variant="danger">Сбросить прогресс</Button>
      <Button {...args} variant="secondary">Пропустить</Button>
      <Button {...args} variant="soft" icon={IconSpeaker}>Послушать</Button>
      <Button {...args} variant="ghost">Позже</Button>
      <div className="grain rounded-xl bg-grad-ink p-4">
        <Button {...args} variant="inverse" iconRight={IconNext}>На цветном</Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "Размеры",
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} size="sm">Маленькая</Button>
      <Button {...args} size="md">Средняя</Button>
      <Button {...args} size="lg" icon={IconPlay}>Начать урок</Button>
    </div>
  ),
};

export const States: Story = {
  name: "Состояния",
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      <Button {...args} block loading>Сохраняем</Button>
      <Button {...args} block disabled>Выбери ответ</Button>
      <Button {...args} block variant="success" iconRight={IconNext}>Дальше</Button>
    </div>
  ),
};

export const AsLink: Story = {
  name: "Как ссылка",
  render: () => (
    <Link href="/trainers" className={buttonClass({ variant: "primary", size: "lg" })}>
      К тренажёрам
      <IconNext size={20} weight="bold" />
    </Link>
  ),
};

export const IconButtons: Story = {
  name: "IconButton",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <IconButton icon={IconBell} label="Уведомления" badge={3} />
        <IconButton icon={IconSettings} label="Настройки" variant="glass" />
        <IconButton icon={IconSpeaker} label="Произнести" variant="soft" />
        <IconButton icon={IconClose} label="Закрыть" variant="ghost" />
        <IconButtonLink href="/admin" icon={IconAdmin} label="Админка (ссылка)" />
      </div>
      <div className="grain flex items-center gap-3 rounded-xl bg-grad-ink p-4">
        <IconButton icon={IconSpeaker} label="Произнести" variant="tint" />
        <IconButton icon={IconClose} label="Закрыть" variant="tint" size="sm" />
      </div>
    </div>
  ),
};
