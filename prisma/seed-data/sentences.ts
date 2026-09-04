import type { SentenceOption, SentenceOptions } from "../../src/lib/sentence-options";

import type { LocalizedText } from "./groups";

/**
 * Перевод предложения. en намеренно необязателен: англоязычному студенту
 * переводить нечего, и компонент просто не рисует блок при пустой строке.
 */
export type SentenceTranslation = Partial<LocalizedText>;

export type SeedSentence = {
  /** form1 глагола из verbs.ts; сид резолвит его в тройку форм. */
  verb: string;
  /** Предложение с одним пропуском [a]. */
  text: string;
  options: SentenceOptions;
  translation: SentenceTranslation;
  /** Разбор после ответа: почему именно эта форма. */
  explanation: LocalizedText;
  /** 1–3: от однозначных контекстов к спорным. */
  level: number;
};

/**
 * Варианты одного пропуска: верный первым, дистракторы следом.
 * Порядок в базе — авторский (для админки), на выдаче колода тасуется.
 */
function blank(correct: string, ...wrong: string[]): SentenceOption[] {
  return [
    { text: correct, correct: true },
    ...wrong.map((text) => ({ text, correct: false })),
  ];
}

/**
 * Предложения для тренажёра «Выбери форму».
 *
 * Правило, по которому они написаны: в каждом предложении есть однозначный
 * маркер времени. Без него у глаголов с совпадающими формами (cut, hit, put,
 * cost — вся группа identical-forms) Present Simple и Past Simple становятся
 * одинаково защитимыми: «He cut his hair once a month» — валидное прошедшее,
 * и задание получает два верных ответа. Для Present Simple маркера-наречия
 * мало, поэтому время дополнительно закреплено вторым глаголом в настоящем
 * («…and he never buys it in a shop»).
 */
export const sentences: SeedSentence[] = [
  // ── Past Simple ─────────────────────────────────────────────────────────
  {
    verb: "hit",
    text: "Yesterday she [a] her leg on the table.",
    options: { a: blank("hit", "hits", "hitting") },
    translation: {
      be: "Учора яна ўдарылася нагой аб стол.",
      uk: "Учора вона вдарилася ногою об стіл.",
      pl: "Wczoraj uderzyła się w nogę o stół.",
      ru: "Вчера она ударилась ногой о стол.",
    },
    explanation: {
      en: "“Yesterday” calls for Past Simple, and hit keeps the same form in all three: hit – hit – hit.",
      be: "«Yesterday» патрабуе Past Simple, а ў hit усе тры формы аднолькавыя: hit – hit – hit.",
      uk: "«Yesterday» вимагає Past Simple, а в hit усі три форми однакові: hit – hit – hit.",
      pl: "„Yesterday” wymaga Past Simple, a hit ma wszystkie trzy formy takie same: hit – hit – hit.",
      ru: "«Yesterday» требует Past Simple, а у hit все три формы одинаковые: hit – hit – hit.",
    },
    level: 1,
  },
  {
    verb: "begin",
    text: "The film [a] two hours ago.",
    options: { a: blank("began", "begins", "beginning") },
    translation: {
      be: "Фільм пачаўся дзве гадзіны таму.",
      uk: "Фільм почався дві години тому.",
      pl: "Film zaczął się dwie godziny temu.",
      ru: "Фильм начался два часа назад.",
    },
    explanation: {
      en: "“Two hours ago” is a finished moment in the past → Past Simple: begin – began – begun.",
      be: "«Two hours ago» — завершаны момант у мінулым → Past Simple: begin – began – begun.",
      uk: "«Two hours ago» — завершений момент у минулому → Past Simple: begin – began – begun.",
      pl: "„Two hours ago” to zakończony moment w przeszłości → Past Simple: begin – began – begun.",
      ru: "«Two hours ago» — завершённый момент в прошлом → Past Simple: begin – began – begun.",
    },
    level: 1,
  },
  {
    verb: "drink",
    text: "He [a] three cups of coffee last night.",
    options: { a: blank("drank", "drinks", "drunk") },
    translation: {
      be: "Ён выпіў тры кубкі кавы ўчора ўвечары.",
      uk: "Він випив три чашки кави вчора ввечері.",
      pl: "Wczoraj wieczorem wypił trzy filiżanki kawy.",
      ru: "Вчера вечером он выпил три чашки кофе.",
    },
    explanation: {
      en: "“Last night” needs the second form. Drunk is the third form and only works after have/has/had.",
      be: "«Last night» патрабуе другой формы. Drunk — трэцяя форма, яна толькі пасля have/has/had.",
      uk: "«Last night» вимагає другої форми. Drunk — третя форма, вона лише після have/has/had.",
      pl: "„Last night” wymaga drugiej formy. Drunk to trzecia forma, tylko po have/has/had.",
      ru: "«Last night» требует вторую форму. Drunk — третья форма, она только после have/has/had.",
    },
    level: 2,
  },
  {
    verb: "write",
    text: "She [a] me a long letter last week.",
    options: { a: blank("wrote", "writes", "written") },
    translation: {
      be: "На мінулым тыдні яна напісала мне доўгі ліст.",
      uk: "Минулого тижня вона написала мені довгого листа.",
      pl: "W zeszłym tygodniu napisała do mnie długi list.",
      ru: "На прошлой неделе она написала мне длинное письмо.",
    },
    explanation: {
      en: "“Last week” → Past Simple wrote. Written is the third form and needs an auxiliary.",
      be: "«Last week» → Past Simple wrote. Written — трэцяя форма, ёй патрэбны дапаможны дзеяслоў.",
      uk: "«Last week» → Past Simple wrote. Written — третя форма, їй потрібне допоміжне дієслово.",
      pl: "„Last week” → Past Simple wrote. Written to trzecia forma, wymaga czasownika posiłkowego.",
      ru: "«Last week» → Past Simple wrote. Written — третья форма, ей нужен вспомогательный глагол.",
    },
    level: 2,
  },
  {
    verb: "buy",
    text: "They [a] a new car in 2020.",
    options: { a: blank("bought", "buys", "buying") },
    translation: {
      be: "Яны купілі новую машыну ў 2020 годзе.",
      uk: "Вони купили нову машину у 2020 році.",
      pl: "Kupili nowy samochód w 2020 roku.",
      ru: "Они купили новую машину в 2020 году.",
    },
    explanation: {
      en: "A named year is a closed period in the past → Past Simple: buy – bought – bought.",
      be: "Названы год — закрыты перыяд у мінулым → Past Simple: buy – bought – bought.",
      uk: "Названий рік — закритий період у минулому → Past Simple: buy – bought – bought.",
      pl: "Podany rok to zamknięty okres w przeszłości → Past Simple: buy – bought – bought.",
      ru: "Названный год — закрытый период в прошлом → Past Simple: buy – bought – bought.",
    },
    level: 1,
  },
  {
    verb: "lose",
    text: "I [a] my keys yesterday morning.",
    options: { a: blank("lost", "lose", "losing") },
    translation: {
      be: "Учора раніцай я згубіў ключы.",
      uk: "Учора вранці я загубив ключі.",
      pl: "Wczoraj rano zgubiłem klucze.",
      ru: "Вчера утром я потерял ключи.",
    },
    explanation: {
      en: "“Yesterday morning” fixes the past, so the base form lose will not do: lose – lost – lost.",
      be: "«Yesterday morning» замацоўвае мінулае, таму базавая форма lose не падыходзіць: lose – lost – lost.",
      uk: "«Yesterday morning» закріплює минуле, тож базова форма lose не підходить: lose – lost – lost.",
      pl: "„Yesterday morning” ustala przeszłość, więc forma podstawowa lose nie pasuje: lose – lost – lost.",
      ru: "«Yesterday morning» закрепляет прошлое, поэтому базовая форма lose не годится: lose – lost – lost.",
    },
    level: 1,
  },
  {
    verb: "break",
    text: "The boy [a] the window during yesterday's game.",
    options: { a: blank("broke", "breaks", "broken") },
    translation: {
      be: "Хлопчык разбіў акно падчас учорашняй гульні.",
      uk: "Хлопчик розбив вікно під час учорашньої гри.",
      pl: "Chłopiec zbił okno podczas wczorajszego meczu.",
      ru: "Мальчик разбил окно во время вчерашней игры.",
    },
    explanation: {
      en: "“Yesterday's game” places the action in the past → broke. Broken would need was/has before it.",
      be: "«Yesterday's game» змяшчае дзеянне ў мінулым → broke. Перад broken патрэбны was ці has.",
      uk: "«Yesterday's game» розміщує дію в минулому → broke. Перед broken потрібні was або has.",
      pl: "„Yesterday's game” umieszcza czynność w przeszłości → broke. Przed broken trzeba było was lub has.",
      ru: "«Yesterday's game» помещает действие в прошлое → broke. Перед broken нужен was или has.",
    },
    level: 2,
  },
  {
    verb: "cost",
    text: "That jacket [a] me fifty euros last winter.",
    options: { a: blank("cost", "costs", "costing") },
    translation: {
      be: "Тая куртка каштавала мне пяцьдзясят еўра мінулай зімой.",
      uk: "Та куртка коштувала мені п'ятдесят євро минулої зими.",
      pl: "Ta kurtka kosztowała mnie pięćdziesiąt euro zeszłej zimy.",
      ru: "Та куртка стоила мне пятьдесят евро прошлой зимой.",
    },
    explanation: {
      en: "“Last winter” is the past, and cost does not change: cost – cost – cost. The -s form would mean the present.",
      be: "«Last winter» — мінулае, а cost не змяняецца: cost – cost – cost. Форма з -s азначала б цяперашняе.",
      uk: "«Last winter» — минуле, а cost не змінюється: cost – cost – cost. Форма з -s означала б теперішнє.",
      pl: "„Last winter” to przeszłość, a cost się nie zmienia: cost – cost – cost. Forma z -s oznaczałaby teraźniejszość.",
      ru: "«Last winter» — прошлое, а cost не меняется: cost – cost – cost. Форма с -s означала бы настоящее.",
    },
    level: 2,
  },
  {
    verb: "put",
    text: "She [a] the milk in the fridge an hour ago.",
    options: { a: blank("put", "puts", "putting") },
    translation: {
      be: "Яна паставіла малако ў халадзільнік гадзіну таму.",
      uk: "Вона поставила молоко в холодильник годину тому.",
      pl: "Godzinę temu włożyła mleko do lodówki.",
      ru: "Она поставила молоко в холодильник час назад.",
    },
    explanation: {
      en: "“An hour ago” → Past Simple, and put looks the same in all three forms: put – put – put.",
      be: "«An hour ago» → Past Simple, а put выглядае аднолькава ва ўсіх трох формах: put – put – put.",
      uk: "«An hour ago» → Past Simple, а put виглядає однаково в усіх трьох формах: put – put – put.",
      pl: "„An hour ago” → Past Simple, a put wygląda tak samo we wszystkich trzech formach: put – put – put.",
      ru: "«An hour ago» → Past Simple, а put выглядит одинаково во всех трёх формах: put – put – put.",
    },
    level: 2,
  },
  {
    verb: "teach",
    text: "My aunt [a] French at school until she retired.",
    options: { a: blank("taught", "teaches", "teaching") },
    translation: {
      be: "Мая цётка выкладала французскую ў школе, пакуль не выйшла на пенсію.",
      uk: "Моя тітка викладала французьку в школі, доки не вийшла на пенсію.",
      pl: "Moja ciocia uczyła francuskiego w szkole, dopóki nie przeszła na emeryturę.",
      ru: "Моя тётя преподавала французский в школе, пока не вышла на пенсию.",
    },
    explanation: {
      en: "“Until she retired” closes the period in the past → taught.",
      be: "«Until she retired» закрывае перыяд у мінулым → taught.",
      uk: "«Until she retired» закриває період у минулому → taught.",
      pl: "„Until she retired” zamyka okres w przeszłości → taught.",
      ru: "«Until she retired» закрывает период в прошлом → taught.",
    },
    level: 2,
  },
  {
    verb: "go",
    text: "We [a] to the mountains last summer.",
    options: { a: blank("went", "go", "gone") },
    translation: {
      be: "Мінулым летам мы ездзілі ў горы.",
      uk: "Минулого літа ми їздили в гори.",
      pl: "Zeszłego lata pojechaliśmy w góry.",
      ru: "Прошлым летом мы ездили в горы.",
    },
    explanation: {
      en: "“Last summer” → Past Simple went. Gone is the third form and never stands alone.",
      be: "«Last summer» → Past Simple went. Gone — трэцяя форма, самастойна не ўжываецца.",
      uk: "«Last summer» → Past Simple went. Gone — третя форма, самостійно не вживається.",
      pl: "„Last summer” → Past Simple went. Gone to trzecia forma, nie występuje samodzielnie.",
      ru: "«Last summer» → Past Simple went. Gone — третья форма, самостоятельно не употребляется.",
    },
    level: 1,
  },
  {
    verb: "see",
    text: "I [a] him at the station on Monday.",
    options: { a: blank("saw", "see", "seen") },
    translation: {
      be: "Я бачыў яго на вакзале ў панядзелак.",
      uk: "Я бачив його на вокзалі в понеділок.",
      pl: "Widziałem go na dworcu w poniedziałek.",
      ru: "Я видел его на вокзале в понедельник.",
    },
    explanation: {
      en: "A named day in the past → Past Simple saw. Seen needs have/has/had in front of it.",
      be: "Названы дзень у мінулым → Past Simple saw. Перад seen патрэбны have/has/had.",
      uk: "Названий день у минулому → Past Simple saw. Перед seen потрібні have/has/had.",
      pl: "Podany dzień w przeszłości → Past Simple saw. Przed seen musi stać have/has/had.",
      ru: "Названный день в прошлом → Past Simple saw. Перед seen нужны have/has/had.",
    },
    level: 1,
  },
  {
    verb: "feel",
    text: "She [a] tired after the trip last night.",
    options: { a: blank("felt", "feels", "feeling") },
    translation: {
      be: "Учора ўвечары пасля паездкі яна адчувала сябе стомленай.",
      uk: "Учора ввечері після поїздки вона почувалася втомленою.",
      pl: "Wczoraj wieczorem po podróży czuła się zmęczona.",
      ru: "Вчера вечером после поездки она чувствовала себя уставшей.",
    },
    explanation: {
      en: "“Last night” → Past Simple: feel – felt – felt.",
      be: "«Last night» → Past Simple: feel – felt – felt.",
      uk: "«Last night» → Past Simple: feel – felt – felt.",
      pl: "„Last night” → Past Simple: feel – felt – felt.",
      ru: "«Last night» → Past Simple: feel – felt – felt.",
    },
    level: 1,
  },
  {
    verb: "read",
    text: "He [a] the whole book in two days last month.",
    options: { a: blank("read", "reads", "reading") },
    translation: {
      be: "У мінулым месяцы ён прачытаў усю кнігу за два дні.",
      uk: "Минулого місяця він прочитав усю книжку за два дні.",
      pl: "W zeszłym miesiącu przeczytał całą książkę w dwa dni.",
      ru: "В прошлом месяце он прочитал всю книгу за два дня.",
    },
    explanation: {
      en: "Read is spelled the same in all three forms, only the sound changes: /riːd/ – /red/ – /red/. “Last month” gives the past.",
      be: "Read пішацца аднолькава ва ўсіх трох формах, мяняецца толькі гучанне: /riːd/ – /red/ – /red/. «Last month» дае мінулае.",
      uk: "Read пишеться однаково в усіх трьох формах, змінюється лише звучання: /riːd/ – /red/ – /red/. «Last month» дає минуле.",
      pl: "Read pisze się tak samo we wszystkich trzech formach, zmienia się tylko wymowa: /riːd/ – /red/ – /red/. „Last month” wskazuje przeszłość.",
      ru: "Read пишется одинаково во всех трёх формах, меняется только звучание: /riːd/ – /red/ – /red/. «Last month» даёт прошлое.",
    },
    level: 3,
  },

  // ── Present Perfect ─────────────────────────────────────────────────────
  {
    verb: "eat",
    text: "I have already [a] breakfast.",
    options: { a: blank("eaten", "ate", "eating") },
    translation: {
      be: "Я ўжо паснедаў.",
      uk: "Я вже поснідав.",
      pl: "Już zjadłem śniadanie.",
      ru: "Я уже позавтракал.",
    },
    explanation: {
      en: "After have/has comes the third form: eat – ate – eaten.",
      be: "Пасля have/has ідзе трэцяя форма: eat – ate – eaten.",
      uk: "Після have/has іде третя форма: eat – ate – eaten.",
      pl: "Po have/has stoi trzecia forma: eat – ate – eaten.",
      ru: "После have/has идёт третья форма: eat – ate – eaten.",
    },
    level: 1,
  },
  {
    verb: "meet",
    text: "We have never [a] his parents.",
    options: { a: blank("met", "meet", "meeting") },
    translation: {
      be: "Мы ніколі не сустракалі яго бацькоў.",
      uk: "Ми ніколи не зустрічали його батьків.",
      pl: "Nigdy nie poznaliśmy jego rodziców.",
      ru: "Мы никогда не встречали его родителей.",
    },
    explanation: {
      en: "“Never” with have is a marker of Present Perfect → third form: meet – met – met.",
      be: "«Never» з have — маркер Present Perfect → трэцяя форма: meet – met – met.",
      uk: "«Never» з have — маркер Present Perfect → третя форма: meet – met – met.",
      pl: "„Never” z have to marker Present Perfect → trzecia forma: meet – met – met.",
      ru: "«Never» с have — маркер Present Perfect → третья форма: meet – met – met.",
    },
    level: 1,
  },
  {
    verb: "forget",
    text: "She has [a] my phone number again.",
    options: { a: blank("forgotten", "forgot", "forgetting") },
    translation: {
      be: "Яна зноў забылася мой нумар тэлефона.",
      uk: "Вона знову забула мій номер телефону.",
      pl: "Znowu zapomniała mojego numeru telefonu.",
      ru: "Она снова забыла мой номер телефона.",
    },
    explanation: {
      en: "Has requires the third form. Forgot is the second one and cannot follow has.",
      be: "Has патрабуе трэцюю форму. Forgot — другая, пасля has яна не ставіцца.",
      uk: "Has вимагає третю форму. Forgot — друга, після has вона не ставиться.",
      pl: "Has wymaga trzeciej formy. Forgot to druga i nie może stać po has.",
      ru: "Has требует третью форму. Forgot — вторая, после has она не ставится.",
    },
    level: 2,
  },
  {
    verb: "do",
    text: "He hasn't [a] his homework yet.",
    options: { a: blank("done", "did", "doing") },
    translation: {
      be: "Ён яшчэ не зрабіў хатняе заданне.",
      uk: "Він ще не зробив домашнє завдання.",
      pl: "Jeszcze nie zrobił pracy domowej.",
      ru: "Он ещё не сделал домашнее задание.",
    },
    explanation: {
      en: "“Yet” in a negative sentence signals Present Perfect: do – did – done.",
      be: "«Yet» у адмоўным сказе сігналізуе пра Present Perfect: do – did – done.",
      uk: "«Yet» у заперечному реченні сигналізує про Present Perfect: do – did – done.",
      pl: "„Yet” w zdaniu przeczącym sygnalizuje Present Perfect: do – did – done.",
      ru: "«Yet» в отрицательном предложении сигнализирует о Present Perfect: do – did – done.",
    },
    level: 1,
  },
  {
    verb: "take",
    text: "Someone has [a] my umbrella.",
    options: { a: blank("taken", "took", "taking") },
    translation: {
      be: "Хтосьці ўзяў мой парасон.",
      uk: "Хтось узяв мою парасольку.",
      pl: "Ktoś wziął mój parasol.",
      ru: "Кто-то взял мой зонт.",
    },
    explanation: {
      en: "Has + third form: take – took – taken. The result matters now, not when it happened.",
      be: "Has + трэцяя форма: take – took – taken. Важны вынік цяпер, а не калі гэта здарылася.",
      uk: "Has + третя форма: take – took – taken. Важливий результат зараз, а не коли це сталося.",
      pl: "Has + trzecia forma: take – took – taken. Liczy się skutek teraz, nie moment zdarzenia.",
      ru: "Has + третья форма: take – took – taken. Важен результат сейчас, а не когда это случилось.",
    },
    level: 1,
  },
  {
    verb: "speak",
    text: "I have never [a] to a famous person.",
    options: { a: blank("spoken", "spoke", "speaking") },
    translation: {
      be: "Я ніколі не размаўляў са знакамітым чалавекам.",
      uk: "Я ніколи не розмовляв із відомою людиною.",
      pl: "Nigdy nie rozmawiałem ze sławną osobą.",
      ru: "Я никогда не разговаривал со знаменитым человеком.",
    },
    explanation: {
      en: "Have never + third form: speak – spoke – spoken.",
      be: "Have never + трэцяя форма: speak – spoke – spoken.",
      uk: "Have never + третя форма: speak – spoke – spoken.",
      pl: "Have never + trzecia forma: speak – spoke – spoken.",
      ru: "Have never + третья форма: speak – spoke – spoken.",
    },
    level: 1,
  },
  {
    verb: "give",
    text: "They have just [a] us the good news.",
    options: { a: blank("given", "gave", "giving") },
    translation: {
      be: "Яны толькі што паведамілі нам добрую навіну.",
      uk: "Вони щойно повідомили нам добру новину.",
      pl: "Właśnie przekazali nam dobrą wiadomość.",
      ru: "Они только что сообщили нам хорошую новость.",
    },
    explanation: {
      en: "“Just” with have is Present Perfect → given, not gave.",
      be: "«Just» з have — гэта Present Perfect → given, а не gave.",
      uk: "«Just» з have — це Present Perfect → given, а не gave.",
      pl: "„Just” z have to Present Perfect → given, nie gave.",
      ru: "«Just» с have — это Present Perfect → given, а не gave.",
    },
    level: 2,
  },
  {
    verb: "know",
    text: "We have [a] each other since 2015.",
    options: { a: blank("known", "knew", "knowing") },
    translation: {
      be: "Мы ведаем адзін аднаго з 2015 года.",
      uk: "Ми знаємо одне одного з 2015 року.",
      pl: "Znamy się od 2015 roku.",
      ru: "Мы знаем друг друга с 2015 года.",
    },
    explanation: {
      en: "“Since” means the action started in the past and still goes on → Present Perfect: know – knew – known.",
      be: "«Since» азначае, што дзеянне пачалося ў мінулым і доўжыцца → Present Perfect: know – knew – known.",
      uk: "«Since» означає, що дія почалася в минулому й триває → Present Perfect: know – knew – known.",
      pl: "„Since” oznacza, że czynność zaczęła się w przeszłości i trwa → Present Perfect: know – knew – known.",
      ru: "«Since» означает, что действие началось в прошлом и длится → Present Perfect: know – knew – known.",
    },
    level: 2,
  },
  {
    verb: "fall",
    text: "The temperature has [a] a lot this week.",
    options: { a: blank("fallen", "fell", "falling") },
    translation: {
      be: "На гэтым тыдні тэмпература моцна ўпала.",
      uk: "Цього тижня температура сильно впала.",
      pl: "W tym tygodniu temperatura mocno spadła.",
      ru: "На этой неделе температура сильно упала.",
    },
    explanation: {
      en: "“This week” has not ended yet, so it is Present Perfect: fall – fell – fallen.",
      be: "«This week» яшчэ не скончыўся, таму гэта Present Perfect: fall – fell – fallen.",
      uk: "«This week» ще не скінчився, тому це Present Perfect: fall – fell – fallen.",
      pl: "„This week” jeszcze się nie skończył, więc to Present Perfect: fall – fell – fallen.",
      ru: "«This week» ещё не закончилась, поэтому это Present Perfect: fall – fell – fallen.",
    },
    level: 3,
  },
  {
    verb: "drive",
    text: "He has never [a] a truck before.",
    options: { a: blank("driven", "drove", "driving") },
    translation: {
      be: "Ён ніколі раней не кіраваў грузавіком.",
      uk: "Він ніколи раніше не керував вантажівкою.",
      pl: "Nigdy wcześniej nie prowadził ciężarówki.",
      ru: "Он никогда раньше не водил грузовик.",
    },
    explanation: {
      en: "Has never … before is life experience → Present Perfect: drive – drove – driven.",
      be: "Has never … before — жыццёвы досвед → Present Perfect: drive – drove – driven.",
      uk: "Has never … before — життєвий досвід → Present Perfect: drive – drove – driven.",
      pl: "Has never … before to doświadczenie życiowe → Present Perfect: drive – drove – driven.",
      ru: "Has never … before — жизненный опыт → Present Perfect: drive – drove – driven.",
    },
    level: 1,
  },

  // ── Present Continuous и Past Continuous ────────────────────────────────
  {
    verb: "sleep",
    text: "Be quiet — the baby is [a].",
    options: { a: blank("sleeping", "sleeps", "slept") },
    translation: {
      be: "Цішэй — дзіця спіць.",
      uk: "Тихіше — дитина спить.",
      pl: "Ciszej — dziecko śpi.",
      ru: "Тише — ребёнок спит.",
    },
    explanation: {
      en: "After is/are/am comes the -ing form: the action is happening right now.",
      be: "Пасля is/are/am ідзе форма на -ing: дзеянне адбываецца прама зараз.",
      uk: "Після is/are/am іде форма на -ing: дія відбувається просто зараз.",
      pl: "Po is/are/am stoi forma z -ing: czynność dzieje się właśnie teraz.",
      ru: "После is/are/am идёт форма на -ing: действие происходит прямо сейчас.",
    },
    level: 1,
  },
  {
    verb: "swim",
    text: "Look! The children are [a] in the lake.",
    options: { a: blank("swimming", "swim", "swam") },
    translation: {
      be: "Глядзі! Дзеці плаваюць у возеры.",
      uk: "Дивись! Діти плавають в озері.",
      pl: "Patrz! Dzieci pływają w jeziorze.",
      ru: "Смотри! Дети плавают в озере.",
    },
    explanation: {
      en: "“Look!” plus are → Present Continuous. Note the doubled m: swim → swimming.",
      be: "«Look!» разам з are → Present Continuous. Заўваж падвоеную m: swim → swimming.",
      uk: "«Look!» разом з are → Present Continuous. Зверни увагу на подвоєну m: swim → swimming.",
      pl: "„Look!” razem z are → Present Continuous. Zwróć uwagę na podwojone m: swim → swimming.",
      ru: "«Look!» вместе с are → Present Continuous. Обрати внимание на удвоенную m: swim → swimming.",
    },
    level: 2,
  },
  {
    verb: "sit",
    text: "She is [a] by the window right now.",
    options: { a: blank("sitting", "sits", "sat") },
    translation: {
      be: "Яна зараз сядзіць каля акна.",
      uk: "Вона зараз сидить біля вікна.",
      pl: "Ona siedzi teraz przy oknie.",
      ru: "Она сейчас сидит у окна.",
    },
    explanation: {
      en: "“Right now” with is → -ing form, and the t doubles: sit → sitting.",
      be: "«Right now» з is → форма на -ing, прычым t падвойваецца: sit → sitting.",
      uk: "«Right now» з is → форма на -ing, причому t подвоюється: sit → sitting.",
      pl: "„Right now” z is → forma z -ing, przy czym t się podwaja: sit → sitting.",
      ru: "«Right now» с is → форма на -ing, причём t удваивается: sit → sitting.",
    },
    level: 1,
  },
  {
    verb: "run",
    text: "At the moment he is [a] in the park.",
    options: { a: blank("running", "runs", "ran") },
    translation: {
      be: "У гэты момант ён бегае ў парку.",
      uk: "Цієї миті він бігає в парку.",
      pl: "W tej chwili biega w parku.",
      ru: "В данный момент он бегает в парке.",
    },
    explanation: {
      en: "“At the moment” is the classic marker of Present Continuous: run → running.",
      be: "«At the moment» — класічны маркер Present Continuous: run → running.",
      uk: "«At the moment» — класичний маркер Present Continuous: run → running.",
      pl: "„At the moment” to klasyczny marker Present Continuous: run → running.",
      ru: "«At the moment» — классический маркер Present Continuous: run → running.",
    },
    level: 1,
  },
  {
    verb: "build",
    text: "They are [a] a new bridge this year.",
    options: { a: blank("building", "build", "built") },
    translation: {
      be: "Сёлета яны будуюць новы мост.",
      uk: "Цього року вони будують новий міст.",
      pl: "W tym roku budują nowy most.",
      ru: "В этом году они строят новый мост.",
    },
    explanation: {
      en: "Are + -ing: a long action going on around now, not finished yet.",
      be: "Are + -ing: працяглае дзеянне вакол цяперашняга моманту, яшчэ не скончанае.",
      uk: "Are + -ing: тривала дія навколо теперішнього моменту, ще не завершена.",
      pl: "Are + -ing: długa czynność wokół teraźniejszości, jeszcze niezakończona.",
      ru: "Are + -ing: длительное действие вокруг настоящего момента, ещё не законченное.",
    },
    level: 2,
  },
  {
    verb: "drive",
    text: "Right now he is [a] to work and can't answer the phone.",
    options: { a: blank("driving", "drives", "drove") },
    translation: {
      be: "Зараз ён едзе на працу і не можа адказаць на званок.",
      uk: "Зараз він їде на роботу і не може відповісти на дзвінок.",
      pl: "W tej chwili jedzie do pracy i nie może odebrać telefonu.",
      ru: "Сейчас он едет на работу и не может ответить на звонок.",
    },
    explanation: {
      en: "“Right now” rules out Present Simple: the action is in progress at this very moment.",
      be: "«Right now» выключае Present Simple: дзеянне ідзе якраз у гэты момант.",
      uk: "«Right now» виключає Present Simple: дія триває саме в цей момент.",
      pl: "„Right now” wyklucza Present Simple: czynność trwa właśnie w tej chwili.",
      ru: "«Right now» исключает Present Simple: действие идёт именно в этот момент.",
    },
    level: 2,
  },
  {
    verb: "hold",
    text: "She was [a] a baby in her arms when I saw her.",
    options: { a: blank("holding", "holds", "held") },
    translation: {
      be: "Калі я яе ўбачыў, яна трымала на руках немаўля.",
      uk: "Коли я її побачив, вона тримала на руках немовля.",
      pl: "Kiedy ją zobaczyłem, trzymała na rękach niemowlę.",
      ru: "Когда я её увидел, она держала на руках младенца.",
    },
    explanation: {
      en: "Was + -ing is Past Continuous: a longer action interrupted by a shorter one (saw).",
      be: "Was + -ing — гэта Past Continuous: працяглае дзеянне, перарванае кароткім (saw).",
      uk: "Was + -ing — це Past Continuous: тривала дія, перервана короткою (saw).",
      pl: "Was + -ing to Past Continuous: dłuższa czynność przerwana krótszą (saw).",
      ru: "Was + -ing — это Past Continuous: длительное действие, прерванное коротким (saw).",
    },
    level: 2,
  },
  {
    verb: "lie",
    text: "The cat was [a] on the sofa all afternoon.",
    options: { a: blank("lying", "lies", "lay") },
    translation: {
      be: "Кот праляжаў на канапе ўвесь дзень пасля абеду.",
      uk: "Кіт пролежав на дивані весь день після обіду.",
      pl: "Kot leżał na kanapie całe popołudnie.",
      ru: "Кот пролежал на диване весь день после обеда.",
    },
    explanation: {
      en: "Was + -ing → Past Continuous. Watch the spelling: lie → lying, not “lieing”.",
      be: "Was + -ing → Past Continuous. Сачы за напісаннем: lie → lying, а не «lieing».",
      uk: "Was + -ing → Past Continuous. Стеж за написанням: lie → lying, а не «lieing».",
      pl: "Was + -ing → Past Continuous. Uwaga na pisownię: lie → lying, nie „lieing”.",
      ru: "Was + -ing → Past Continuous. Следи за написанием: lie → lying, а не «lieing».",
    },
    level: 3,
  },

  // ── Базовая форма: после модальных, do/did, to и let's ───────────────────
  {
    verb: "cut",
    text: "Let's [a] the cake now.",
    options: { a: blank("cut", "cuts", "cutting") },
    translation: {
      be: "Давайце разрэжам торт зараз.",
      uk: "Давайте розріжемо торт зараз.",
      pl: "Pokrójmy teraz ciasto.",
      ru: "Давайте разрежем торт сейчас.",
    },
    explanation: {
      en: "After let's the verb always stays in the bare first form.",
      be: "Пасля let's дзеяслоў заўсёды застаецца ў чыстай першай форме.",
      uk: "Після let's дієслово завжди залишається в чистій першій формі.",
      pl: "Po let's czasownik zawsze zostaje w czystej pierwszej formie.",
      ru: "После let's глагол всегда остаётся в чистой первой форме.",
    },
    level: 1,
  },
  {
    verb: "go",
    text: "We must [a] home before dark.",
    options: { a: blank("go", "goes", "went") },
    translation: {
      be: "Мы павінны пайсці дадому да змяркання.",
      uk: "Ми маємо піти додому до темряви.",
      pl: "Musimy wrócić do domu przed zmrokiem.",
      ru: "Мы должны пойти домой до темноты.",
    },
    explanation: {
      en: "A modal (must, can, should) is always followed by the bare first form — no -s and no past.",
      be: "Пасля мадальнага (must, can, should) заўсёды чыстая першая форма — без -s і без мінулага.",
      uk: "Після модального (must, can, should) завжди чиста перша форма — без -s і без минулого.",
      pl: "Po czasowniku modalnym (must, can, should) zawsze stoi czysta pierwsza forma — bez -s i bez czasu przeszłego.",
      ru: "После модального (must, can, should) всегда чистая первая форма — без -s и без прошедшего.",
    },
    level: 1,
  },
  {
    verb: "drink",
    text: "You shouldn't [a] so much coffee.",
    options: { a: blank("drink", "drinks", "drank") },
    translation: {
      be: "Табе не варта піць столькі кавы.",
      uk: "Тобі не варто пити стільки кави.",
      pl: "Nie powinieneś pić tyle kawy.",
      ru: "Тебе не стоит пить столько кофе.",
    },
    explanation: {
      en: "Shouldn't is a modal, so the verb after it keeps the first form.",
      be: "Shouldn't — мадальны, таму дзеяслоў пасля яго застаецца ў першай форме.",
      uk: "Shouldn't — модальний, тому дієслово після нього залишається в першій формі.",
      pl: "Shouldn't to czasownik modalny, więc czasownik po nim zostaje w pierwszej formie.",
      ru: "Shouldn't — модальный, поэтому глагол после него остаётся в первой форме.",
    },
    level: 1,
  },
  {
    verb: "bring",
    text: "Did you [a] your passport?",
    options: { a: blank("bring", "brings", "brought") },
    translation: {
      be: "Ты ўзяў з сабой пашпарт?",
      uk: "Ти взяв із собою паспорт?",
      pl: "Wziąłeś ze sobą paszport?",
      ru: "Ты взял с собой паспорт?",
    },
    explanation: {
      en: "Did already carries the past, so the main verb goes back to the first form. Two past markers in one sentence are wrong.",
      be: "Did ужо нясе мінулае, таму асноўны дзеяслоў вяртаецца ў першую форму. Два маркеры мінулага ў адным сказе — памылка.",
      uk: "Did уже несе минуле, тому основне дієслово повертається в першу форму. Два маркери минулого в одному реченні — помилка.",
      pl: "Did już niesie przeszłość, więc czasownik główny wraca do pierwszej formy. Dwa markery przeszłości w jednym zdaniu to błąd.",
      ru: "Did уже несёт прошедшее, поэтому основной глагол возвращается в первую форму. Два маркера прошлого в одном предложении — ошибка.",
    },
    level: 2,
  },
  {
    verb: "wear",
    text: "She doesn't [a] glasses.",
    options: { a: blank("wear", "wears", "wore") },
    translation: {
      be: "Яна не носіць акуляры.",
      uk: "Вона не носить окуляри.",
      pl: "Ona nie nosi okularów.",
      ru: "Она не носит очки.",
    },
    explanation: {
      en: "Doesn't already holds the -s of the third person, so the main verb loses it: doesn't wear.",
      be: "Doesn't ужо трымае -s трэцяй асобы, таму асноўны дзеяслоў яе губляе: doesn't wear.",
      uk: "Doesn't уже тримає -s третьої особи, тому основне дієслово її втрачає: doesn't wear.",
      pl: "Doesn't już zawiera -s trzeciej osoby, więc czasownik główny je traci: doesn't wear.",
      ru: "Doesn't уже держит -s третьего лица, поэтому основной глагол её теряет: doesn't wear.",
    },
    level: 2,
  },
  {
    verb: "say",
    text: "I want to [a] something important.",
    options: { a: blank("say", "says", "said") },
    translation: {
      be: "Я хачу сказаць нешта важнае.",
      uk: "Я хочу сказати щось важливе.",
      pl: "Chcę powiedzieć coś ważnego.",
      ru: "Я хочу сказать что-то важное.",
    },
    explanation: {
      en: "After the particle to comes the infinitive — the plain first form.",
      be: "Пасля часціцы to ідзе інфінітыў — простая першая форма.",
      uk: "Після частки to йде інфінітив — проста перша форма.",
      pl: "Po partykule to stoi bezokolicznik — prosta pierwsza forma.",
      ru: "После частицы to идёт инфинитив — простая первая форма.",
    },
    level: 1,
  },
  {
    verb: "sing",
    text: "Can you [a] this song?",
    options: { a: blank("sing", "sings", "sang") },
    translation: {
      be: "Ты можаш заспяваць гэтую песню?",
      uk: "Ти можеш заспівати цю пісню?",
      pl: "Umiesz zaśpiewać tę piosenkę?",
      ru: "Ты можешь спеть эту песню?",
    },
    explanation: {
      en: "Can is a modal: the verb after it never takes -s or a past form.",
      be: "Can — мадальны: дзеяслоў пасля яго ніколі не бярэ -s і не стаіць у мінулым.",
      uk: "Can — модальний: дієслово після нього ніколи не бере -s і не стоїть у минулому.",
      pl: "Can to czasownik modalny: czasownik po nim nigdy nie przyjmuje -s ani formy przeszłej.",
      ru: "Can — модальный: глагол после него никогда не берёт -s и не стоит в прошедшем.",
    },
    level: 1,
  },
  {
    verb: "lend",
    text: "Could you [a] me ten euros?",
    options: { a: blank("lend", "lends", "lent") },
    translation: {
      be: "Ты не пазычыш мне дзесяць еўра?",
      uk: "Ти не позичиш мені десять євро?",
      pl: "Pożyczysz mi dziesięć euro?",
      ru: "Ты не одолжишь мне десять евро?",
    },
    explanation: {
      en: "Could is a modal too: it is polite, not past, and the verb after it stays bare.",
      be: "Could таксама мадальны: тут ён ветлівы, а не мінулы, і дзеяслоў пасля яго застаецца чыстым.",
      uk: "Could теж модальний: тут він ввічливий, а не минулий, і дієслово після нього залишається чистим.",
      pl: "Could też jest modalny: tutaj wyraża uprzejmość, nie przeszłość, a czasownik po nim zostaje czysty.",
      ru: "Could тоже модальный: здесь он вежливый, а не прошедший, и глагол после него остаётся чистым.",
    },
    level: 2,
  },
  {
    verb: "keep",
    text: "He didn't [a] his promise.",
    options: { a: blank("keep", "keeps", "kept") },
    translation: {
      be: "Ён не стрымаў сваё абяцанне.",
      uk: "Він не дотримав своєї обіцянки.",
      pl: "Nie dotrzymał obietnicy.",
      ru: "Он не сдержал своё обещание.",
    },
    explanation: {
      en: "Didn't carries the past by itself, so kept would double it: didn't keep.",
      be: "Didn't сам нясе мінулае, таму kept падвойвала б яго: didn't keep.",
      uk: "Didn't сам несе минуле, тому kept подвоювало б його: didn't keep.",
      pl: "Didn't samo niesie przeszłość, więc kept by ją podwoiło: didn't keep.",
      ru: "Didn't сам несёт прошедшее, поэтому kept удваивало бы его: didn't keep.",
    },
    level: 2,
  },

  // ── Present Simple, третье лицо ─────────────────────────────────────────
  {
    verb: "get",
    text: "My brother [a] up at six because he starts work early.",
    options: { a: blank("gets", "get", "got") },
    translation: {
      be: "Мой брат устае а шостай, бо рана пачынае працу.",
      uk: "Мій брат встає о шостій, бо рано починає роботу.",
      pl: "Mój brat wstaje o szóstej, bo wcześnie zaczyna pracę.",
      ru: "Мой брат встаёт в шесть, потому что рано начинает работу.",
    },
    explanation: {
      en: "“Starts” in the second half fixes the present, and he requires the -s ending.",
      be: "«Starts» у другой частцы замацоўвае цяперашні час, а he патрабуе канчатак -s.",
      uk: "«Starts» у другій частині закріплює теперішній час, а he вимагає закінчення -s.",
      pl: "„Starts” w drugiej części ustala czas teraźniejszy, a he wymaga końcówki -s.",
      ru: "«Starts» во второй части закрепляет настоящее время, а he требует окончания -s.",
    },
    level: 2,
  },
  {
    verb: "leave",
    text: "The train [a] at eight every morning, so don't be late.",
    options: { a: blank("leaves", "leave", "left") },
    translation: {
      be: "Цягнік адпраўляецца а восьмай кожную раніцу, таму не спазняйся.",
      uk: "Потяг відходить о восьмій щоранку, тож не запізнюйся.",
      pl: "Pociąg odjeżdża o ósmej każdego ranka, więc się nie spóźnij.",
      ru: "Поезд отправляется в восемь каждое утро, так что не опаздывай.",
    },
    explanation: {
      en: "A timetable is Present Simple, and the imperative “don't be late” keeps the whole sentence in the present.",
      be: "Расклад — гэта Present Simple, а загад «don't be late» трымае ўвесь сказ у цяперашнім.",
      uk: "Розклад — це Present Simple, а наказ «don't be late» тримає все речення в теперішньому.",
      pl: "Rozkład jazdy to Present Simple, a rozkaz „don't be late” trzyma całe zdanie w teraźniejszości.",
      ru: "Расписание — это Present Simple, а приказ «don't be late» держит всё предложение в настоящем.",
    },
    level: 2,
  },
  {
    verb: "make",
    text: "She [a] her own bread and never buys it in a shop.",
    options: { a: blank("makes", "make", "made") },
    translation: {
      be: "Яна сама пячэ хлеб і ніколі не купляе яго ў краме.",
      uk: "Вона сама пече хліб і ніколи не купує його в магазині.",
      pl: "Sama piecze chleb i nigdy nie kupuje go w sklepie.",
      ru: "Она сама печёт хлеб и никогда не покупает его в магазине.",
    },
    explanation: {
      en: "“Buys” in the second half is present, and both verbs share the subject she → makes.",
      be: "«Buys» у другой частцы — цяперашні час, і абодва дзеясловы маюць адзін дзейнік she → makes.",
      uk: "«Buys» у другій частині — теперішній час, і обидва дієслова мають один підмет she → makes.",
      pl: "„Buys” w drugiej części jest w teraźniejszości, a oba czasowniki mają ten sam podmiot she → makes.",
      ru: "«Buys» во второй части — настоящее время, и у обоих глаголов одно подлежащее she → makes.",
    },
    level: 2,
  },
  {
    verb: "hurt",
    text: "My knee [a] every time I run.",
    options: { a: blank("hurts", "hurt", "hurting") },
    translation: {
      be: "Маё калена баліць кожны раз, калі я бягу.",
      uk: "Моє коліно болить щоразу, коли я біжу.",
      pl: "Kolano boli mnie za każdym razem, gdy biegnę.",
      ru: "Моё колено болит каждый раз, когда я бегу.",
    },
    explanation: {
      en: "“I run” is present, so the main clause is present too; knee is “it” and takes the -s.",
      be: "«I run» — цяперашні час, значыць і галоўная частка ў цяперашнім; knee — гэта «it», таму -s.",
      uk: "«I run» — теперішній час, отже й головна частина в теперішньому; knee — це «it», тому -s.",
      pl: "„I run” jest w teraźniejszości, więc zdanie główne też; knee to „it”, stąd -s.",
      ru: "«I run» — настоящее время, значит и главная часть в настоящем; knee — это «it», поэтому -s.",
    },
    level: 3,
  },
  {
    verb: "spend",
    text: "He [a] every weekend with his family and loves it.",
    options: { a: blank("spends", "spend", "spent") },
    translation: {
      be: "Ён праводзіць кожныя выхадныя з сям'ёй і вельмі гэта любіць.",
      uk: "Він проводить кожні вихідні з родиною і дуже це любить.",
      pl: "Spędza każdy weekend z rodziną i bardzo to lubi.",
      ru: "Он проводит каждые выходные с семьёй и очень это любит.",
    },
    explanation: {
      en: "“Loves” pins the present, and he needs the -s: spends.",
      be: "«Loves» замацоўвае цяперашні час, а he патрабуе -s: spends.",
      uk: "«Loves» закріплює теперішній час, а he вимагає -s: spends.",
      pl: "„Loves” ustala teraźniejszość, a he wymaga -s: spends.",
      ru: "«Loves» закрепляет настоящее время, а he требует -s: spends.",
    },
    level: 2,
  },
  {
    verb: "fly",
    text: "This bird [a] south when the weather gets cold.",
    options: { a: blank("flies", "fly", "flew") },
    translation: {
      be: "Гэтая птушка ляціць на поўдзень, калі надвор'е становіцца халодным.",
      uk: "Цей птах летить на південь, коли погода стає холодною.",
      pl: "Ten ptak leci na południe, gdy robi się zimno.",
      ru: "Эта птица летит на юг, когда погода становится холодной.",
    },
    explanation: {
      en: "“Gets” keeps the sentence in the present. After a consonant, -y turns into -ies: fly → flies.",
      be: "«Gets» трымае сказ у цяперашнім. Пасля зычнай -y пераходзіць у -ies: fly → flies.",
      uk: "«Gets» тримає речення в теперішньому. Після приголосної -y переходить в -ies: fly → flies.",
      pl: "„Gets” trzyma zdanie w teraźniejszości. Po spółgłosce -y przechodzi w -ies: fly → flies.",
      ru: "«Gets» держит предложение в настоящем. После согласной -y переходит в -ies: fly → flies.",
    },
    level: 3,
  },

  // ── Пассивный залог ─────────────────────────────────────────────────────
  {
    verb: "steal",
    text: "My bike was [a] last night.",
    options: { a: blank("stolen", "stole", "stealing") },
    translation: {
      be: "Мой веласіпед скралі ўчора ўвечары.",
      uk: "Мій велосипед украли вчора ввечері.",
      pl: "Mój rower ukradziono wczoraj wieczorem.",
      ru: "Мой велосипед украли вчера вечером.",
    },
    explanation: {
      en: "Was + third form is the passive: the bike did not act, it was acted upon.",
      be: "Was + трэцяя форма — гэта пасіў: веласіпед не дзейнічаў, дзеянне зрабілі з ім.",
      uk: "Was + третя форма — це пасив: велосипед не діяв, дію зробили з ним.",
      pl: "Was + trzecia forma to strona bierna: rower nie działał, czynność wykonano na nim.",
      ru: "Was + третья форма — это пассив: велосипед не действовал, действие совершили с ним.",
    },
    level: 2,
  },
  {
    verb: "write",
    text: "This book was [a] a hundred years ago.",
    options: { a: blank("written", "wrote", "writing") },
    translation: {
      be: "Гэтая кніга была напісана сто гадоў таму.",
      uk: "Цю книжку було написано сто років тому.",
      pl: "Ta książka została napisana sto lat temu.",
      ru: "Эта книга была написана сто лет назад.",
    },
    explanation: {
      en: "The book cannot write, so it is the passive: was + written.",
      be: "Кніга не можа пісаць, таму гэта пасіў: was + written.",
      uk: "Книжка не може писати, тому це пасив: was + written.",
      pl: "Książka nie może pisać, więc to strona bierna: was + written.",
      ru: "Книга не может писать, поэтому это пассив: was + written.",
    },
    level: 2,
  },
  {
    verb: "speak",
    text: "English is [a] in more than fifty countries.",
    options: { a: blank("spoken", "speaks", "speaking") },
    translation: {
      be: "Па-англійску размаўляюць больш чым у пяцідзесяці краінах.",
      uk: "Англійською розмовляють більш ніж у п'ятдесяти країнах.",
      pl: "Po angielsku mówi się w ponad pięćdziesięciu krajach.",
      ru: "На английском говорят более чем в пятидесяти странах.",
    },
    explanation: {
      en: "Is + third form is the present passive. A language cannot speak, so “is speaking” is impossible here.",
      be: "Is + трэцяя форма — цяперашні пасіў. Мова не можа размаўляць, таму «is speaking» тут немагчыма.",
      uk: "Is + третя форма — теперішній пасив. Мова не може розмовляти, тому «is speaking» тут неможливе.",
      pl: "Is + trzecia forma to strona bierna w teraźniejszości. Język nie może mówić, więc „is speaking” jest tu niemożliwe.",
      ru: "Is + третья форма — настоящий пассив. Язык не может говорить, поэтому «is speaking» здесь невозможно.",
    },
    level: 2,
  },
];
