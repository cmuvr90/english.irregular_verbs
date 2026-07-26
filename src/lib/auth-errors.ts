/** Better Auth отдаёт сообщения на английском — переводим по коду ошибки. */
export const authErrorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Неверная почта или пароль",
  USER_ALREADY_EXISTS: "Пользователь с такой почтой уже зарегистрирован",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Пользователь с такой почтой уже зарегистрирован",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий — минимум 8 символов",
  PASSWORD_TOO_LONG: "Пароль слишком длинный",
  INVALID_EMAIL: "Некорректный адрес почты",
  EMAIL_NOT_VERIFIED: "Почта не подтверждена",
};
