import type { PluralForms } from "@/lib/locales";

/**
 * Английский — язык по умолчанию и источник структуры словарей:
 * остальные локали типизированы как `Dictionary`, поэтому пропущенный
 * ключ в них — ошибка компиляции.
 */

/** Коды ошибок Better Auth + собственный `generic` на всё остальное. */
export type AuthErrorCode =
  | "generic"
  | "INVALID_EMAIL_OR_PASSWORD"
  | "USER_ALREADY_EXISTS"
  | "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_LONG"
  | "INVALID_EMAIL"
  | "EMAIL_NOT_VERIFIED";

const errors: Record<AuthErrorCode, string> = {
  generic: "Something went wrong, please try again",
  INVALID_EMAIL_OR_PASSWORD: "Wrong email or password",
  USER_ALREADY_EXISTS: "A user with this email already exists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "A user with this email already exists",
  PASSWORD_TOO_SHORT: "Password is too short — 8 characters minimum",
  PASSWORD_TOO_LONG: "Password is too long",
  INVALID_EMAIL: "Invalid email address",
  EMAIL_NOT_VERIFIED: "Email is not verified",
};

const remaining: PluralForms = {
  one: "{count} more verb to go",
  other: "{count} more verbs to go",
};

// Подписи под числами статистики дашборда — без {count}: число рисуется отдельно.
const statVerbs: PluralForms = { one: "verb learned", other: "verbs learned" };
const statDays: PluralForms = { other: "day streak" };
const statSessions: PluralForms = { one: "answer given", other: "answers given" };

const verbCount: PluralForms = {
  one: "{count} verb",
  other: "{count} verbs",
};

const en = {
  meta: {
    title: "Irregular Verbs — learn English irregular verbs",
    titleTemplate: "%s — Irregular Verbs",
    description: "Learn English irregular verbs",
    dashboard: "Dashboard",
    signUp: "Sign up",
    comingSoon: "Coming soon",
    verbGroups: "Verb groups",
    trainers: "Trainers",
  },
  common: {
    appName: "Irregular Verbs",
    tagline: "Learn English irregular verbs",
    language: "Language",
    admin: "Admin panel",
  },
  auth: {
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    signUp: "Create account",
    signingUp: "Creating…",
    noAccount: "No account?",
    haveAccount: "Already have an account?",
    signOut: "Sign out",
    signUpTitle: "Create account",
    signUpSubtitle: "Sign up and learn verbs every day",
    errors,
  },
  home: {
    featureDaily: "Daily practice",
    featureStreak: "Build your streak",
    featureProgress: "Track progress",
    footer: "Learn irregular verbs every day",
  },
  install: {
    title: "Install the app",
    subtitle: "Its own icon, its own window — just like a native app.",
    iosHint: "In Safari: Share → Add to Home Screen",
    action: "Install",
    dismiss: "Close",
  },
  dashboard: {
    greeting: "Hi, {name}!",
    greetingNote: "Great work! Keep it up.",
    greetingNoteNew: "Let's learn your first irregular verbs today.",
    statVerbs,
    statDays,
    statSessions,
    statLevel: "Level",
    levels: {
      A1: "Beginner",
      A2: "Elementary",
      B1: "Intermediate",
      B2: "Upper-Intermediate",
      C1: "Advanced",
    },
    continueTitle: "Continue learning",
    continueSubtitle: "Current trainer",
    continueProgress: "{learned} of {total} learned",
    startTitle: "Start learning",
    startSubtitle: "Begin with the first trainer",
    startAction: "Start",
    continueAction: "Continue",
    todayTitle: "Today",
    todayGoal: "Daily goal",
    changeGoal: "Change goal",
    goalDone: "Daily goal reached! 🎉",
    streakKeep: "Practice today to keep your streak going.",
    streakStart: "Answer a few cards to start a streak.",
    streakDoneToday: "Today's done — see you tomorrow!",
    verbs: "verbs",
    remaining,
    quickAccess: "Quick access",
    trainers: "Trainers",
    verbList: "Verb list",
    review: "Review",
    settings: "Settings",
    navHome: "Home",
    navTrainers: "Trainers",
    navProgress: "Progress",
    navProfile: "Profile",
  },
  comingSoon: {
    title: "Coming soon!",
    text: "This section is still in development — something useful will show up here shortly.",
    back: "Back to dashboard",
  },
  trainer: {
    listTitle: "Trainers",
    listSubtitle: "Pick how you want to practice",
    howItWorks: "How the trainer works",
    showAnswer: "Show answer",
    know: "I know",
    repeat: "Repeat",
    practice: "Practice",
    finishTitle: "Session complete!",
    finishText: "Great job — keep it up.",
    again: "One more round",
    empty: "No verbs to practice yet",
    back: "Back",
    correct: "Correct!",
    correctCount: "Correct",
    wrong: "Not quite",
    correctAnswer: "Correct answer",
    why: "Why",
    sentenceTranslation: "Translation",
    next: "Next",
    mistakes: "Mistakes",
    scoreText: "{correct} of {total} answers correct.",
    fillPlaceholder: "Type the missing form",
    check: "Check",
    yourAnswer: "Your answer",
    reset: "Clear",
    listen: "Listen",
    noSpeech: "Your browser has no English voice. Try Chrome, Edge or Safari, or install an English voice in your system settings.",
  },
  verbGroups: {
    title: "Verb groups",
    subtitle: "All irregular verbs split into logical patterns",
    count: verbCount,
    back: "All groups",
    backToDashboard: "Back to dashboard",
    empty: "No verbs in this group yet",
  },
};

export type Dictionary = typeof en;

export default en;
