import {
  BookOpen,
  Dumbbell,
  WalletCards,
  Brain,
  CircleCheck,
  Eye,
  Headphones,
  Image as ImageIcon,
  Lightbulb,
  ListChecks,
  ListOrdered,
  Shuffle,
  Volume2,
  PenLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Иконки шагов инструкции «Как работает тренажёр». В settings хранится имя
 * (kebab-case, как у lucide), здесь — какие имена тренажёры умеют рисовать.
 * Один список на все тренажёры: админка предлагает выбор только из него,
 * поэтому новая иконка добавляется сюда, а не в компонент тренажёра.
 */
export const stepIcons: Record<string, LucideIcon> = {
  eye: Eye,
  brain: Brain,
  "circle-check": CircleCheck,
  "book-open": BookOpen,
  "list-checks": ListChecks,
  lightbulb: Lightbulb,
  pencil: PenLine,
  shuffle: Shuffle,
  volume: Volume2,
};

/**
 * Иконка самого тренажёра по его key — одна на список тренажёров в
 * приложении и на админку, чтобы картинки не разъезжались. Для тренажёра
 * без своей иконки — нейтральная гантель.
 */
const trainerIcons: Record<string, LucideIcon> = {
  flashcards: WalletCards,
  "multiple-choice": ListChecks,
  "fill-blanks": PenLine,
  "word-order": ListOrdered,
  "picture-match": ImageIcon,
  listening: Headphones,
};

export function trainerIcon(key: string): LucideIcon {
  return (Object.hasOwn(trainerIcons, key) && trainerIcons[key]) || Dumbbell;
}

/** Неизвестное имя (опечатка, иконка из старых данных) не роняет инструкцию. */
export const fallbackStepIcon = Sparkles;

export function stepIcon(name: string): LucideIcon {
  return (Object.hasOwn(stepIcons, name) && stepIcons[name]) || fallbackStepIcon;
}
