import type { PluralForms } from "@/lib/locales";

import type { AuthErrorCode, Dictionary } from "./en";

const errors: Record<AuthErrorCode, string> = {
  generic: "Щось пішло не так, спробуйте ще раз",
  INVALID_EMAIL_OR_PASSWORD: "Неправильна пошта або пароль",
  USER_ALREADY_EXISTS: "Користувач із такою поштою вже зареєстрований",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Користувач із такою поштою вже зареєстрований",
  PASSWORD_TOO_SHORT: "Пароль занадто короткий — мінімум 8 символів",
  PASSWORD_TOO_LONG: "Пароль занадто довгий",
  INVALID_EMAIL: "Некоректна адреса пошти",
  EMAIL_NOT_VERIFIED: "Пошта не підтверджена",
};

const remaining: PluralForms = {
  one: "Ще {count} дієслово до мети",
  few: "Ще {count} дієслова до мети",
  many: "Ще {count} дієслів до мети",
  other: "Ще {count} дієслова до мети",
};

const verbCount: PluralForms = {
  one: "{count} дієслово",
  few: "{count} дієслова",
  many: "{count} дієслів",
  other: "{count} дієслова",
};

const uk: Dictionary = {
  meta: {
    title: "Irregular Verbs — англійські неправильні дієслова",
    titleTemplate: "%s — Irregular Verbs",
    description: "Вивчення англійських неправильних дієслів",
    dashboard: "Кабінет",
    signUp: "Реєстрація",
    comingSoon: "Незабаром",
    verbGroups: "Групи дієслів",
  },
  common: {
    appName: "Irregular Verbs",
    tagline: "Вивчення англійських неправильних дієслів",
    language: "Мова",
  },
  auth: {
    namePlaceholder: "Ім'я",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Пароль",
    showPassword: "Показати пароль",
    hidePassword: "Приховати пароль",
    signIn: "Увійти",
    signingIn: "Входимо…",
    signUp: "Створити акаунт",
    signingUp: "Створюємо…",
    noAccount: "Немає акаунта?",
    haveAccount: "Вже є акаунт?",
    signOut: "Вийти",
    signUpTitle: "Створити акаунт",
    signUpSubtitle: "Реєструйтеся та вчіть дієслова щодня",
    errors,
  },
  home: {
    featureDaily: "Щоденна практика",
    featureStreak: "Покращуйте серію",
    featureProgress: "Відстежуйте прогрес",
    footer: "Вчіть неправильні дієслова щодня",
  },
  install: {
    title: "Установити застосунок",
    subtitle: "Зі своєю іконкою та в окремому вікні — як звичайний застосунок.",
    iosHint: "У Safari: «Поділитися» → «На Початковий екран»",
    action: "Установити",
    dismiss: "Закрити",
  },
  dashboard: {
    greeting: "Привіт, {name}!",
    greetingNote: "Чудова робота! Продовжуй у тому ж дусі.",
    statVerbs: "дієслів вивчено",
    statDays: "днів поспіль",
    statSessions: "сесій пройдено",
    statLevel: "Рівень",
    statLevelName: "Середній",
    continueTitle: "Продовжити навчання",
    continueSubtitle: "Поточний тренажер",
    trainerName: "Три форми дієслів",
    trainerKind: "Картки",
    continueAction: "Продовжити",
    todayTitle: "Сьогодні",
    todayGoal: "Щоденна мета",
    changeGoal: "Змінити мету",
    verbs: "дієслів",
    remaining,
    quickAccess: "Швидкий доступ",
    trainers: "Тренажери",
    verbList: "Список дієслів",
    review: "Повторення",
    settings: "Налаштування",
    navHome: "Головна",
    navTrainers: "Тренажери",
    navProgress: "Прогрес",
    navProfile: "Профіль",
  },
  comingSoon: {
    title: "Незабаром!",
    text: "Цей розділ ще в розробці — зовсім скоро тут з'явиться щось корисне.",
    back: "Повернутися в кабінет",
  },
  verbGroups: {
    title: "Групи дієслів",
    subtitle: "Усі неправильні дієслова, розбиті за логічними патернами",
    count: verbCount,
    back: "Усі групи",
    backToDashboard: "Повернутися в кабінет",
    empty: "У цій групі поки немає дієслів",
  },
};

export default uk;