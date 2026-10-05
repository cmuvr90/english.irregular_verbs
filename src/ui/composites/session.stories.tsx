import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { IconBrain, IconCorrect, IconReview, IconShow, IconVerbs } from "../icons";
import { Badge } from "../primitives/badge";
import { Button } from "../primitives/button";
import { type ChoiceState, ChoiceOption } from "./choice-option";
import { images } from "./fixtures";
import { ListLink } from "./list-link";
import { SessionProgress } from "./session-progress";
import { SessionSummary } from "./session-summary";
import { TrainerSteps } from "./trainer-steps";

const meta = {
  title: "Композиты/Тренировка",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto w-full max-w-md"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Progress: Story = {
  name: "SessionProgress",
  render: () => (
    <div className="flex flex-col gap-4">
      <SessionProgress current={3} total={20} label="Карточки" />
      <SessionProgress current={14} total={20} tone="v2" label="Пропуски" />
    </div>
  ),
};

export const Steps: Story = {
  name: "TrainerSteps",
  render: () => (
    <TrainerSteps
      title="Как работает тренажёр"
      steps={[
        { position: 1, name: "Посмотри на глагол", description: "На карточке — первая форма", icon: IconShow },
        { position: 2, name: "Вспомни формы", description: "Назови V2 и V3 про себя", icon: IconBrain },
        { position: 3, name: "Проверь себя", description: "Открой ответ и оцени", icon: IconCorrect },
      ]}
    />
  ),
};

export const Options: Story = {
  name: "ChoiceOption",
  render: function Render() {
    const options = [
      { text: "went", correct: true },
      { text: "goed", correct: false },
      { text: "gone", correct: false },
    ];
    const [picked, setPicked] = useState<string | null>(null);
    const stateOf = (o: (typeof options)[number]): ChoiceState =>
      picked === null ? "idle" : o.correct ? "right" : o.text === picked ? "wrong" : "muted";
    return (
      <div className="flex flex-col gap-2.5">
        {options.map((o, i) => (
          <ChoiceOption key={o.text} letter={"abc"[i]} state={stateOf(o)} disabled={picked !== null} onClick={() => setPicked(o.text)}>
            {o.text}
          </ChoiceOption>
        ))}
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setPicked(null)}>
          Сбросить
        </Button>
      </div>
    );
  },
};

export const Summary: Story = {
  name: "SessionSummary",
  render: () => (
    <SessionSummary
      title="Сессия завершена!"
      text="Отличная работа — так держать."
      illustration={{ src: images.mascotCelebrate, alt: "Маскот празднует" }}
      stats={[
        { value: 16, label: "Знаю", tone: "success" },
        { value: 4, label: "Повторить", tone: "v2" },
      ]}
      actions={
        <>
          <Button size="lg" block icon={IconReview}>Ещё раз</Button>
          <Button size="lg" block variant="secondary">Назад</Button>
        </>
      }
    />
  ),
};

export const Links: Story = {
  name: "ListLink",
  render: () => (
    <div className="flex flex-col gap-3">
      <ListLink href="#a" icon={IconVerbs} tone="v1" title="Базовые глаголы" description="24 глагола" />
      <ListLink href="#b" icon={IconVerbs} tone="v3" title="Одна форма на все" description="12 глаголов" badge={<Badge tone="gold" variant="solid" size="sm">Новое</Badge>} progress={40} />
    </div>
  ),
};
