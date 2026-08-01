import type { LocalizedText } from "./groups";

export type SeedVerb = {
  /** [V1, V2, V3] — инфинитив, Past Simple, Past Participle. */
  forms: [string, string, string];
  translation: LocalizedText;
  /** Ключи групп из groups.ts; глагол может входить в несколько групп. */
  groups: string[];
};

/**
 * Полный список неправильных глаголов современного английского.
 * База — «Карта неправильных глаголов» и рабочий Google-док, дополнено до
 * полного списка. У глаголов с двойными формами (burn, learn, dream…)
 * записан неправильный вариант (burnt, learnt, dreamt).
 * Файл упорядочен по «основной» группе глагола.
 */
export const verbs: SeedVerb[] = [
  // ── Все три формы одинаковые ────────────────────────────────────────────
  { forms: ["bet", "bet", "bet"], translation: { en: "bet", be: "рабіць стаўку", uk: "робити ставку", pl: "zakładać się", ru: "делать ставку" }, groups: ["identical-forms"] },
  { forms: ["bid", "bid", "bid"], translation: { en: "bid", be: "прапаноўваць цану", uk: "пропонувати ціну", pl: "licytować", ru: "предлагать цену" }, groups: ["identical-forms", "prefixes"] },
  { forms: ["burst", "burst", "burst"], translation: { en: "burst", be: "выбухаць", uk: "вибухати", pl: "pękać", ru: "взрываться" }, groups: ["identical-forms"] },
  { forms: ["cast", "cast", "cast"], translation: { en: "cast", be: "кідаць", uk: "кидати", pl: "rzucać", ru: "бросать" }, groups: ["identical-forms", "prefixes"] },
  { forms: ["cost", "cost", "cost"], translation: { en: "cost", be: "каштаваць", uk: "коштувати", pl: "kosztować", ru: "стоить" }, groups: ["identical-forms"] },
  { forms: ["cut", "cut", "cut"], translation: { en: "cut", be: "рэзаць", uk: "різати", pl: "ciąć", ru: "резать" }, groups: ["identical-forms"] },
  { forms: ["fit", "fit", "fit"], translation: { en: "fit", be: "пасаваць", uk: "пасувати", pl: "pasować", ru: "подходить по размеру" }, groups: ["identical-forms"] },
  { forms: ["hit", "hit", "hit"], translation: { en: "hit", be: "удараць", uk: "ударяти", pl: "uderzać", ru: "ударять" }, groups: ["identical-forms"] },
  { forms: ["hurt", "hurt", "hurt"], translation: { en: "hurt", be: "прычыняць боль", uk: "завдавати болю", pl: "ranić", ru: "причинять боль" }, groups: ["identical-forms"] },
  { forms: ["let", "let", "let"], translation: { en: "let", be: "дазваляць", uk: "дозволяти", pl: "pozwalać", ru: "позволять" }, groups: ["identical-forms"] },
  { forms: ["put", "put", "put"], translation: { en: "put", be: "класці", uk: "класти", pl: "kłaść", ru: "класть, ставить" }, groups: ["identical-forms"] },
  { forms: ["quit", "quit", "quit"], translation: { en: "quit", be: "кідаць, звальняцца", uk: "кидати, звільнятися", pl: "rzucać, odchodzić", ru: "оставлять, увольняться" }, groups: ["identical-forms"] },
  { forms: ["read", "read", "read"], translation: { en: "read", be: "чытаць", uk: "читати", pl: "czytać", ru: "читать (меняется произношение)" }, groups: ["identical-forms"] },
  { forms: ["rid", "rid", "rid"], translation: { en: "rid", be: "пазбаўляць", uk: "позбавляти", pl: "pozbywać się", ru: "избавлять" }, groups: ["identical-forms"] },
  { forms: ["set", "set", "set"], translation: { en: "set", be: "усталёўваць", uk: "встановлювати", pl: "ustawiać", ru: "устанавливать" }, groups: ["identical-forms", "prefixes"] },
  { forms: ["shed", "shed", "shed"], translation: { en: "shed", be: "скідаць, праліваць", uk: "скидати, проливати", pl: "zrzucać", ru: "сбрасывать, проливать" }, groups: ["identical-forms"] },
  { forms: ["shut", "shut", "shut"], translation: { en: "shut", be: "зачыняць", uk: "зачиняти", pl: "zamykać", ru: "закрывать" }, groups: ["identical-forms"] },
  { forms: ["slit", "slit", "slit"], translation: { en: "slit", be: "разразаць", uk: "розрізати", pl: "rozcinać", ru: "разрезать" }, groups: ["identical-forms"] },
  { forms: ["split", "split", "split"], translation: { en: "split", be: "раздзяляць", uk: "розділяти", pl: "dzielić", ru: "разделять, раскалывать" }, groups: ["identical-forms"] },
  { forms: ["spread", "spread", "spread"], translation: { en: "spread", be: "распаўсюджваць", uk: "поширювати", pl: "rozprzestrzeniać", ru: "распространять" }, groups: ["identical-forms"] },
  { forms: ["sweat", "sweat", "sweat"], translation: { en: "sweat", be: "пацець", uk: "пітніти", pl: "pocić się", ru: "потеть" }, groups: ["identical-forms"] },
  { forms: ["thrust", "thrust", "thrust"], translation: { en: "thrust", be: "штурхаць", uk: "штовхати", pl: "pchać", ru: "толкать" }, groups: ["identical-forms"] },
  { forms: ["wed", "wed", "wed"], translation: { en: "wed", be: "жаніцца, вянчаць", uk: "одружуватися", pl: "poślubiać", ru: "жениться, венчать" }, groups: ["identical-forms"] },
  { forms: ["wet", "wet", "wet"], translation: { en: "wet", be: "мачыць", uk: "мочити", pl: "moczyć", ru: "мочить" }, groups: ["identical-forms"] },
  { forms: ["upset", "upset", "upset"], translation: { en: "upset", be: "засмучаць", uk: "засмучувати", pl: "martwić", ru: "расстраивать" }, groups: ["identical-forms", "prefixes"] },
  { forms: ["broadcast", "broadcast", "broadcast"], translation: { en: "broadcast", be: "трансляваць", uk: "транслювати", pl: "transmitować", ru: "транслировать" }, groups: ["identical-forms", "prefixes"] },
  { forms: ["forecast", "forecast", "forecast"], translation: { en: "forecast", be: "прагназаваць", uk: "прогнозувати", pl: "prognozować", ru: "прогнозировать" }, groups: ["identical-forms", "prefixes"] },

  // ── i → a → u ───────────────────────────────────────────────────────────
  { forms: ["begin", "began", "begun"], translation: { en: "begin", be: "пачынаць", uk: "починати", pl: "zaczynać", ru: "начинать" }, groups: ["i-a-u"] },
  { forms: ["drink", "drank", "drunk"], translation: { en: "drink", be: "піць", uk: "пити", pl: "pić", ru: "пить" }, groups: ["i-a-u"] },
  { forms: ["ring", "rang", "rung"], translation: { en: "ring", be: "званіць", uk: "дзвонити", pl: "dzwonić", ru: "звонить" }, groups: ["i-a-u"] },
  { forms: ["shrink", "shrank", "shrunk"], translation: { en: "shrink", be: "сціскацца", uk: "стискатися", pl: "kurczyć się", ru: "сжиматься" }, groups: ["i-a-u"] },
  { forms: ["sing", "sang", "sung"], translation: { en: "sing", be: "спяваць", uk: "співати", pl: "śpiewać", ru: "петь" }, groups: ["i-a-u"] },
  { forms: ["sink", "sank", "sunk"], translation: { en: "sink", be: "тануць", uk: "тонути", pl: "tonąć", ru: "тонуть" }, groups: ["i-a-u"] },
  { forms: ["spring", "sprang", "sprung"], translation: { en: "spring", be: "скакаць", uk: "стрибати", pl: "skakać", ru: "прыгать" }, groups: ["i-a-u"] },
  { forms: ["stink", "stank", "stunk"], translation: { en: "stink", be: "смярдзець", uk: "смердіти", pl: "śmierdzieć", ru: "вонять" }, groups: ["i-a-u"] },
  { forms: ["swim", "swam", "swum"], translation: { en: "swim", be: "плаваць", uk: "плавати", pl: "pływać", ru: "плавать" }, groups: ["i-a-u"] },

  // ── i → u → u ───────────────────────────────────────────────────────────
  { forms: ["cling", "clung", "clung"], translation: { en: "cling", be: "чапляцца", uk: "чіплятися", pl: "czepiać się", ru: "цепляться" }, groups: ["i-u-u"] },
  { forms: ["dig", "dug", "dug"], translation: { en: "dig", be: "капаць", uk: "копати", pl: "kopać", ru: "копать" }, groups: ["i-u-u"] },
  { forms: ["fling", "flung", "flung"], translation: { en: "fling", be: "шпурляць", uk: "жбурляти", pl: "ciskać", ru: "швырять" }, groups: ["i-u-u"] },
  { forms: ["hang", "hung", "hung"], translation: { en: "hang", be: "вісець, вешаць", uk: "висіти, вішати", pl: "wisieć, wieszać", ru: "висеть, вешать" }, groups: ["i-u-u", "confusing-pairs"] },
  { forms: ["sling", "slung", "slung"], translation: { en: "sling", be: "кідаць", uk: "жбурляти", pl: "miotać", ru: "метать" }, groups: ["i-u-u"] },
  { forms: ["slink", "slunk", "slunk"], translation: { en: "slink", be: "красціся", uk: "скрадатися", pl: "skradać się", ru: "красться" }, groups: ["i-u-u"] },
  { forms: ["spin", "spun", "spun"], translation: { en: "spin", be: "круціць", uk: "крутити", pl: "kręcić", ru: "крутить" }, groups: ["i-u-u"] },
  { forms: ["stick", "stuck", "stuck"], translation: { en: "stick", be: "прыклейваць", uk: "приклеювати", pl: "przyklejać", ru: "приклеивать" }, groups: ["i-u-u"] },
  { forms: ["sting", "stung", "stung"], translation: { en: "sting", be: "джаліць", uk: "жалити", pl: "żądlić", ru: "жалить" }, groups: ["i-u-u"] },
  { forms: ["strike", "struck", "struck"], translation: { en: "strike", be: "біць, баставаць", uk: "бити, страйкувати", pl: "uderzać, strajkować", ru: "ударять, бастовать" }, groups: ["i-u-u"] },
  { forms: ["string", "strung", "strung"], translation: { en: "string", be: "нанізваць", uk: "нанизувати", pl: "nawlekać", ru: "нанизывать" }, groups: ["i-u-u"] },
  { forms: ["swing", "swung", "swung"], translation: { en: "swing", be: "гайдаць", uk: "гойдати", pl: "huśtać", ru: "качать" }, groups: ["i-u-u"] },
  { forms: ["win", "won", "won"], translation: { en: "win", be: "перамагаць", uk: "перемагати", pl: "wygrywać", ru: "побеждать" }, groups: ["i-u-u"] },
  { forms: ["wring", "wrung", "wrung"], translation: { en: "wring", be: "выкручваць", uk: "викручувати", pl: "wykręcać", ru: "выжимать, выкручивать" }, groups: ["i-u-u"] },

  // ── i → ou → ou ─────────────────────────────────────────────────────────
  { forms: ["bind", "bound", "bound"], translation: { en: "bind", be: "звязваць", uk: "зв'язувати", pl: "wiązać", ru: "связывать" }, groups: ["i-ou-ou"] },
  { forms: ["find", "found", "found"], translation: { en: "find", be: "знаходзіць", uk: "знаходити", pl: "znajdować", ru: "находить" }, groups: ["i-ou-ou", "confusing-pairs"] },
  { forms: ["grind", "ground", "ground"], translation: { en: "grind", be: "малоць", uk: "молоти", pl: "mleć", ru: "молоть" }, groups: ["i-ou-ou"] },
  { forms: ["wind", "wound", "wound"], translation: { en: "wind", be: "наматваць", uk: "намотувати", pl: "nawijać", ru: "наматывать" }, groups: ["i-ou-ou"] },

  // ── Гласная сокращается, V2 = V3 ────────────────────────────────────────
  { forms: ["bleed", "bled", "bled"], translation: { en: "bleed", be: "крывавіць", uk: "кровоточити", pl: "krwawić", ru: "кровоточить" }, groups: ["vowel-shortening"] },
  { forms: ["breed", "bred", "bred"], translation: { en: "breed", be: "разводзіць", uk: "розводити", pl: "hodować", ru: "разводить (животных)" }, groups: ["vowel-shortening"] },
  { forms: ["feed", "fed", "fed"], translation: { en: "feed", be: "карміць", uk: "годувати", pl: "karmić", ru: "кормить" }, groups: ["vowel-shortening"] },
  { forms: ["flee", "fled", "fled"], translation: { en: "flee", be: "уцякаць", uk: "тікати", pl: "uciekać", ru: "убегать, спасаться бегством" }, groups: ["vowel-shortening"] },
  { forms: ["hear", "heard", "heard"], translation: { en: "hear", be: "чуць", uk: "чути", pl: "słyszeć", ru: "слышать" }, groups: ["vowel-shortening", "prefixes"] },
  { forms: ["hold", "held", "held"], translation: { en: "hold", be: "трымаць", uk: "тримати", pl: "trzymać", ru: "держать" }, groups: ["vowel-shortening", "prefixes"] },
  { forms: ["lead", "led", "led"], translation: { en: "lead", be: "весці", uk: "вести", pl: "prowadzić", ru: "вести" }, groups: ["vowel-shortening"] },
  { forms: ["light", "lit", "lit"], translation: { en: "light", be: "запальваць", uk: "запалювати", pl: "zapalać", ru: "зажигать" }, groups: ["vowel-shortening"] },
  { forms: ["meet", "met", "met"], translation: { en: "meet", be: "сустракаць", uk: "зустрічати", pl: "spotykać", ru: "встречать" }, groups: ["vowel-shortening"] },
  { forms: ["shoot", "shot", "shot"], translation: { en: "shoot", be: "страляць", uk: "стріляти", pl: "strzelać", ru: "стрелять" }, groups: ["vowel-shortening"] },
  { forms: ["slide", "slid", "slid"], translation: { en: "slide", be: "слізгаць", uk: "ковзати", pl: "ślizgać się", ru: "скользить" }, groups: ["vowel-shortening"] },
  { forms: ["speed", "sped", "sped"], translation: { en: "speed", be: "імчаць", uk: "мчати", pl: "pędzić", ru: "мчаться" }, groups: ["vowel-shortening"] },

  // ── Окончание -t вместо -ed ─────────────────────────────────────────────
  { forms: ["bend", "bent", "bent"], translation: { en: "bend", be: "гнуць", uk: "гнути", pl: "zginać", ru: "гнуть" }, groups: ["t-ending"] },
  { forms: ["bereave", "bereft", "bereft"], translation: { en: "bereave", be: "пазбаўляць (блізкага)", uk: "позбавляти (близького)", pl: "pozbawiać", ru: "лишать (близкого)" }, groups: ["t-ending"] },
  { forms: ["build", "built", "built"], translation: { en: "build", be: "будаваць", uk: "будувати", pl: "budować", ru: "строить" }, groups: ["t-ending"] },
  { forms: ["burn", "burnt", "burnt"], translation: { en: "burn", be: "гарэць, паліць", uk: "горіти, палити", pl: "palić", ru: "гореть, жечь" }, groups: ["t-ending"] },
  { forms: ["creep", "crept", "crept"], translation: { en: "creep", be: "паўзці", uk: "повзти", pl: "pełzać", ru: "ползти" }, groups: ["t-ending"] },
  { forms: ["deal", "dealt", "dealt"], translation: { en: "deal", be: "мець справу", uk: "мати справу", pl: "mieć do czynienia", ru: "иметь дело" }, groups: ["t-ending"] },
  { forms: ["dream", "dreamt", "dreamt"], translation: { en: "dream", be: "марыць, сніць", uk: "мріяти, снити", pl: "śnić, marzyć", ru: "мечтать, видеть сны" }, groups: ["t-ending"] },
  { forms: ["dwell", "dwelt", "dwelt"], translation: { en: "dwell", be: "жыць, пражываць", uk: "мешкати", pl: "mieszkać", ru: "обитать, проживать" }, groups: ["t-ending"] },
  { forms: ["feel", "felt", "felt"], translation: { en: "feel", be: "адчуваць", uk: "відчувати", pl: "czuć", ru: "чувствовать" }, groups: ["t-ending"] },
  { forms: ["keep", "kept", "kept"], translation: { en: "keep", be: "захоўваць", uk: "зберігати", pl: "zachowywać", ru: "хранить" }, groups: ["t-ending"] },
  { forms: ["kneel", "knelt", "knelt"], translation: { en: "kneel", be: "станавіцца на калені", uk: "ставати на коліна", pl: "klękać", ru: "становиться на колени" }, groups: ["t-ending"] },
  { forms: ["lean", "leant", "leant"], translation: { en: "lean", be: "нахіляцца", uk: "нахилятися", pl: "opierać się", ru: "наклоняться, опираться" }, groups: ["t-ending"] },
  { forms: ["leap", "leapt", "leapt"], translation: { en: "leap", be: "скакаць", uk: "стрибати", pl: "skakać", ru: "прыгать, скакать" }, groups: ["t-ending"] },
  { forms: ["learn", "learnt", "learnt"], translation: { en: "learn", be: "вучыцца", uk: "вчитися", pl: "uczyć się", ru: "учиться" }, groups: ["t-ending"] },
  { forms: ["leave", "left", "left"], translation: { en: "leave", be: "пакідаць", uk: "залишати", pl: "opuszczać", ru: "покидать" }, groups: ["t-ending"] },
  { forms: ["lend", "lent", "lent"], translation: { en: "lend", be: "пазычаць", uk: "позичати", pl: "pożyczać", ru: "одалживать" }, groups: ["t-ending"] },
  { forms: ["lose", "lost", "lost"], translation: { en: "lose", be: "губляць", uk: "втрачати", pl: "gubić, tracić", ru: "терять" }, groups: ["t-ending"] },
  { forms: ["mean", "meant", "meant"], translation: { en: "mean", be: "значыць", uk: "означати", pl: "znaczyć", ru: "значить" }, groups: ["t-ending"] },
  { forms: ["send", "sent", "sent"], translation: { en: "send", be: "пасылаць", uk: "надсилати", pl: "wysyłać", ru: "посылать" }, groups: ["t-ending"] },
  { forms: ["sleep", "slept", "slept"], translation: { en: "sleep", be: "спаць", uk: "спати", pl: "spać", ru: "спать" }, groups: ["t-ending"] },
  { forms: ["smell", "smelt", "smelt"], translation: { en: "smell", be: "пахнуць, нюхаць", uk: "пахнути, нюхати", pl: "pachnieć, wąchać", ru: "пахнуть, нюхать" }, groups: ["t-ending"] },
  { forms: ["spell", "spelt", "spelt"], translation: { en: "spell", be: "вымаўляць па літарах", uk: "писати по літерах", pl: "literować", ru: "произносить по буквам" }, groups: ["t-ending"] },
  { forms: ["spend", "spent", "spent"], translation: { en: "spend", be: "траціць", uk: "витрачати", pl: "wydawać", ru: "тратить" }, groups: ["t-ending"] },
  { forms: ["spill", "spilt", "spilt"], translation: { en: "spill", be: "праліваць", uk: "проливати", pl: "rozlewać", ru: "проливать" }, groups: ["t-ending"] },
  { forms: ["spoil", "spoilt", "spoilt"], translation: { en: "spoil", be: "псаваць", uk: "псувати", pl: "psuć", ru: "портить" }, groups: ["t-ending"] },
  { forms: ["sweep", "swept", "swept"], translation: { en: "sweep", be: "падмятаць", uk: "підмітати", pl: "zamiatać", ru: "подметать" }, groups: ["t-ending"] },
  { forms: ["weep", "wept", "wept"], translation: { en: "weep", be: "плакаць", uk: "плакати", pl: "płakać", ru: "плакать" }, groups: ["t-ending"] },

  // ── ow → ew → own ───────────────────────────────────────────────────────
  { forms: ["blow", "blew", "blown"], translation: { en: "blow", be: "дзьмуць", uk: "дути", pl: "dmuchać", ru: "дуть" }, groups: ["ow-ew-own"] },
  { forms: ["draw", "drew", "drawn"], translation: { en: "draw", be: "маляваць", uk: "малювати", pl: "rysować", ru: "рисовать" }, groups: ["ow-ew-own", "prefixes"] },
  { forms: ["fly", "flew", "flown"], translation: { en: "fly", be: "лятаць", uk: "літати", pl: "latać", ru: "летать" }, groups: ["ow-ew-own"] },
  { forms: ["grow", "grew", "grown"], translation: { en: "grow", be: "расці", uk: "рости", pl: "rosnąć", ru: "расти" }, groups: ["ow-ew-own"] },
  { forms: ["know", "knew", "known"], translation: { en: "know", be: "ведаць", uk: "знати", pl: "znać, wiedzieć", ru: "знать" }, groups: ["ow-ew-own"] },
  { forms: ["throw", "threw", "thrown"], translation: { en: "throw", be: "кідаць", uk: "кидати", pl: "rzucać", ru: "бросать" }, groups: ["ow-ew-own"] },

  // ── ea/ee → o → o(k)en ──────────────────────────────────────────────────
  { forms: ["awake", "awoke", "awoken"], translation: { en: "awake", be: "прачынацца", uk: "прокидатися", pl: "budzić się", ru: "просыпаться" }, groups: ["o-o-en"] },
  { forms: ["bear", "bore", "borne"], translation: { en: "bear", be: "насіць, нараджаць", uk: "нести, народжувати", pl: "nosić, rodzić", ru: "нести, рождать" }, groups: ["o-o-en"] },
  { forms: ["break", "broke", "broken"], translation: { en: "break", be: "ламаць", uk: "ламати", pl: "łamać", ru: "ломать" }, groups: ["o-o-en"] },
  { forms: ["choose", "chose", "chosen"], translation: { en: "choose", be: "выбіраць", uk: "вибирати", pl: "wybierać", ru: "выбирать" }, groups: ["o-o-en"] },
  { forms: ["freeze", "froze", "frozen"], translation: { en: "freeze", be: "замярзаць", uk: "замерзати", pl: "zamarzać", ru: "замерзать" }, groups: ["o-o-en"] },
  { forms: ["speak", "spoke", "spoken"], translation: { en: "speak", be: "гаварыць", uk: "говорити", pl: "mówić", ru: "говорить" }, groups: ["o-o-en"] },
  { forms: ["steal", "stole", "stolen"], translation: { en: "steal", be: "красці", uk: "красти", pl: "kraść", ru: "красть" }, groups: ["o-o-en"] },
  { forms: ["swear", "swore", "sworn"], translation: { en: "swear", be: "клясціся, лаяцца", uk: "клястися, лаятися", pl: "przysięgać, przeklinać", ru: "клясться, ругаться" }, groups: ["o-o-en"] },
  { forms: ["tear", "tore", "torn"], translation: { en: "tear", be: "рваць", uk: "рвати", pl: "rwać, drzeć", ru: "рвать" }, groups: ["o-o-en"] },
  { forms: ["tread", "trod", "trodden"], translation: { en: "tread", be: "ступаць", uk: "ступати", pl: "stąpać", ru: "ступать" }, groups: ["o-o-en"] },
  { forms: ["wake", "woke", "woken"], translation: { en: "wake", be: "прачынацца, будзіць", uk: "прокидатися, будити", pl: "budzić (się)", ru: "просыпаться, будить" }, groups: ["o-o-en"] },
  { forms: ["wear", "wore", "worn"], translation: { en: "wear", be: "насіць (адзенне)", uk: "носити (одяг)", pl: "nosić (ubranie)", ru: "носить (одежду)" }, groups: ["o-o-en"] },
  { forms: ["weave", "wove", "woven"], translation: { en: "weave", be: "ткаць", uk: "ткати", pl: "tkać", ru: "ткать" }, groups: ["o-o-en"] },

  // ── i → o + -en ─────────────────────────────────────────────────────────
  { forms: ["arise", "arose", "arisen"], translation: { en: "arise", be: "узнікаць", uk: "виникати", pl: "powstawać", ru: "возникать" }, groups: ["i-o-en"] },
  { forms: ["bite", "bit", "bitten"], translation: { en: "bite", be: "кусаць", uk: "кусати", pl: "gryźć", ru: "кусать" }, groups: ["i-o-en"] },
  { forms: ["drive", "drove", "driven"], translation: { en: "drive", be: "вадзіць (аўто)", uk: "водити (авто)", pl: "prowadzić (auto)", ru: "водить (машину)" }, groups: ["i-o-en"] },
  { forms: ["hide", "hid", "hidden"], translation: { en: "hide", be: "хаваць", uk: "ховати", pl: "chować", ru: "прятать" }, groups: ["i-o-en"] },
  { forms: ["ride", "rode", "ridden"], translation: { en: "ride", be: "ездзіць вярхом", uk: "їздити верхи", pl: "jeździć (konno)", ru: "ехать верхом" }, groups: ["i-o-en"] },
  { forms: ["rise", "rose", "risen"], translation: { en: "rise", be: "падымацца", uk: "підніматися", pl: "wznosić się", ru: "подниматься" }, groups: ["i-o-en", "confusing-pairs"] },
  { forms: ["shine", "shone", "shone"], translation: { en: "shine", be: "свяціць", uk: "світити", pl: "świecić", ru: "светить" }, groups: ["i-o-en"] },
  { forms: ["smite", "smote", "smitten"], translation: { en: "smite", be: "разіць", uk: "вражати (ударом)", pl: "razić", ru: "поражать (ударом)" }, groups: ["i-o-en"] },
  { forms: ["stride", "strode", "stridden"], translation: { en: "stride", be: "крочыць", uk: "крокувати", pl: "kroczyć", ru: "шагать" }, groups: ["i-o-en"] },
  { forms: ["strive", "strove", "striven"], translation: { en: "strive", be: "імкнуцца", uk: "прагнути", pl: "dążyć", ru: "стремиться" }, groups: ["i-o-en"] },
  { forms: ["write", "wrote", "written"], translation: { en: "write", be: "пісаць", uk: "писати", pl: "pisać", ru: "писать" }, groups: ["i-o-en", "prefixes"] },

  // ── -ought / -aught ─────────────────────────────────────────────────────
  { forms: ["beseech", "besought", "besought"], translation: { en: "beseech", be: "маліць", uk: "благати", pl: "błagać", ru: "умолять" }, groups: ["ought-aught"] },
  { forms: ["bring", "brought", "brought"], translation: { en: "bring", be: "прыносіць", uk: "приносити", pl: "przynosić", ru: "приносить" }, groups: ["ought-aught"] },
  { forms: ["buy", "bought", "bought"], translation: { en: "buy", be: "купляць", uk: "купувати", pl: "kupować", ru: "покупать" }, groups: ["ought-aught"] },
  { forms: ["catch", "caught", "caught"], translation: { en: "catch", be: "лавіць", uk: "ловити", pl: "łapać", ru: "ловить" }, groups: ["ought-aught"] },
  { forms: ["fight", "fought", "fought"], translation: { en: "fight", be: "біцца", uk: "битися", pl: "walczyć", ru: "драться, сражаться" }, groups: ["ought-aught"] },
  { forms: ["seek", "sought", "sought"], translation: { en: "seek", be: "шукаць", uk: "шукати", pl: "szukać", ru: "искать" }, groups: ["ought-aught"] },
  { forms: ["teach", "taught", "taught"], translation: { en: "teach", be: "вучыць (кагосьці)", uk: "навчати", pl: "uczyć (kogoś)", ru: "учить (кого-то)" }, groups: ["ought-aught"] },
  { forms: ["think", "thought", "thought"], translation: { en: "think", be: "думаць", uk: "думати", pl: "myśleć", ru: "думать" }, groups: ["ought-aught"] },

  // ── ell → old ───────────────────────────────────────────────────────────
  { forms: ["sell", "sold", "sold"], translation: { en: "sell", be: "прадаваць", uk: "продавати", pl: "sprzedawać", ru: "продавать" }, groups: ["o-old"] },
  { forms: ["tell", "told", "told"], translation: { en: "tell", be: "расказваць", uk: "розповідати", pl: "opowiadać", ru: "рассказывать" }, groups: ["o-old"] },

  // ── -ay → -aid ──────────────────────────────────────────────────────────
  { forms: ["lay", "laid", "laid"], translation: { en: "lay", be: "класці", uk: "класти", pl: "kłaść", ru: "класть (переходный)" }, groups: ["ay-aid", "confusing-pairs"] },
  { forms: ["pay", "paid", "paid"], translation: { en: "pay", be: "плаціць", uk: "платити", pl: "płacić", ru: "платить" }, groups: ["ay-aid"] },
  { forms: ["say", "said", "said"], translation: { en: "say", be: "казаць", uk: "казати", pl: "mówić, powiedzieć", ru: "говорить, сказать" }, groups: ["ay-aid"] },

  // ── V2 правильная, V3 на -n ─────────────────────────────────────────────
  { forms: ["hew", "hewed", "hewn"], translation: { en: "hew", be: "секчы", uk: "рубати", pl: "rąbać", ru: "рубить" }, groups: ["ed-but-n"] },
  { forms: ["mow", "mowed", "mown"], translation: { en: "mow", be: "касіць", uk: "косити", pl: "kosić", ru: "косить" }, groups: ["ed-but-n"] },
  { forms: ["prove", "proved", "proven"], translation: { en: "prove", be: "даказваць", uk: "доводити", pl: "udowadniać", ru: "доказывать" }, groups: ["ed-but-n"] },
  { forms: ["saw", "sawed", "sawn"], translation: { en: "saw", be: "пілаваць", uk: "пиляти", pl: "piłować", ru: "пилить" }, groups: ["ed-but-n"] },
  { forms: ["sew", "sewed", "sewn"], translation: { en: "sew", be: "шыць", uk: "шити", pl: "szyć", ru: "шить" }, groups: ["ed-but-n"] },
  { forms: ["shave", "shaved", "shaven"], translation: { en: "shave", be: "галіць", uk: "голити", pl: "golić", ru: "брить" }, groups: ["ed-but-n"] },
  { forms: ["shear", "sheared", "shorn"], translation: { en: "shear", be: "стрыгчы", uk: "стригти", pl: "strzyc", ru: "стричь" }, groups: ["ed-but-n"] },
  { forms: ["show", "showed", "shown"], translation: { en: "show", be: "паказваць", uk: "показувати", pl: "pokazywać", ru: "показывать" }, groups: ["ed-but-n"] },
  { forms: ["sow", "sowed", "sown"], translation: { en: "sow", be: "сеяць", uk: "сіяти", pl: "siać", ru: "сеять" }, groups: ["ed-but-n"] },
  { forms: ["strew", "strewed", "strewn"], translation: { en: "strew", be: "раскідваць", uk: "розкидати", pl: "rozrzucać", ru: "разбрасывать" }, groups: ["ed-but-n"] },
  { forms: ["swell", "swelled", "swollen"], translation: { en: "swell", be: "апухаць", uk: "опухати", pl: "puchnąć", ru: "опухать" }, groups: ["ed-but-n"] },

  // ── V1 = V3 ─────────────────────────────────────────────────────────────
  { forms: ["become", "became", "become"], translation: { en: "become", be: "станавіцца", uk: "ставати", pl: "stawać się", ru: "становиться" }, groups: ["v1-v3", "prefixes"] },
  { forms: ["come", "came", "come"], translation: { en: "come", be: "прыходзіць", uk: "приходити", pl: "przychodzić", ru: "приходить" }, groups: ["v1-v3", "prefixes"] },
  { forms: ["overcome", "overcame", "overcome"], translation: { en: "overcome", be: "пераадольваць", uk: "долати", pl: "pokonywać", ru: "преодолевать" }, groups: ["v1-v3", "prefixes"] },
  { forms: ["overrun", "overran", "overrun"], translation: { en: "overrun", be: "перапаўняць", uk: "переповнювати", pl: "opanowywać", ru: "наводнять, переполнять" }, groups: ["v1-v3", "prefixes"] },
  { forms: ["run", "ran", "run"], translation: { en: "run", be: "бегаць", uk: "бігати", pl: "biegać", ru: "бегать" }, groups: ["v1-v3", "prefixes"] },

  // ── Логика приставок: корни ─────────────────────────────────────────────
  { forms: ["do", "did", "done"], translation: { en: "do", be: "рабіць", uk: "робити", pl: "robić", ru: "делать" }, groups: ["prefixes"] },
  { forms: ["get", "got", "got/gotten"], translation: { en: "get", be: "атрымліваць", uk: "отримувати", pl: "dostawać", ru: "получать" }, groups: ["prefixes"] },
  { forms: ["give", "gave", "given"], translation: { en: "give", be: "даваць", uk: "давати", pl: "dawać", ru: "давать" }, groups: ["prefixes"] },
  { forms: ["see", "saw", "seen"], translation: { en: "see", be: "бачыць", uk: "бачити", pl: "widzieć", ru: "видеть" }, groups: ["prefixes"] },
  { forms: ["stand", "stood", "stood"], translation: { en: "stand", be: "стаяць", uk: "стояти", pl: "stać", ru: "стоять" }, groups: ["prefixes"] },
  { forms: ["take", "took", "taken"], translation: { en: "take", be: "браць", uk: "брати", pl: "brać", ru: "брать" }, groups: ["prefixes"] },

  // ── Логика приставок: производные ───────────────────────────────────────
  { forms: ["beget", "begot", "begotten"], translation: { en: "beget", be: "спараджаць", uk: "породжувати", pl: "płodzić", ru: "порождать" }, groups: ["prefixes"] },
  { forms: ["behold", "beheld", "beheld"], translation: { en: "behold", be: "узіраць", uk: "узріти", pl: "ujrzeć", ru: "узреть" }, groups: ["prefixes"] },
  { forms: ["forbid", "forbade", "forbidden"], translation: { en: "forbid", be: "забараняць", uk: "забороняти", pl: "zabraniać", ru: "запрещать" }, groups: ["prefixes"] },
  { forms: ["forget", "forgot", "forgotten"], translation: { en: "forget", be: "забываць", uk: "забувати", pl: "zapominać", ru: "забывать" }, groups: ["prefixes"] },
  { forms: ["forgive", "forgave", "forgiven"], translation: { en: "forgive", be: "дараваць", uk: "пробачати", pl: "wybaczać", ru: "прощать" }, groups: ["prefixes"] },
  { forms: ["forsake", "forsook", "forsaken"], translation: { en: "forsake", be: "пакідаць", uk: "покидати", pl: "porzucać", ru: "покидать, отрекаться" }, groups: ["prefixes"] },
  { forms: ["foresee", "foresaw", "foreseen"], translation: { en: "foresee", be: "прадбачыць", uk: "передбачати", pl: "przewidywać", ru: "предвидеть" }, groups: ["prefixes"] },
  { forms: ["mistake", "mistook", "mistaken"], translation: { en: "mistake", be: "памыляцца", uk: "помилятися", pl: "mylić się", ru: "ошибаться" }, groups: ["prefixes"] },
  { forms: ["misunderstand", "misunderstood", "misunderstood"], translation: { en: "misunderstand", be: "няправільна разумець", uk: "неправильно розуміти", pl: "źle rozumieć", ru: "неправильно понимать" }, groups: ["prefixes"] },
  { forms: ["overdo", "overdid", "overdone"], translation: { en: "overdo", be: "перастарацца", uk: "перестаратися", pl: "przesadzać", ru: "переусердствовать" }, groups: ["prefixes"] },
  { forms: ["overhear", "overheard", "overheard"], translation: { en: "overhear", be: "падслухаць", uk: "підслухати", pl: "podsłuchać", ru: "подслушать" }, groups: ["prefixes"] },
  { forms: ["oversee", "oversaw", "overseen"], translation: { en: "oversee", be: "наглядаць", uk: "наглядати", pl: "nadzorować", ru: "надзирать, курировать" }, groups: ["prefixes"] },
  { forms: ["overtake", "overtook", "overtaken"], translation: { en: "overtake", be: "абганяць", uk: "обганяти", pl: "wyprzedzać", ru: "обгонять" }, groups: ["prefixes"] },
  { forms: ["redo", "redid", "redone"], translation: { en: "redo", be: "перарабляць", uk: "переробляти", pl: "robić ponownie", ru: "переделывать" }, groups: ["prefixes"] },
  { forms: ["rewrite", "rewrote", "rewritten"], translation: { en: "rewrite", be: "перапісваць", uk: "переписувати", pl: "przepisywać", ru: "переписывать" }, groups: ["prefixes"] },
  { forms: ["undergo", "underwent", "undergone"], translation: { en: "undergo", be: "зазнаваць", uk: "зазнавати", pl: "przechodzić (coś)", ru: "подвергаться" }, groups: ["prefixes"] },
  { forms: ["understand", "understood", "understood"], translation: { en: "understand", be: "разумець", uk: "розуміти", pl: "rozumieć", ru: "понимать" }, groups: ["prefixes"] },
  { forms: ["undertake", "undertook", "undertaken"], translation: { en: "undertake", be: "распачынаць", uk: "розпочинати", pl: "podejmować się", ru: "предпринимать" }, groups: ["prefixes"] },
  { forms: ["undo", "undid", "undone"], translation: { en: "undo", be: "адмяняць", uk: "скасовувати", pl: "cofać", ru: "отменять" }, groups: ["prefixes"] },
  { forms: ["uphold", "upheld", "upheld"], translation: { en: "uphold", be: "падтрымліваць", uk: "підтримувати", pl: "podtrzymywać", ru: "поддерживать" }, groups: ["prefixes"] },
  { forms: ["withdraw", "withdrew", "withdrawn"], translation: { en: "withdraw", be: "адклікаць, здымаць", uk: "відкликати, знімати", pl: "wycofywać", ru: "отзывать, снимать (деньги)" }, groups: ["prefixes"] },
  { forms: ["withhold", "withheld", "withheld"], translation: { en: "withhold", be: "утрымліваць", uk: "утримувати", pl: "wstrzymywać", ru: "удерживать" }, groups: ["prefixes"] },
  { forms: ["withstand", "withstood", "withstood"], translation: { en: "withstand", be: "вытрымліваць", uk: "витримувати", pl: "wytrzymywać", ru: "выдерживать" }, groups: ["prefixes"] },

  // ── Суплетивизм ─────────────────────────────────────────────────────────
  { forms: ["be", "was/were", "been"], translation: { en: "be", be: "быць", uk: "бути", pl: "być", ru: "быть" }, groups: ["suppletive"] },
  { forms: ["go", "went", "gone"], translation: { en: "go", be: "ісці", uk: "іти", pl: "iść", ru: "идти" }, groups: ["suppletive", "prefixes"] },
  { forms: ["have", "had", "had"], translation: { en: "have", be: "мець", uk: "мати", pl: "mieć", ru: "иметь" }, groups: ["suppletive"] },

  // ── Ловушки ─────────────────────────────────────────────────────────────
  { forms: ["fall", "fell", "fallen"], translation: { en: "fall", be: "падаць", uk: "падати", pl: "spadać, upadać", ru: "падать" }, groups: ["confusing-pairs"] },
  { forms: ["lie", "lay", "lain"], translation: { en: "lie", be: "ляжаць", uk: "лежати", pl: "leżeć", ru: "лежать" }, groups: ["confusing-pairs"] },

  // ── Вне основных паттернов ──────────────────────────────────────────────
  { forms: ["abide", "abode", "abode"], translation: { en: "abide", be: "трываць", uk: "терпіти, перебувати", pl: "znosić, przebywać", ru: "пребывать, терпеть" }, groups: ["others"] },
  { forms: ["beat", "beat", "beaten"], translation: { en: "beat", be: "біць", uk: "бити", pl: "bić", ru: "бить" }, groups: ["others"] },
  { forms: ["eat", "ate", "eaten"], translation: { en: "eat", be: "есці", uk: "їсти", pl: "jeść", ru: "есть" }, groups: ["others"] },
  { forms: ["make", "made", "made"], translation: { en: "make", be: "рабіць, ствараць", uk: "робити, виготовляти", pl: "robić, tworzyć", ru: "делать, создавать" }, groups: ["others"] },
  { forms: ["shake", "shook", "shaken"], translation: { en: "shake", be: "трэсці", uk: "трясти", pl: "trząść", ru: "трясти" }, groups: ["others"] },
  { forms: ["sit", "sat", "sat"], translation: { en: "sit", be: "сядзець", uk: "сидіти", pl: "siedzieć", ru: "сидеть" }, groups: ["others"] },
  { forms: ["slay", "slew", "slain"], translation: { en: "slay", be: "забіваць", uk: "вбивати", pl: "zabijać", ru: "убивать" }, groups: ["others"] },
  { forms: ["spit", "spat", "spat"], translation: { en: "spit", be: "пляваць", uk: "плювати", pl: "pluć", ru: "плевать" }, groups: ["others"] },
];
