
import { useCallback, useEffect, useState } from "react";

/**
 * Озвучка для тренажёра «Выбери, что слышишь».
 *
 * Сейчас звук синтезирует браузер (Web Speech API). Следующий шаг —
 * заранее сгенерированные файлы в Vercel Blob: тогда у глагола появится
 * audioUrl, и play() возьмёт файл, а синтез останется запасным вариантом
 * для глаголов без файла. Компоненту для этого ничего менять не придётся.
 */

export type SpeechSupport = "checking" | "ready" | "unsupported";

/**
 * Лучший английский голос: американский или британский, «естественные» и
 * Google-голоса звучат живее системных. Список голосов в Chrome приходит
 * асинхронно, поэтому выбор повторяется по событию voiceschanged.
 */
function pickVoice(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang === "en-US" ? 4 : v.lang === "en-GB" ? 3 : 0) +
    (/natural|neural|google|samantha|daniel/i.test(v.name) ? 2 : 0) +
    (v.localService ? 0 : 1);
  return english.sort((a, b) => score(b) - score(a))[0] ?? null;
}

export function useVerbSpeech() {
  const [support, setSupport] = useState<SpeechSupport>("checking");
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Подписок нет — выставляем в микрозадаче, а не синхронно в эффекте.
      queueMicrotask(() => setSupport("unsupported"));
      return;
    }
    const synth = window.speechSynthesis;
    const update = () => {
      const chosen = pickVoice(synth.getVoices());
      setVoice(chosen);
      setSupport(chosen ? "ready" : "unsupported");
    };
    update();
    synth.addEventListener("voiceschanged", update);
    // Некоторые браузеры так и не присылают voiceschanged: даём им секунду.
    const timer = window.setTimeout(update, 1000);
    return () => {
      synth.removeEventListener("voiceschanged", update);
      window.clearTimeout(timer);
      synth.cancel();
    };
  }, []);

  /**
   * Проговаривает текст. Вызывать из обработчика нажатия: браузеры не дают
   * странице говорить без жеста пользователя. audioUrl — задел под файлы.
   */
  const play = useCallback(
    (text: string, audioUrl?: string | null) => {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setSpeaking(true);
        audio.onended = audio.onerror = () => setSpeaking(false);
        audio.play().catch(() => setSpeaking(false));
        return;
      }
      if (!voice) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      // Чуть медленнее обычного: формы различаются одним звуком (sang / sung).
      utterance.rate = 0.85;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = utterance.onerror = () => setSpeaking(false);
      synth.speak(utterance);
    },
    [voice],
  );

  return { support, speaking, play };
}

/** Тройка для озвучки: запятые дают паузы между формами. */
export function spokenTriple(verb: { form1: string; form2: string; form3: string }) {
  // Варианты через слеш (was/were) читаем как «was or were».
  const say = (form: string) => form.split("/").join(" or ");
  return `${say(verb.form1)}, ${say(verb.form2)}, ${say(verb.form3)}`;
}
