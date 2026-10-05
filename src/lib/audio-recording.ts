import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Запись озвучки с микрофона прямо в админке.
 *
 * MediaRecorder пишет в формате браузера: Chrome — webm/opus, Safari — mp4,
 * и webm играют не все Safari. Поэтому и запись, и файл с диска проходят
 * через processAudio(): декодируем, сводим в моно, обрезаем тишину по краям
 * (иначе в тренажёре между формами были бы рваные паузы), выравниваем
 * громкость и кодируем в MP3 — его играют все, а весит он минимум.
 *
 * Микрофон браузер даёт только на https и localhost.
 */

/**
 * Речь в MP3 моно 22 кГц на 32 кбит/с — около 4 КБ на секунду звука, одна
 * форма укладывается в 3–6 КБ. Ниже начинают теряться s / sh / th, а для
 * тренажёра на слух именно они и важны.
 */
const SAMPLE_RATE = 22_050;
const MP3_BITRATE = 32;
/** Одна форма — секунда-две; дольше — забыли нажать «Стоп». */
const MAX_RECORDING_MS = 6_000;

/** Отсчёт перед записью: 3, 2, 1 — по секунде на цифру. */
const COUNTDOWN_FROM = 3;

/**
 * idle → starting (ждём микрофон) → countdown (если включён) → recording →
 * processing (сжатие) → idle с готовым файлом в onRecorded.
 */
export type RecorderStatus = "idle" | "starting" | "countdown" | "recording" | "processing";

export function useAudioRecorder(onRecorded: (file: File) => void, fileName: string) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [count, setCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  // Отмена или размонтирование посреди записи: микрофон выключаем,
  // результат выбрасываем.
  const cancelRef = useRef<(() => void) | null>(null);
  const onRecordedRef = useRef(onRecorded);
  useEffect(() => {
    onRecordedRef.current = onRecorded;
  }, [onRecorded]);
  useEffect(() => () => cancelRef.current?.(), []);

  const start = useCallback(
    async ({ countdown }: { countdown: boolean }) => {
      cancelRef.current?.();
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setError(
          window.isSecureContext
            ? "Этот браузер не умеет записывать звук"
            : "Запись работает только по https или на localhost",
        );
        return;
      }

      // Микрофон включаем до отсчёта: запрос доступа не влезет посреди
      // «3-2-1», а микрофон успеет «проснуться» и не съест первый звук.
      setStatus("starting");
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // Шумодав полезен для встроенного микрофона; автоусиление «качает»
          // громкость внутри слова — его выключаем и выравниваем сами.
          audio: {
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: true,
            autoGainControl: false,
          },
        });
      } catch (e) {
        setStatus("idle");
        setError(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "Нет доступа к микрофону — разрешите его в настройках браузера"
            : "Не удалось включить микрофон",
        );
        return;
      }

      let cancelled = false;
      let recorder: MediaRecorder | null = null;
      let countdownTimer: number | undefined;
      let ticker: number | undefined;
      let limit: number | undefined;

      const release = () => {
        window.clearTimeout(countdownTimer);
        window.clearInterval(ticker);
        window.clearTimeout(limit);
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        cancelRef.current = null;
      };
      cancelRef.current = () => {
        cancelled = true;
        if (recorder && recorder.state !== "inactive") recorder.stop();
        else release();
        setStatus("idle");
      };

      const record = () => {
        if (cancelled) return;
        const active = new MediaRecorder(stream);
        recorder = active;
        const chunks: Blob[] = [];
        const startedAt = Date.now();
        ticker = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 200);
        limit = window.setTimeout(() => active.stop(), MAX_RECORDING_MS);

        active.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        active.onstop = async () => {
          release();
          if (cancelled) return;
          setStatus("processing");
          try {
            const file = await processAudio(new Blob(chunks, { type: active.mimeType }), fileName);
            if (cancelled) return;
            if (file) onRecordedRef.current(file);
            else setError("Ничего не слышно — проверьте микрофон и запишите ещё раз");
          } catch (e) {
            console.error("recording processing failed:", e);
            setError("Не удалось обработать запись — попробуйте ещё раз");
          }
          if (!cancelled) setStatus("idle");
        };

        recorderRef.current = active;
        active.start();
        setElapsedMs(0);
        setStatus("recording");
      };

      if (!countdown) return record();
      const tick = (n: number) => {
        if (cancelled) return;
        if (n === 0) return record();
        setCount(n);
        countdownTimer = window.setTimeout(() => tick(n - 1), 1000);
      };
      setStatus("countdown");
      tick(COUNTDOWN_FROM);
    },
    [fileName],
  );

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }, []);

  const cancel = useCallback(() => cancelRef.current?.(), []);

  return { status, count, elapsedMs, error, start, stop, cancel };
}

/**
 * Любой звук, который умеет браузер (запись, MP3, M4A, WAV…) → обрезанный и
 * выровненный MP3 с именем fileName. null — в записи одна тишина; не
 * декодируемый файл — исключение.
 */
export async function processAudio(audio: Blob, fileName: string): Promise<File | null> {
  const context = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await context.decodeAudioData(await audio.arrayBuffer());
  } finally {
    void context.close();
  }

  // OfflineAudioContext с одним каналом сам сводит в моно и пересэмплирует.
  const length = Math.max(1, Math.ceil(decoded.duration * SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, length, SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const mono = (await offline.startRendering()).getChannelData(0);

  const trimmed = trimSilence(mono, SAMPLE_RATE);
  if (!trimmed) return null;
  normalize(trimmed);
  return new File([await encodeMp3(trimmed)], fileName, { type: "audio/mpeg" });
}

/**
 * Обрезает тишину по краям. Порог — от громкости самой записи: у разных
 * микрофонов разный фоновый шум. Небольшой запас по краям, чтобы не съесть
 * тихие согласные (h в have, f в fly), и короткие фейды против щелчков.
 */
function trimSilence(samples: Float32Array, rate: number): Float32Array | null {
  const step = Math.round(rate * 0.01);
  const levels: number[] = [];
  for (let i = 0; i < samples.length; i += step) {
    let sum = 0;
    const end = Math.min(i + step, samples.length);
    for (let j = i; j < end; j++) sum += samples[j] * samples[j];
    levels.push(Math.sqrt(sum / (end - i)));
  }

  const peak = Math.max(0, ...levels);
  if (peak < 0.005) return null;
  const threshold = Math.max(peak * 0.08, 0.003);
  const first = levels.findIndex((level) => level >= threshold);
  let last = levels.length - 1;
  while (levels[last] < threshold) last--;

  const start = Math.max(0, first * step - Math.round(rate * 0.08));
  const end = Math.min(samples.length, (last + 1) * step + Math.round(rate * 0.15));
  const out = samples.slice(start, end);

  const fade = Math.min(Math.round(rate * 0.01), Math.floor(out.length / 2));
  for (let i = 0; i < fade; i++) {
    out[i] *= i / fade;
    out[out.length - 1 - i] *= i / fade;
  }
  return out;
}

/** Пик на −1 дБ: все формы звучат одинаково громко. Тихую запись не раздуваем до шума. */
function normalize(samples: Float32Array) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  if (peak === 0) return;
  const gain = Math.min(0.89 / peak, 20);
  for (let i = 0; i < samples.length; i++) samples[i] *= gain;
}

/**
 * MP3 через LAME, собранный в WebAssembly. Модуль грузим только при первой
 * обработке: остальной админке он не нужен.
 */
async function encodeMp3(samples: Float32Array): Promise<Uint8Array<ArrayBuffer>> {
  const { createMp3Encoder } = await import("wasm-media-encoders");
  const encoder = await createMp3Encoder();
  encoder.configure({
    channels: 1,
    sampleRate: SAMPLE_RATE,
    outputSampleRate: SAMPLE_RATE,
    bitrate: MP3_BITRATE,
  });
  // encode() и finalize() отдают вид на общую память кодировщика —
  // копируем куски, пока следующий вызов их не перезаписал.
  const body = encoder.encode([samples]).slice();
  const tail = encoder.finalize().slice();
  const out = new Uint8Array(body.length + tail.length);
  out.set(body);
  out.set(tail, body.length);
  return out;
}
