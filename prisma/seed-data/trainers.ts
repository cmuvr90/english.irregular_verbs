import type { Locale } from "../../src/lib/locales";

import type { LocalizedText } from "./groups";

/** Шаг инструкции «Как работает тренажёр». icon — имя иконки lucide (kebab-case). */
export type TrainerStep = {
  position: number;
  icon: string;
  name: string;
  description: string;
};

export type TrainerSettings = {
  hint: string;
  steps: TrainerStep[];
};

export type SeedTrainer = {
  key: string;
  name: LocalizedText;
  description: LocalizedText;
  settings: Record<Locale, TrainerSettings>;
};

export const trainers: SeedTrainer[] = [
  {
    key: "flashcards",
    name: {
      en: "Flashcards",
      be: "Карткі",
      uk: "Картки",
      pl: "Fiszki",
      ru: "Карточки",
    },
    description: {
      en: "Learn the three verb forms with spaced-repetition flashcards.",
      be: "Вучы тры формы дзеясловаў па картках з інтэрвальным паўтарэннем.",
      uk: "Вчи три форми дієслів за картками з інтервальним повторенням.",
      pl: "Ucz się trzech form czasowników z fiszkami i powtórkami interwałowymi.",
      ru: "Учи три формы глаголов по карточкам с интервальным повторением.",
    },
    settings: {
      en: {
        hint: "Tap to show the answer",
        steps: [
          { position: 1, icon: "eye", name: "Look at the word", description: "A verb appears on the card." },
          { position: 2, icon: "brain", name: "Recall the translation and forms", description: "Try to name the translation and all 3 forms." },
          { position: 3, icon: "circle-check", name: "Rate yourself", description: "Tap “I know” or “Repeat”." },
        ],
      },
      be: {
        hint: "Націсніце, каб паказаць адказ",
        steps: [
          { position: 1, icon: "eye", name: "Глядзі на слова", description: "На картцы з'яўляецца дзеяслоў." },
          { position: 2, icon: "brain", name: "Успомні пераклад і формы", description: "Паспрабуй назваць пераклад і 3 формы дзеяслова." },
          { position: 3, icon: "circle-check", name: "Ацані сябе", description: "Націсні «Ведаю» або «Паўтарыць»." },
        ],
      },
      uk: {
        hint: "Натисніть, щоб показати відповідь",
        steps: [
          { position: 1, icon: "eye", name: "Дивись на слово", description: "На картці з'являється дієслово." },
          { position: 2, icon: "brain", name: "Згадай переклад і форми", description: "Спробуй назвати переклад і 3 форми дієслова." },
          { position: 3, icon: "circle-check", name: "Оціни себе", description: "Натисни «Знаю» або «Повторити»." },
        ],
      },
      pl: {
        hint: "Naciśnij, aby zobaczyć odpowiedź",
        steps: [
          { position: 1, icon: "eye", name: "Patrz na słowo", description: "Na karcie pojawia się czasownik." },
          { position: 2, icon: "brain", name: "Przypomnij sobie tłumaczenie i formy", description: "Spróbuj podać tłumaczenie i 3 formy czasownika." },
          { position: 3, icon: "circle-check", name: "Oceń się", description: "Naciśnij „Wiem” albo „Powtórz”." },
        ],
      },
      ru: {
        hint: "Нажмите, чтобы показать ответ",
        steps: [
          { position: 1, icon: "eye", name: "Смотри на слово", description: "На карточке появляется глагол." },
          { position: 2, icon: "brain", name: "Вспомни перевод и формы", description: "Попробуй назвать перевод и 3 формы глагола." },
          { position: 3, icon: "circle-check", name: "Оцени себя", description: "Нажми «Знаю» или «Повторить»." },
        ],
      },
    },
  },
  {
    key: "multiple-choice",
    name: {
      en: "Choose the form",
      be: "Выберы форму",
      uk: "Обери форму",
      pl: "Wybierz formę",
      ru: "Выбери форму",
    },
    description: {
      en: "Fill the gap in a sentence: pick the form that fits the context.",
      be: "Запоўні пропуск у сказе: выберы форму, якая пасуе кантэксту.",
      uk: "Заповни пропуск у реченні: обери форму, що пасує контексту.",
      pl: "Uzupełnij lukę w zdaniu: wybierz formę pasującą do kontekstu.",
      ru: "Заполни пропуск в предложении: выбери форму, подходящую по контексту.",
    },
    settings: {
      en: {
        hint: "Pick one of the three options",
        steps: [
          { position: 1, icon: "book-open", name: "Read the sentence", description: "Find the time marker: yesterday, every day, already." },
          { position: 2, icon: "list-checks", name: "Choose the form", description: "Only one of the three fits the context." },
          { position: 3, icon: "lightbulb", name: "Read the explanation", description: "It tells you why that form and not another." },
        ],
      },
      be: {
        hint: "Выберы адзін з трох варыянтаў",
        steps: [
          { position: 1, icon: "book-open", name: "Прачытай сказ", description: "Знайдзі маркер часу: yesterday, every day, already." },
          { position: 2, icon: "list-checks", name: "Выберы форму", description: "Кантэксту адпавядае толькі адзін з трох варыянтаў." },
          { position: 3, icon: "lightbulb", name: "Прачытай тлумачэнне", description: "Яно кажа, чаму менавіта гэтая форма." },
        ],
      },
      uk: {
        hint: "Обери один із трьох варіантів",
        steps: [
          { position: 1, icon: "book-open", name: "Прочитай речення", description: "Знайди маркер часу: yesterday, every day, already." },
          { position: 2, icon: "list-checks", name: "Обери форму", description: "Контексту відповідає лише один із трьох варіантів." },
          { position: 3, icon: "lightbulb", name: "Прочитай пояснення", description: "Воно каже, чому саме ця форма." },
        ],
      },
      pl: {
        hint: "Wybierz jedną z trzech opcji",
        steps: [
          { position: 1, icon: "book-open", name: "Przeczytaj zdanie", description: "Znajdź marker czasu: yesterday, every day, already." },
          { position: 2, icon: "list-checks", name: "Wybierz formę", description: "Do kontekstu pasuje tylko jedna z trzech opcji." },
          { position: 3, icon: "lightbulb", name: "Przeczytaj wyjaśnienie", description: "Mówi, dlaczego właśnie ta forma." },
        ],
      },
      ru: {
        hint: "Выбери один из трёх вариантов",
        steps: [
          { position: 1, icon: "book-open", name: "Прочитай предложение", description: "Найди маркер времени: yesterday, every day, already." },
          { position: 2, icon: "list-checks", name: "Выбери форму", description: "Контексту подходит только один из трёх вариантов." },
          { position: 3, icon: "lightbulb", name: "Прочитай разбор", description: "Он говорит, почему именно эта форма." },
        ],
      },
    },
  },
  {
    key: "fill-blanks",
    name: {
      en: "Fill in the blanks",
      be: "Запоўні пропускі",
      uk: "Заповни пропуски",
      pl: "Uzupełnij luki",
      ru: "Заполни пропуски",
    },
    description: {
      en: "A verb form is missing — type it in yourself.",
      be: "Адной формы дзеяслова не хапае — упішы яе сам.",
      uk: "Однієї форми дієслова бракує — впиши її сам.",
      pl: "Brakuje formy czasownika — wpisz ją sam.",
      ru: "Одной формы глагола не хватает — впиши её сам.",
    },
    settings: {
      en: {
        hint: "Type the form and press Enter",
        steps: [
          { position: 1, icon: "eye", name: "Look at the forms", description: "One form is hidden; identical forms are hidden together." },
          { position: 2, icon: "pencil", name: "Type the missing one", description: "Spelling counts; for was/were either form is fine." },
          { position: 3, icon: "circle-check", name: "Check yourself", description: "A mistake brings the verb back a few cards later." },
        ],
      },
      be: {
        hint: "Упішы форму і націсні Enter",
        steps: [
          { position: 1, icon: "eye", name: "Паглядзі на формы", description: "Адна форма схаваная; аднолькавыя формы хаваюцца разам." },
          { position: 2, icon: "pencil", name: "Упішы пропушчаную", description: "Правапіс важны; для was/were падыдзе любая з формаў." },
          { position: 3, icon: "circle-check", name: "Правер сябе", description: "Памылка верне дзеяслоў праз некалькі картак." },
        ],
      },
      uk: {
        hint: "Впиши форму й натисни Enter",
        steps: [
          { position: 1, icon: "eye", name: "Подивись на форми", description: "Одну форму сховано; однакові форми ховаються разом." },
          { position: 2, icon: "pencil", name: "Впиши пропущену", description: "Правопис важливий; для was/were підійде будь-яка з форм." },
          { position: 3, icon: "circle-check", name: "Перевір себе", description: "Помилка поверне дієслово через кілька карток." },
        ],
      },
      pl: {
        hint: "Wpisz formę i naciśnij Enter",
        steps: [
          { position: 1, icon: "eye", name: "Spójrz na formy", description: "Jedna forma jest ukryta; identyczne formy ukrywane są razem." },
          { position: 2, icon: "pencil", name: "Wpisz brakującą", description: "Pisownia się liczy; przy was/were pasuje dowolna forma." },
          { position: 3, icon: "circle-check", name: "Sprawdź się", description: "Błąd przywróci czasownik za kilka kart." },
        ],
      },
      ru: {
        hint: "Впиши форму и нажми Enter",
        steps: [
          { position: 1, icon: "eye", name: "Посмотри на формы", description: "Одна форма скрыта; одинаковые формы скрываются вместе." },
          { position: 2, icon: "pencil", name: "Впиши пропущенную", description: "Важно написание; для was/were подойдёт любая из форм." },
          { position: 3, icon: "circle-check", name: "Проверь себя", description: "Ошибка вернёт глагол через несколько карточек." },
        ],
      },
    },
  },
  {
    key: "word-order",
    name: {
      en: "Put the words in order",
      be: "Расстаў словы па парадку",
      uk: "Розстав слова по порядку",
      pl: "Ułóż słowa w kolejności",
      ru: "Расставь слова по порядку",
    },
    description: {
      en: "Build an English sentence from shuffled words.",
      be: "Збяры англійскі сказ з перамяшаных слоў.",
      uk: "Збери англійське речення з перемішаних слів.",
      pl: "Złóż angielskie zdanie z pomieszanych słów.",
      ru: "Собери английское предложение из перемешанных слов.",
    },
    settings: {
      en: {
        hint: "Tap the words in the right order",
        steps: [
          { position: 1, icon: "book-open", name: "Read the meaning", description: "The translation shows what the sentence says." },
          { position: 2, icon: "shuffle", name: "Put the words in order", description: "The capital letter starts the sentence, the full stop ends it." },
          { position: 3, icon: "circle-check", name: "Check yourself", description: "A mistake brings the sentence back a few cards later." },
        ],
      },
      be: {
        hint: "Націскай словы ў правільным парадку",
        steps: [
          { position: 1, icon: "book-open", name: "Прачытай сэнс", description: "Пераклад паказвае, пра што сказ." },
          { position: 2, icon: "shuffle", name: "Расстаў словы", description: "Вялікая літара пачынае сказ, кропка заканчвае." },
          { position: 3, icon: "circle-check", name: "Правер сябе", description: "Памылка верне сказ праз некалькі картак." },
        ],
      },
      uk: {
        hint: "Натискай слова в правильному порядку",
        steps: [
          { position: 1, icon: "book-open", name: "Прочитай зміст", description: "Переклад показує, про що речення." },
          { position: 2, icon: "shuffle", name: "Розстав слова", description: "Велика літера починає речення, крапка завершує." },
          { position: 3, icon: "circle-check", name: "Перевір себе", description: "Помилка поверне речення через кілька карток." },
        ],
      },
      pl: {
        hint: "Naciskaj słowa we właściwej kolejności",
        steps: [
          { position: 1, icon: "book-open", name: "Przeczytaj znaczenie", description: "Tłumaczenie pokazuje, o czym jest zdanie." },
          { position: 2, icon: "shuffle", name: "Ułóż słowa", description: "Wielka litera zaczyna zdanie, kropka je kończy." },
          { position: 3, icon: "circle-check", name: "Sprawdź się", description: "Błąd przywróci zdanie za kilka kart." },
        ],
      },
      ru: {
        hint: "Нажимай слова в правильном порядке",
        steps: [
          { position: 1, icon: "book-open", name: "Прочитай смысл", description: "Перевод показывает, о чём предложение." },
          { position: 2, icon: "shuffle", name: "Расставь слова", description: "Заглавная буква начинает предложение, точка завершает." },
          { position: 3, icon: "circle-check", name: "Проверь себя", description: "Ошибка вернёт предложение через несколько карточек." },
        ],
      },
    },
  },
];
