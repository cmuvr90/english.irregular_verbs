
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Озвучка для тренажёра «Выбери, что слышишь».
 *
 * Если у глагола загружена озвучка (audioUrls — по файлу на форму в Vercel
 * Blob), play() играет файлы по очереди; для глаголов без озвучки звук
 * синтезирует браузер (Web Speech API).
 */

/** Пауза между формами при проигрывании файлов — как запятая у синтеза. */
const FORM_PAUSE_MS = 350;

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
  // Текущее проигрывание файлов: новый play() или размонтирование его обрывают.
  const stopFiles = useRef<(() => void) | null>(null);

  useEffect(() => () => stopFiles.current?.(), []);

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
   * странице говорить без жеста пользователя. audioUrls — файлы озвучки
   * по порядку, если есть: тогда text не нужен.
   */
  const play = useCallback(
    (text: string, audioUrls?: readonly string[] | null) => {
      stopFiles.current?.();
      stopFiles.current = null;
      if (audioUrls?.length) {
        window.speechSynthesis?.cancel();
        // Грузим все файлы сразу, чтобы между формами не было задержки сети.
        const audios = audioUrls.map((url) => {
          const audio = new Audio(url);
          audio.preload = "auto";
          return audio;
        });
        let timer: number | undefined;
        let stopped = false;
        const stop = () => {
          stopped = true;
          window.clearTimeout(timer);
          audios.forEach((audio) => audio.pause());
          setSpeaking(false);
        };
        const next = (i: number) => {
          if (stopped) return;
          if (i >= audios.length) return stop();
          const audio = audios[i];
          audio.onended = () => {
            timer = window.setTimeout(() => next(i + 1), FORM_PAUSE_MS);
          };
          // Файл не загрузился — обрываем, но не молча: иначе не понять,
          // почему тройка прозвучала не целиком.
          const fail = (reason: unknown) => {
            console.warn(`verb audio ${i + 1} failed:`, audio.src, reason);
            stop();
          };
          audio.onerror = () => fail(audio.error);
          audio.play().catch(fail);
        };
        stopFiles.current = stop;
        setSpeaking(true);
        next(0);
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
