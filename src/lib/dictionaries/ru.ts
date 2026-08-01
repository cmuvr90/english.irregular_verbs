import type { PluralForms } from "@/lib/locales";

import type { AuthErrorCode, Dictionary } from "./en";

const errors: Record<AuthErrorCode, string> = {
  generic: "Что-то пошло не так, попробуйте ещё раз",
  INVALID_EMAIL_OR_PASSWORD: "Неверная почта или пароль",
  USER_ALREADY_EXISTS: "Пользователь с такой почтой уже зарегистрирован",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Пользователь с такой почтой уже зарегистрирован",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий — минимум 8 символов",
  PASSWORD_TOO_LONG: "Пароль слишком длинный",
  INVALID_EMAIL: "Некорректный адрес почты",
  EMAIL_NOT_VERIFIED: "Почта не подтверждена",
};

const remaining: PluralForms = {
  one: "Ещё {count} глагол до цели",
  few: "Ещё {count} глагола до цели",
  many: "Ещё {count} глаголов до цели",
  other: "Ещё {count} глагола до цели",
};

const verbCount: PluralForms = {
  one: "{count} глагол",
  few: "{count} глагола",
  many: "{count} глаголов",
  other: "{count} глагола",
};

const ru: Dictionary = {
  meta: {
    title: "Irregular Verbs — английские неправильные глаголы",
    titleTemplate: "%s — Irregular Verbs",
    description: "Изучение английских неправильных глаголов",
    dashboard: "Кабинет",
    signUp: "Регистрация",
    comingSoon: "Скоро",
    verbGroups: "Группы глаголов",
  },
  common: {
    appName: "Irregular Verbs",
    tagline: "Изучение английских неправильных глаголов",
    language: "Язык",
  },
  auth: {
    namePlaceholder: "Имя",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Пароль",
    showPassword: "Показать пароль",
    hidePassword: "Скрыть пароль",
    signIn: "Войти",
    signingIn: "Входим…",
    signUp: "Создать аккаунт",
    signingUp: "Создаём…",
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    signOut: "Выйти",
    signUpTitle: "Создать аккаунт",
    signUpSubtitle: "Регистрируйтесь и учите глаголы каждый день",
    errors,
  },
  home: {
    featureDaily: "Ежедневная практика",
    featureStreak: "Улучшайте серию",
    featureProgress: "Отмечайте прогресс",
    footer: "Учите неправильные глаголы каждый день",
  },
  install: {
    title: "Установить приложение",
    subtitle: "Со своей иконкой и в отдельном окне — как обычное приложение.",
    iosHint: "В Safari: «Поделиться» → «На экран „Домой“»",
    action: "Установить",
    dismiss: "Закрыть",
  },
  dashboard: {
    greeting: "Привет, {name}!",
    greetingNote: "Отличная работа! Продолжай в том же духе.",
    statVerbs: "глагола изучено",
    statDays: "дней подряд",
    statSessions: "сессии пройдено",
    statLevel: "Уровень",
    statLevelName: "Средний",
    continueTitle: "Продолжить обучение",
    continueSubtitle: "Текущий тренажёр",
    trainerName: "Три формы глаголов",
    trainerKind: "Карточки",
    continueAction: "Продолжить",
    todayTitle: "Сегодня",
    todayGoal: "Ежедневная цель",
    changeGoal: "Изменить цель",
    verbs: "глаголов",
    remaining,
    quickAccess: "Быстрый доступ",
    trainers: "Тренажёры",
    verbList: "Список глаголов",
    review: "Повторение",
    settings: "Настройки",
    navHome: "Главная",
    navTrainers: "Тренажёры",
    navProgress: "Прогресс",
    navProfile: "Профиль",
  },
  comingSoon: {
    title: "Скоро!",
    text: "Этот раздел ещё в разработке — совсем скоро здесь появится что-то полезное.",
    back: "Вернуться в кабинет",
  },
  verbGroups: {
    title: "Группы глаголов",
    subtitle: "Все неправильные глаголы, разбитые по логическим паттернам",
    count: verbCount,
    back: "Все группы",
    backToDashboard: "Вернуться в кабинет",
    empty: "В этой группе пока нет глаголов",
  },
};

export default ru;
