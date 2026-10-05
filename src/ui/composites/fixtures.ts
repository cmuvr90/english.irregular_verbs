/**
 * Демо-данные для историй композитов и экранов. Пути картинок — те, куда
 * нужно положить сгенерированные иллюстрации (public/images/app/…).
 */
import {
  IconChoice,
  IconFillBlanks,
  IconFlashcards,
  IconHome,
  IconListening,
  IconPicture,
  IconProfile,
  IconProgress,
  IconTrainers,
  IconWordOrder,
} from "../icons";
import type { StreakDay } from "./streak-card";
import type { TabItem } from "./tab-bar";
import type { TrainerCardProps } from "./trainer-card";

export const images = {
  mascotWave: "/images/app/mascot-wave.webp",
  mascotCelebrate: "/images/app/mascot-celebrate.webp",
  emptySearch: "/images/app/empty-search.webp",
  emptyProgress: "/images/app/empty-progress.webp",
};

export const week: StreakDay[] = [
  { label: "Пн", state: "done" },
  { label: "Вт", state: "done" },
  { label: "Ср", state: "done" },
  { label: "Чт", state: "missed" },
  { label: "Пт", state: "done" },
  { label: "Сб", state: "today" },
  { label: "Вс", state: "future" },
];

export const tabs: TabItem[] = [
  { key: "home", label: "Главная", href: "#home", icon: IconHome },
  { key: "trainers", label: "Тренажёры", href: "#trainers", icon: IconTrainers },
  { key: "progress", label: "Прогресс", href: "#progress", icon: IconProgress },
  { key: "profile", label: "Профиль", href: "#profile", icon: IconProfile },
];

export const trainers: Array<Omit<TrainerCardProps, "variant">> = [
  {
    name: "Карточки",
    description: "Смотри форму — вспоминай остальные две",
    href: "#flashcards",
    icon: IconFlashcards,
    tone: "v3",
    progress: 65,
    illustration: { src: "/images/app/trainer-flashcards.webp", alt: "Стопка карточек" },
  },
  {
    name: "Выбери форму",
    description: "Три варианта — один верный",
    href: "#choice",
    icon: IconChoice,
    tone: "v1",
    progress: 40,
    illustration: { src: "/images/app/trainer-multiple-choice.webp", alt: "Три варианта ответа" },
  },
  {
    name: "Заполни пропуски",
    description: "Впиши глагол в предложение",
    href: "#blanks",
    icon: IconFillBlanks,
    tone: "v2",
    progress: 22,
    illustration: { src: "/images/app/trainer-fill-blanks.webp", alt: "Тетрадь с пропуском" },
  },
  {
    name: "Порядок слов",
    description: "Собери предложение из слов",
    href: "#order",
    icon: IconWordOrder,
    tone: "ink",
    progress: 10,
    illustration: { src: "/images/app/trainer-word-order.webp", alt: "Слова-кубики" },
  },
  {
    name: "Картинка и глагол",
    description: "Сопоставь действие и форму",
    href: "#picture",
    icon: IconPicture,
    tone: "success",
    badge: "Новый",
    progress: 0,
    illustration: { src: "/images/app/trainer-picture-match.webp", alt: "Картинка с действием" },
  },
  {
    name: "Аудирование",
    description: "Выбери глагол, который услышал",
    href: "#listening",
    icon: IconListening,
    tone: "gold",
    progress: 5,
    illustration: { src: "/images/app/trainer-listening.webp", alt: "Наушники и звуковая волна" },
  },
];
