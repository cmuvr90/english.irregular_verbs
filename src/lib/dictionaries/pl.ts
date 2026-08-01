import type { PluralForms } from "@/lib/locales";

import type { AuthErrorCode, Dictionary } from "./en";

const errors: Record<AuthErrorCode, string> = {
  generic: "Coś poszło nie tak, spróbuj ponownie",
  INVALID_EMAIL_OR_PASSWORD: "Nieprawidłowy e-mail lub hasło",
  USER_ALREADY_EXISTS: "Użytkownik z tym adresem e-mail już istnieje",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Użytkownik z tym adresem e-mail już istnieje",
  PASSWORD_TOO_SHORT: "Hasło jest za krótkie — minimum 8 znaków",
  PASSWORD_TOO_LONG: "Hasło jest za długie",
  INVALID_EMAIL: "Nieprawidłowy adres e-mail",
  EMAIL_NOT_VERIFIED: "E-mail nie został potwierdzony",
};

const remaining: PluralForms = {
  one: "Jeszcze {count} czasownik do celu",
  few: "Jeszcze {count} czasowniki do celu",
  many: "Jeszcze {count} czasowników do celu",
  other: "Jeszcze {count} czasownika do celu",
};

const verbCount: PluralForms = {
  one: "{count} czasownik",
  few: "{count} czasowniki",
  many: "{count} czasowników",
  other: "{count} czasownika",
};

const pl: Dictionary = {
  meta: {
    title: "Irregular Verbs — angielskie czasowniki nieregularne",
    titleTemplate: "%s — Irregular Verbs",
    description: "Nauka angielskich czasowników nieregularnych",
    dashboard: "Panel",
    signUp: "Rejestracja",
    comingSoon: "Wkrótce",
    verbGroups: "Grupy czasowników",
    trainers: "Trenażery",
  },
  common: {
    appName: "Irregular Verbs",
    tagline: "Nauka angielskich czasowników nieregularnych",
    language: "Język",
  },
  auth: {
    namePlaceholder: "Imię",
    emailPlaceholder: "E-mail",
    passwordPlaceholder: "Hasło",
    showPassword: "Pokaż hasło",
    hidePassword: "Ukryj hasło",
    signIn: "Zaloguj się",
    signingIn: "Logowanie…",
    signUp: "Utwórz konto",
    signingUp: "Tworzenie…",
    noAccount: "Nie masz konta?",
    haveAccount: "Masz już konto?",
    signOut: "Wyloguj się",
    signUpTitle: "Utwórz konto",
    signUpSubtitle: "Zarejestruj się i ucz się czasowników każdego dnia",
    errors,
  },
  home: {
    featureDaily: "Codzienna praktyka",
    featureStreak: "Buduj serię",
    featureProgress: "Śledź postępy",
    footer: "Ucz się czasowników nieregularnych każdego dnia",
  },
  install: {
    title: "Zainstaluj aplikację",
    subtitle: "Własna ikona i osobne okno — jak zwykła aplikacja.",
    iosHint: "W Safari: „Udostępnij” → „Do ekranu początkowego”",
    action: "Zainstaluj",
    dismiss: "Zamknij",
  },
  dashboard: {
    greeting: "Cześć, {name}!",
    greetingNote: "Świetna robota! Tak trzymaj.",
    statVerbs: "wyuczonych czasowników",
    statDays: "dni z rzędu",
    statSessions: "ukończonych sesji",
    statLevel: "Poziom",
    statLevelName: "Średni",
    continueTitle: "Kontynuuj naukę",
    continueSubtitle: "Bieżący trener",
    trainerName: "Trzy formy czasownika",
    trainerKind: "Fiszki",
    continueAction: "Kontynuuj",
    todayTitle: "Dzisiaj",
    todayGoal: "Dzienny cel",
    changeGoal: "Zmień cel",
    verbs: "czasowników",
    remaining,
    quickAccess: "Szybki dostęp",
    trainers: "Trenażery",
    verbList: "Lista czasowników",
    review: "Powtórka",
    settings: "Ustawienia",
    navHome: "Główna",
    navTrainers: "Trenażery",
    navProgress: "Postępy",
    navProfile: "Profil",
  },
  comingSoon: {
    title: "Wkrótce!",
    text: "Ta sekcja jest jeszcze w budowie — już niedługo pojawi się tu coś przydatnego.",
    back: "Wróć do panelu",
  },
  trainer: {
    listTitle: "Trenażery",
    listSubtitle: "Wybierz, jak chcesz ćwiczyć",
    howItWorks: "Jak działa trener",
    showAnswer: "Pokaż odpowiedź",
    know: "Wiem",
    repeat: "Powtórz",
    practice: "Ćwicz",
    finishTitle: "Sesja ukończona!",
    finishText: "Świetna robota — tak trzymaj.",
    again: "Jeszcze raz",
    empty: "Brak czasowników do ćwiczenia",
    back: "Wstecz",
  },
  verbGroups: {
    title: "Grupy czasowników",
    subtitle: "Wszystkie czasowniki nieregularne podzielone na logiczne wzorce",
    count: verbCount,
    back: "Wszystkie grupy",
    backToDashboard: "Wróć do panelu",
    empty: "W tej grupie nie ma jeszcze czasowników",
  },
};

export default pl;