import type { Locale } from "../../src/lib/locales";

import type { LocalizedText } from "./groups";

/** Шаг инструкции «Как работает тренажёр». icon — имя иконки lucide (kebab-case). */
export type TrainerStep = {
  position: number;
  icon: string;
  name: string;
  description: string;
};

export type TrainerSettings = {
  hint: string;
  steps: TrainerStep[];
};

export type SeedTrainer = {
  key: string;
  name: LocalizedText;
  description: LocalizedText;
  settings: Record<Locale, TrainerSettings>;
};

export const trainers: SeedTrainer[] = [
  {
    key: "flashcards",
    name: {
      en: "Flashcards",
      be: "Карткі",
      uk: "Картки",
      pl: "Fiszki",
      ru: "Карточки",
    },
    description: {
      en: "Learn the three verb forms with spaced-repetition flashcards.",
      be: "Вучы тры формы дзеясловаў па картках з інтэрвальным паўтарэннем.",
      uk: "Вчи три форми дієслів за картками з інтервальним повторенням.",
      pl: "Ucz się trzech form czasowników z fiszkami i powtórkami interwałowymi.",
      ru: "Учи три формы глаголов по карточкам с интервальным повторением.",
    },
    settings: {
      en: {
        hint: "Tap to show the answer",
        steps: [
          { position: 1, icon: "eye", name: "Look at the word", description: "A verb appears on the card." },
          { position: 2, icon: "brain", name: "Recall the translation and forms", description: "Try to name the translation and all 3 forms." },
          { position: 3, icon: "circle-check", name: "Rate yourself", description: "Tap “I know” or “Repeat”." },
        ],
      },
      be: {
        hint: "Націсніце, каб паказаць адказ",
        steps: [
          { position: 1, icon: "eye", name: "Глядзі на слова", description: "На картцы з'яўляецца дзеяслоў." },
          { position: 2, icon: "brain", name: "Успомні пераклад і формы", description: "Паспрабуй назваць пераклад і 3 формы дзеяслова." },
          { position: 3, icon: "circle-check", name: "Ацані сябе", description: "Націсні «Ведаю» або «Паўтарыць»." },
        ],
      },
      uk: {
        hint: "Натисніть, щоб показати відповідь",
        steps: [
          { position: 1, icon: "eye", name: "Дивись на слово", description: "На картці з'являється дієслово." },
          { position: 2, icon: "brain", name: "Згадай переклад і форми", description: "Спробуй назвати переклад і 3 форми дієслова." },
          { position: 3, icon: "circle-check", name: "Оціни себе", description: "Натисни «Знаю» або «Повторити»." },
        ],
      },
      pl: {
        hint: "Naciśnij, aby zobaczyć odpowiedź",
        steps: [
          { position: 1, icon: "eye", name: "Patrz na słowo", description: "Na karcie pojawia się czasownik." },
          { position: 2, icon: "brain", name: "Przypomnij sobie tłumaczenie i formy", description: "Spróbuj podać tłumaczenie i 3 formy czasownika." },
          { position: 3, icon: "circle-check", name: "Oceń się", description: "Naciśnij „Wiem” albo „Powtórz”." },
        ],
      },
      ru: {
        hint: "Нажмите, чтобы показать ответ",
        steps: [
          { position: 1, icon: "eye", name: "Смотри на слово", description: "На карточке появляется глагол." },
          { position: 2, icon: "brain", name: "Вспомни перевод и формы", description: "Попробуй назвать перевод и 3 формы глагола." },
          { position: 3, icon: "circle-check", name: "Оцени себя", description: "Нажми «Знаю» или «Повторить»." },
        ],
      },
    },
  },
];
