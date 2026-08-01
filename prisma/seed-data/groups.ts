import type { Locale } from "../../src/lib/locales";

/** Локализованный текст: ключи — локали приложения. */
export type LocalizedText = Record<Locale, string>;

export type SeedGroup = {
  key: string;
  name: LocalizedText;
  description: LocalizedText;
};

/**
 * Группы неправильных глаголов по логическим паттернам.
 * Источники: «Карта неправильных глаголов» (PDF) и рабочий Google-док.
 */
export const groups: SeedGroup[] = [
  {
    key: "identical-forms",
    name: {
      en: "All three forms are the same",
      be: "Усе тры формы аднолькавыя",
      uk: "Усі три форми однакові",
      pl: "Wszystkie trzy formy takie same",
      ru: "Все три формы одинаковые",
    },
    description: {
      en: "V1 = V2 = V3, often with a final -t/-d: cut – cut – cut.",
      be: "V1 = V2 = V3, часта з канцавой -t/-d: cut – cut – cut.",
      uk: "V1 = V2 = V3, часто з кінцевою -t/-d: cut – cut – cut.",
      pl: "V1 = V2 = V3, często z końcowym -t/-d: cut – cut – cut.",
      ru: "V1 = V2 = V3, часто с финальной -t/-d: cut – cut – cut.",
    },
  },
  {
    key: "i-a-u",
    name: {
      en: "Vowel change i → a → u",
      be: "Чаргаванне i → a → u",
      uk: "Чергування i → a → u",
      pl: "Wymiana samogłosek i → a → u",
      ru: "Чередование i → a → u",
    },
    description: {
      en: "An old and very regular pattern: sing – sang – sung.",
      be: "Старажытны і вельмі рэгулярны патэрн: sing – sang – sung.",
      uk: "Давній і дуже регулярний патерн: sing – sang – sung.",
      pl: "Stary i bardzo regularny wzorzec: sing – sang – sung.",
      ru: "Древний и очень регулярный паттерн: sing – sang – sung.",
    },
  },
  {
    key: "i-u-u",
    name: {
      en: "Vowel change i → u → u",
      be: "Чаргаванне i → u → u",
      uk: "Чергування i → u → u",
      pl: "Wymiana samogłosek i → u → u",
      ru: "Чередование i → u → u",
    },
    description: {
      en: "V2 = V3, the vowel changes once: win – won – won.",
      be: "V2 = V3, галосная мяняецца адзін раз: win – won – won.",
      uk: "V2 = V3, голосна змінюється один раз: win – won – won.",
      pl: "V2 = V3, samogłoska zmienia się raz: win – won – won.",
      ru: "V2 = V3, гласная меняется один раз: win – won – won.",
    },
  },
  {
    key: "i-ou-ou",
    name: {
      en: "Vowel change i → ou → ou",
      be: "Чаргаванне i → ou → ou",
      uk: "Чергування i → ou → ou",
      pl: "Wymiana samogłosek i → ou → ou",
      ru: "Чередование i → ou → ou",
    },
    description: {
      en: "V2 = V3 with a nasal sound: find – found – found.",
      be: "V2 = V3, насавы гук: find – found – found.",
      uk: "V2 = V3, носовий звук: find – found – found.",
      pl: "V2 = V3, głoska nosowa: find – found – found.",
      ru: "V2 = V3, носовой звук: find – found – found.",
    },
  },
  {
    key: "vowel-shortening",
    name: {
      en: "Vowel shortens, V2 = V3",
      be: "Галосная скарачаецца, V2 = V3",
      uk: "Голосна скорочується, V2 = V3",
      pl: "Skrócenie samogłoski, V2 = V3",
      ru: "Гласная сокращается, V2 = V3",
    },
    description: {
      en: "The long vowel becomes short: feed – fed – fed, meet – met – met.",
      be: "Доўгая галосная становіцца кароткай: feed – fed – fed, meet – met – met.",
      uk: "Довга голосна стає короткою: feed – fed – fed, meet – met – met.",
      pl: "Długa samogłoska staje się krótka: feed – fed – fed, meet – met – met.",
      ru: "Долгая гласная становится короткой: feed – fed – fed, meet – met – met.",
    },
  },
  {
    key: "t-ending",
    name: {
      en: "-t instead of -ed",
      be: "Канчатак -t замест -ed",
      uk: "Закінчення -t замість -ed",
      pl: "Końcówka -t zamiast -ed",
      ru: "Окончание -t вместо -ed",
    },
    description: {
      en: "Past forms end in -t, often after nasals and -p: keep – kept – kept.",
      be: "Формы прошлага часу на -t, часта пасля насавых і -p: keep – kept – kept.",
      uk: "Форми минулого часу на -t, часто після носових і -p: keep – kept – kept.",
      pl: "Formy przeszłe na -t, często po głoskach nosowych i -p: keep – kept – kept.",
      ru: "Прошедшие формы на -t, часто после носовых и -p: keep – kept – kept.",
    },
  },
  {
    key: "ow-ew-own",
    name: {
      en: "Change ow → ew → own",
      be: "Чаргаванне ow → ew → own",
      uk: "Чергування ow → ew → own",
      pl: "Wymiana ow → ew → own",
      ru: "Чередование ow → ew → own",
    },
    description: {
      en: "-n in the past participle: know – knew – known.",
      be: "Канчатак -n у Past Participle: know – knew – known.",
      uk: "Закінчення -n у Past Participle: know – knew – known.",
      pl: "Końcówka -n w imiesłowie: know – knew – known.",
      ru: "Окончание -n в Past Participle: know – knew – known.",
    },
  },
  {
    key: "o-o-en",
    name: {
      en: "ea/ee → o + -en",
      be: "Чаргаванне ea/ee → o → o(k)en",
      uk: "Чергування ea/ee → o → o(k)en",
      pl: "Wymiana ea/ee → o + -en",
      ru: "Чередование ea/ee → o → o(k)en",
    },
    description: {
      en: "A strong group with -en in V3: speak – spoke – spoken.",
      be: "Магутная група з -en у V3: speak – spoke – spoken.",
      uk: "Потужна група з -en у V3: speak – spoke – spoken.",
      pl: "Silna grupa z -en w V3: speak – spoke – spoken.",
      ru: "Мощная группа с -en в V3: speak – spoke – spoken.",
    },
  },
  {
    key: "i-o-en",
    name: {
      en: "i → o + -en",
      be: "Чаргаванне i → o + -en",
      uk: "Чергування i → o + -en",
      pl: "Wymiana i → o + -en",
      ru: "Чередование i → o + -en",
    },
    description: {
      en: "Doubled consonant + -en in V3: write – wrote – written.",
      be: "Падваенне зычнай + -en: write – wrote – written.",
      uk: "Подвоєння приголосної + -en: write – wrote – written.",
      pl: "Podwojona spółgłoska + -en: write – wrote – written.",
      ru: "Удвоение согласной + -en: write – wrote – written.",
    },
  },
  {
    key: "ought-aught",
    name: {
      en: "-ought / -aught",
      be: "Канчатак -ought / -aught",
      uk: "Закінчення -ought / -aught",
      pl: "Końcówka -ought / -aught",
      ru: "Окончание -ought / -aught",
    },
    description: {
      en: "Old Germanic verbs: think – thought – thought.",
      be: "Старагерманскія дзеясловы: think – thought – thought.",
      uk: "Давньогерманські дієслова: think – thought – thought.",
      pl: "Stare germańskie czasowniki: think – thought – thought.",
      ru: "Старогерманские глаголы: think – thought – thought.",
    },
  },
  {
    key: "o-old",
    name: {
      en: "ell → old",
      be: "Чаргаванне ell → old",
      uk: "Чергування ell → old",
      pl: "Wymiana ell → old",
      ru: "Чередование ell → old",
    },
    description: {
      en: "sell – sold – sold, tell – told – told.",
      be: "sell – sold – sold, tell – told – told.",
      uk: "sell – sold – sold, tell – told – told.",
      pl: "sell – sold – sold, tell – told – told.",
      ru: "sell – sold – sold, tell – told – told.",
    },
  },
  {
    key: "ay-aid",
    name: {
      en: "-ay → -aid",
      be: "Канчатак -aid",
      uk: "Закінчення -aid",
      pl: "Końcówka -aid",
      ru: "Окончание -aid",
    },
    description: {
      en: "say – said – said, pay – paid – paid.",
      be: "say – said – said, pay – paid – paid.",
      uk: "say – said – said, pay – paid – paid.",
      pl: "say – said – said, pay – paid – paid.",
      ru: "say – said – said, pay – paid – paid.",
    },
  },
  {
    key: "ed-but-n",
    name: {
      en: "Regular past, participle in -n",
      be: "V2 правільная, V3 на -n",
      uk: "V2 правильна, V3 на -n",
      pl: "Regularne V2, imiesłów na -n",
      ru: "V2 правильная, V3 на -n",
    },
    description: {
      en: "The past is regular, the participle ends in -n: show – showed – shown.",
      be: "Прошлы час правільны, дзеепрыметнік на -n: show – showed – shown.",
      uk: "Минулий час правильний, дієприкметник на -n: show – showed – shown.",
      pl: "Czas przeszły regularny, imiesłów na -n: show – showed – shown.",
      ru: "Прошедшее время правильное, причастие на -n: show – showed – shown.",
    },
  },
  {
    key: "v1-v3",
    name: {
      en: "V1 = V3, cyclic return",
      be: "V1 = V3 (цыклічны зварот)",
      uk: "V1 = V3 (циклічне повернення)",
      pl: "V1 = V3 (powrót do formy podstawowej)",
      ru: "V1 = V3 (циклический возврат)",
    },
    description: {
      en: "The past participle equals the base form: come – came – come.",
      be: "Дзеепрыметнік супадае з інфінітывам: come – came – come.",
      uk: "Дієприкметник збігається з інфінітивом: come – came – come.",
      pl: "Imiesłów równa się bezokolicznikowi: come – came – come.",
      ru: "Причастие совпадает с инфинитивом: come – came – come.",
    },
  },
  {
    key: "prefixes",
    name: {
      en: "Prefix logic",
      be: "Логіка прыставак",
      uk: "Логіка префіксів",
      pl: "Logika przedrostków",
      ru: "Логика приставок",
    },
    description: {
      en: "The root defines the forms of its derivatives: take → mistake, overtake.",
      be: "Корань вызначае формы вытворных: take → mistake, overtake.",
      uk: "Корінь визначає форми похідних: take → mistake, overtake.",
      pl: "Rdzeń określa formy pochodnych: take → mistake, overtake.",
      ru: "Корень определяет формы производных: take → mistake, overtake.",
    },
  },
  {
    key: "suppletive",
    name: {
      en: "Suppletive verbs (historic anomalies)",
      be: "Суплетывізм (гістарычныя анамаліі)",
      uk: "Суплетивізм (історичні аномалії)",
      pl: "Supletywizm (historyczne anomalie)",
      ru: "Суплетивизм (исторические аномалии)",
    },
    description: {
      en: "Forms fused from different roots: be – was/were – been, go – went – gone.",
      be: "Формы зліты з розных каранёў: be – was/were – been, go – went – gone.",
      uk: "Форми злиті з різних коренів: be – was/were – been, go – went – gone.",
      pl: "Formy z różnych rdzeni: be – was/were – been, go – went – gone.",
      ru: "Формы слиты из разных корней: be – was/were – been, go – went – gone.",
    },
  },
  {
    key: "confusing-pairs",
    name: {
      en: "Confusing pairs",
      be: "Пасткі — пары, якія блытаюць",
      uk: "Пастки — пари, які плутають",
      pl: "Pułapki — mylące pary",
      ru: "Ловушки — пары, которые путают",
    },
    description: {
      en: "Similar verbs, different meanings and forms: lie – lay – lain vs regular lie – lied and lay – laid; rise vs regular raise; fall vs fell; find vs found; hang – hung vs hanged.",
      be: "Падобныя дзеясловы з рознымі значэннямі і формамі: lie – lay – lain супраць правільных lie – lied і lay – laid; rise супраць raise; fall супраць fell; find супраць found; hang – hung супраць hanged.",
      uk: "Схожі дієслова з різними значеннями і формами: lie – lay – lain проти правильних lie – lied і lay – laid; rise проти raise; fall проти fell; find проти found; hang – hung проти hanged.",
      pl: "Podobne czasowniki o różnych znaczeniach i formach: lie – lay – lain vs regularne lie – lied i lay – laid; rise vs raise; fall vs fell; find vs found; hang – hung vs hanged.",
      ru: "Похожие глаголы с разными значениями и формами: lie – lay – lain против правильных lie – lied («лгать») и lay – laid; rise против raise; fall против fell («валить»); find против found («основывать»); hang – hung против hanged («казнить»).",
    },
  },
  {
    key: "others",
    name: {
      en: "Outside the main patterns",
      be: "Па-за асноўнымі патэрнамі",
      uk: "Поза основними патернами",
      pl: "Poza głównymi wzorcami",
      ru: "Вне основных паттернов",
    },
    description: {
      en: "Frequent verbs that don't fit the groups above.",
      be: "Частыя дзеясловы, якія не ўпісваюцца ў астатнія групы.",
      uk: "Часті дієслова, які не вписуються в інші групи.",
      pl: "Częste czasowniki, które nie pasują do pozostałych grup.",
      ru: "Частотные глаголы, которые не вписываются в остальные группы.",
    },
  },
];
