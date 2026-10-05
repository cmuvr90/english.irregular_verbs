"use client";

/**
 * Словарь иконок дизайн-системы (Phosphor Icons).
 *
 * Компоненты импортируют иконки отсюда, а не из пакета напрямую: так весь
 * визуальный словарь приложения виден в одном месте и в Storybook.
 * Берём SSR-сборку — она без контекста, поэтому работает и в серверных,
 * и в клиентских компонентах. Импорт поштучный, по файлу на иконку:
 * barrel-модуль пакета тянет все ~9000 вариантов и тормозит dev-сборку.
 *
 * "use client" делает каждую иконку клиентской ссылкой: серверные страницы
 * могут передавать их пропсами в клиентские композиты (icon={IconVerbs}),
 * а обычную функцию через границу RSC передать нельзя.
 *
 * Правило весов: regular — служебные иконки в тексте и кнопках,
 * duotone — смысловые иконки в цветных плашках, fill — активное состояние
 * (выбранная вкладка, выученный глагол).
 */
export type { Icon, IconProps, IconWeight } from "@phosphor-icons/react";

// навигация
export { HouseIcon as IconHome } from "@phosphor-icons/react/dist/ssr/House";
export { BarbellIcon as IconTrainers } from "@phosphor-icons/react/dist/ssr/Barbell";
export { ChartLineUpIcon as IconProgress } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
export { UserIcon as IconProfile } from "@phosphor-icons/react/dist/ssr/User";
export { ArrowLeftIcon as IconBack } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
export { ArrowRightIcon as IconNext } from "@phosphor-icons/react/dist/ssr/ArrowRight";
export { CaretRightIcon as IconChevron } from "@phosphor-icons/react/dist/ssr/CaretRight";
export { CaretLeftIcon as IconChevronLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
export { GearIcon as IconSettings } from "@phosphor-icons/react/dist/ssr/Gear";
export { MagnifyingGlassIcon as IconSearch } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
export { BellIcon as IconBell } from "@phosphor-icons/react/dist/ssr/Bell";
export { SignOutIcon as IconSignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
export { ShieldCheckIcon as IconAdmin } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
export { GlobeIcon as IconLanguage } from "@phosphor-icons/react/dist/ssr/Globe";

// учёба и тренажёры
export { BookOpenTextIcon as IconVerbs } from "@phosphor-icons/react/dist/ssr/BookOpenText";
export { BooksIcon as IconLibrary } from "@phosphor-icons/react/dist/ssr/Books";
export { CardsIcon as IconFlashcards } from "@phosphor-icons/react/dist/ssr/Cards";
export { ListChecksIcon as IconChoice } from "@phosphor-icons/react/dist/ssr/ListChecks";
export { PencilLineIcon as IconFillBlanks } from "@phosphor-icons/react/dist/ssr/PencilLine";
export { ListNumbersIcon as IconWordOrder } from "@phosphor-icons/react/dist/ssr/ListNumbers";
export { ImageSquareIcon as IconPicture } from "@phosphor-icons/react/dist/ssr/ImageSquare";
export { HeadphonesIcon as IconListening } from "@phosphor-icons/react/dist/ssr/Headphones";
export { SpeakerHighIcon as IconSpeaker } from "@phosphor-icons/react/dist/ssr/SpeakerHigh";
export { MicrophoneIcon as IconMicrophone } from "@phosphor-icons/react/dist/ssr/Microphone";
export { TranslateIcon as IconTranslate } from "@phosphor-icons/react/dist/ssr/Translate";
export { ArrowsClockwiseIcon as IconReview } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
export { BrainIcon as IconBrain } from "@phosphor-icons/react/dist/ssr/Brain";
export { LightbulbIcon as IconHint } from "@phosphor-icons/react/dist/ssr/Lightbulb";
export { EyeIcon as IconShow } from "@phosphor-icons/react/dist/ssr/Eye";
export { EyeSlashIcon as IconHide } from "@phosphor-icons/react/dist/ssr/EyeSlash";
export { ShuffleIcon as IconShuffle } from "@phosphor-icons/react/dist/ssr/Shuffle";
export { FeatherIcon as IconFeather } from "@phosphor-icons/react/dist/ssr/Feather";
export { PenNibIcon as IconPen } from "@phosphor-icons/react/dist/ssr/PenNib";

// мотивация
export { FlameIcon as IconStreak } from "@phosphor-icons/react/dist/ssr/Flame";
export { LightningIcon as IconXp } from "@phosphor-icons/react/dist/ssr/Lightning";
export { TargetIcon as IconGoal } from "@phosphor-icons/react/dist/ssr/Target";
export { TrophyIcon as IconTrophy } from "@phosphor-icons/react/dist/ssr/Trophy";
export { StarIcon as IconStar } from "@phosphor-icons/react/dist/ssr/Star";
export { CrownIcon as IconCrown } from "@phosphor-icons/react/dist/ssr/Crown";
export { MedalIcon as IconMedal } from "@phosphor-icons/react/dist/ssr/Medal";
export { SparkleIcon as IconSparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
export { ConfettiIcon as IconConfetti } from "@phosphor-icons/react/dist/ssr/Confetti";
export { RocketIcon as IconRocket } from "@phosphor-icons/react/dist/ssr/Rocket";
export { HandWavingIcon as IconWave } from "@phosphor-icons/react/dist/ssr/HandWaving";
export { HeartIcon as IconHeart } from "@phosphor-icons/react/dist/ssr/Heart";
export { SealCheckIcon as IconMastered } from "@phosphor-icons/react/dist/ssr/SealCheck";

// время
export { SunHorizonIcon as IconDawn } from "@phosphor-icons/react/dist/ssr/SunHorizon";
export { SunIcon as IconDay } from "@phosphor-icons/react/dist/ssr/Sun";
export { MoonIcon as IconDusk } from "@phosphor-icons/react/dist/ssr/Moon";
export { ClockIcon as IconClock } from "@phosphor-icons/react/dist/ssr/Clock";
export { TimerIcon as IconTimer } from "@phosphor-icons/react/dist/ssr/Timer";
export { CalendarCheckIcon as IconCalendar } from "@phosphor-icons/react/dist/ssr/CalendarCheck";

// состояния
export { CheckIcon as IconCheck } from "@phosphor-icons/react/dist/ssr/Check";
export { XIcon as IconClose } from "@phosphor-icons/react/dist/ssr/X";
export { CheckCircleIcon as IconCorrect } from "@phosphor-icons/react/dist/ssr/CheckCircle";
export { XCircleIcon as IconWrong } from "@phosphor-icons/react/dist/ssr/XCircle";
export { InfoIcon as IconInfo } from "@phosphor-icons/react/dist/ssr/Info";
export { WarningIcon as IconWarning } from "@phosphor-icons/react/dist/ssr/Warning";
export { PlusIcon as IconPlus } from "@phosphor-icons/react/dist/ssr/Plus";
export { ArrowCounterClockwiseIcon as IconUndo } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
export { PlayIcon as IconPlay } from "@phosphor-icons/react/dist/ssr/Play";
export { PauseIcon as IconPause } from "@phosphor-icons/react/dist/ssr/Pause";
export { LockIcon as IconLock } from "@phosphor-icons/react/dist/ssr/Lock";
export { EnvelopeSimpleIcon as IconMail } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
