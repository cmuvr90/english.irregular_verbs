import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { IconConfetti, IconCrown, IconRocket, IconStar, IconStreak, IconTrophy } from "../icons";
import { Button } from "../primitives/button";
import { VerbForm } from "../primitives/verb-form";
import { AchievementBadge } from "./achievement-badge";
import { AnswerSheet } from "./answer-sheet";
import { EmptyState } from "./empty-state";
import { images, trainers } from "./fixtures";
import { TrainerCard } from "./trainer-card";
import { VerbCard } from "./verb-card";

const meta = {
  title: "Композиты/Обучение",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto w-full max-w-md"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrainerRows: Story = {
  name: "TrainerCard · строки",
  render: () => (
    <div className="flex flex-col gap-3">
      {trainers.map((t) => (
        <TrainerCard key={t.href} {...t} />
      ))}
    </div>
  ),
};

export const TrainerTiles: Story = {
  name: "TrainerCard · плитки",
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {trainers.map((t) => (
        <TrainerCard key={t.href} {...t} variant="tile" />
      ))}
    </div>
  ),
};

export const Verb: Story = {
  name: "VerbCard",
  render: () => (
    <div className="flex flex-col gap-4">
      <VerbCard
        forms={{ v1: "begin", v2: "began", v3: "begun" }}
        translation="начинать"
        speakLabel="Произнести"
        status={{ tone: "success", label: "Выучен" }}
      />
      <VerbCard variant="compact" forms={{ v1: "write", v2: "wrote", v3: "written" }} translation="писать" speakLabel="Произнести" status={{ tone: "danger", label: "повторить" }} />
      <VerbCard variant="compact" forms={{ v1: "go", v2: "went", v3: "gone" }} translation="идти, ехать" speakLabel="Произнести" status={{ tone: "success", label: "выучен" }} />
    </div>
  ),
};

export const Feedback: Story = {
  name: "AnswerSheet",
  render: function Render() {
    const [result, setResult] = useState<"correct" | "wrong" | null>("wrong");
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={() => setResult("correct")}>Верно</Button>
          <Button variant="danger" size="sm" onClick={() => setResult("wrong")}>Неверно</Button>
          <Button variant="secondary" size="sm" onClick={() => setResult(null)}>Скрыть</Button>
        </div>
        <div className="min-h-72">
          <AnswerSheet
            position="static"
            result={result}
            title={result === "correct" ? "Отлично!" : "Почти получилось"}
            answerLabel="Правильный ответ"
            answer={
              <div className="flex flex-wrap gap-2">
                <VerbForm form="v1" word="go" size="sm" />
                <VerbForm form="v2" word="went" size="sm" />
                <VerbForm form="v3" word="gone" size="sm" />
              </div>
            }
            explanation={result === "wrong" ? "Go — неправильный глагол: во втором времени форма went, без окончания -ed." : "+10 XP · серия ответов: 4"}
            actionLabel="Дальше"
            onAction={() => setResult(null)}
          />
        </div>
      </div>
    );
  },
};

export const Achievements: Story = {
  name: "AchievementBadge",
  render: () => (
    <div className="grid grid-cols-3 gap-y-6">
      <AchievementBadge icon={IconStreak} tone="v2" title="Неделя огня" description="7 дней подряд" progress={100} />
      <AchievementBadge icon={IconTrophy} title="Сотня" description="100 глаголов" progress={100} />
      <AchievementBadge icon={IconStar} tone="v3" title="Без ошибок" description="Сессия на 100%" progress={100} />
      <AchievementBadge icon={IconRocket} tone="v1" title="Спринт" description="50 ответов за день" progress={60} />
      <AchievementBadge icon={IconCrown} title="Мастер" description="Все 200 глаголов" progress={18} />
      <AchievementBadge icon={IconConfetti} tone="success" title="Месяц" description="30 дней подряд" progress={23} />
    </div>
  ),
};

export const Empty: Story = {
  name: "EmptyState",
  render: () => (
    <EmptyState
      illustration={{ src: images.emptySearch, alt: "Маскот с лупой" }}
      title="Ничего не нашлось"
      text="Попробуй другую форму глагола — например, «went» вместо «goed»."
      action={<Button variant="soft">Сбросить поиск</Button>}
    />
  ),
};
