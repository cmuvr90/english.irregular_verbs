import {
  type Icon,
  IconBrain,
  IconChoice,
  IconCorrect,
  IconFillBlanks,
  IconFlashcards,
  IconHint,
  IconListening,
  IconPen,
  IconPicture,
  IconShow,
  IconShuffle,
  IconSparkle,
  IconSpeaker,
  IconTrainers,
  IconVerbs,
  IconWordOrder,
} from "./icons";
import type { Tone } from "./tones";

/**
 * Иконки и цвета тренажёров в дизайн-системе. Имена шагов совпадают с теми,
 * что хранит settings и предлагает админка (src/lib/trainer-icons.ts), —
 * там остаются lucide-иконки для админки, здесь их Phosphor-двойники.
 */
const stepIcons: Record<string, Icon> = {
  eye: IconShow,
  brain: IconBrain,
  "circle-check": IconCorrect,
  "book-open": IconVerbs,
  "list-checks": IconChoice,
  lightbulb: IconHint,
  pencil: IconPen,
  shuffle: IconShuffle,
  volume: IconSpeaker,
};

/** Неизвестное имя (опечатка, старые данные) не роняет инструкцию. */
export function stepIcon(name: string): Icon {
  return (Object.hasOwn(stepIcons, name) && stepIcons[name]) || IconSparkle;
}

const trainers: Record<string, { icon: Icon; tone: Tone }> = {
  flashcards: { icon: IconFlashcards, tone: "v3" },
  "multiple-choice": { icon: IconChoice, tone: "v1" },
  "fill-blanks": { icon: IconFillBlanks, tone: "v2" },
  "word-order": { icon: IconWordOrder, tone: "ink" },
  "picture-match": { icon: IconPicture, tone: "success" },
  listening: { icon: IconListening, tone: "gold" },
};

/** Иконка и тон тренажёра по key; для тренажёра без своей пары — нейтральная гантель. */
export function trainerLook(key: string): { icon: Icon; tone: Tone } {
  return (Object.hasOwn(trainers, key) && trainers[key]) || { icon: IconTrainers, tone: "mist" };
}
