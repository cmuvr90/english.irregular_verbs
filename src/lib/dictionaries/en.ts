/**
 * Английский — язык по умолчанию и источник структуры словарей:
 * остальные локали типизированы как `Dictionary`, поэтому пропущенный
 * ключ в них — ошибка компиляции.
 */

/** Ключи — коды ошибок Better Auth (они приходят на английском). */
const errors: Record<string, string> = {
  generic: "Something went wrong, please try again",
  INVALID_EMAIL_OR_PASSWORD: "Wrong email or password",
  USER_ALREADY_EXISTS: "A user with this email already exists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "A user with this email already exists",
  PASSWORD_TOO_SHORT: "Password is too short — 8 characters minimum",
  PASSWORD_TOO_LONG: "Password is too long",
  INVALID_EMAIL: "Invalid email address",
  EMAIL_NOT_VERIFIED: "Email is not verified",
};

const en = {
  meta: {
    title: "Irregular Verbs — learn English irregular verbs",
    titleTemplate: "%s — Irregular Verbs",
    description: "Learn English irregular verbs",
    dashboard: "Dashboard",
    signUp: "Sign up",
    comingSoon: "Coming soon",
  },
  common: {
    appName: "Irregular Verbs",
    tagline: "Learn English irregular verbs",
    language: "Language",
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
    statVerbs: "verbs learned",
    statDays: "day streak",
    statSessions: "sessions done",
    statLevel: "Level",
    statLevelName: "Intermediate",
    continueTitle: "Continue learning",
    continueSubtitle: "Current trainer",
    trainerName: "Three verb forms",
    trainerKind: "Flashcards",
    continueAction: "Continue",
    todayTitle: "Today",
    todayGoal: "Daily goal",
    changeGoal: "Change goal",
    verbs: "verbs",
    remaining: "{count} more verbs to go",
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
};

export type Dictionary = typeof en;

export default en;
