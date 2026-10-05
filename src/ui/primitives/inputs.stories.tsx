import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { IconChoice, IconFlashcards, IconHide, IconLock, IconMail, IconMicrophone, IconSearch, IconShow } from "../icons";
import { Avatar } from "./avatar";
import { IconButton } from "./icon-button";
import { SegmentedControl } from "./segmented-control";
import { Switch } from "./switch";
import { TextField } from "./text-field";

const meta = {
  title: "Примитивы/Ввод",
  component: TextField,
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "you@example.com", icon: IconMail },
  argTypes: { icon: { control: false }, action: { control: false } },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Field: Story = { name: "TextField" };

export const FieldStates: Story = {
  name: "TextField · состояния",
  render: function Render() {
    const [show, setShow] = useState(false);
    return (
      <div className="flex flex-col gap-5">
        <TextField placeholder="Найти глагол" icon={IconSearch} />
        <TextField
          label="Пароль"
          type={show ? "text" : "password"}
          defaultValue="secret-pass"
          icon={IconLock}
          hint="Минимум 8 символов"
          action={
            <IconButton
              icon={show ? IconHide : IconShow}
              label={show ? "Скрыть пароль" : "Показать пароль"}
              variant="ghost"
              size="sm"
              onClick={() => setShow((v) => !v)}
            />
          }
        />
        <TextField label="Email" defaultValue="hello@" icon={IconMail} error="Проверь адрес почты" />
      </div>
    );
  },
};

export const AnswerField: Story = {
  name: "TextField · ответ",
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField
        variant="answer"
        placeholder="V2 от «go»"
        aria-label="Ответ"
        action={<IconButton icon={IconMicrophone} label="Ответить голосом" variant="soft" size="sm" />}
      />
      <TextField variant="answer" defaultValue="goed" aria-label="Ответ" error="Почти! Это неправильный глагол" />
    </div>
  ),
};

export const Toggles: Story = {
  name: "Switch и SegmentedControl",
  render: function Render() {
    const [sound, setSound] = useState(true);
    const [remind, setRemind] = useState(false);
    const [mode, setMode] = useState<"cards" | "test">("cards");
    const [range, setRange] = useState<"week" | "month" | "all">("week");
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Switch checked={sound} onChange={setSound} label="Звуки ответов" showLabel />
          <Switch checked={remind} onChange={setRemind} label="Напоминание в 19:00" showLabel />
          <Switch checked disabled onChange={() => {}} label="Недоступно" showLabel />
        </div>
        <SegmentedControl
          label="Режим"
          value={mode}
          onChange={setMode}
          options={[
            { value: "cards", label: "Карточки", icon: IconFlashcards },
            { value: "test", label: "Тест", icon: IconChoice },
          ]}
          className="w-full"
        />
        <SegmentedControl
          label="Период"
          size="sm"
          value={range}
          onChange={setRange}
          options={[
            { value: "week", label: "Неделя" },
            { value: "month", label: "Месяц" },
            { value: "all", label: "Всё время" },
          ]}
        />
      </div>
    );
  },
};

export const Avatars: Story = {
  name: "Avatar",
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar name="Eugene S" size="sm" />
      <Avatar name="Anna Kowalska" size="md" />
      <Avatar name="Oleh" size="lg" ring="gold" />
      <Avatar name="Maria Ivanova" size="xl" ring="ink" />
    </div>
  ),
};
