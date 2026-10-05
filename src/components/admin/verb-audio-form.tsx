"use client";

import {
  FileUp,
  LoaderCircle,
  Mic,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  Volume2,
  VolumeOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";

import { buttonClass, Card } from "./ui";

import { removeVerbAudio, uploadVerbAudio, type FormNumber } from "@/lib/admin-actions";
import { processAudio, useAudioRecorder } from "@/lib/audio-recording";
import { spokenTriple, useVerbSpeech } from "@/lib/speech";

/** Любой звук, который декодирует браузер: перед загрузкой он всё равно станет MP3. */
const AUDIO_ACCEPT = "audio/*,.mp3,.m4a,.aac,.wav,.ogg,.webm";

/**
 * Озвучка глагола для тренажёра «Выбери, что слышишь» — по файлу на форму.
 * У каждой формы свой цикл: «Записать» → отсчёт 3-2-1 (если включён) →
 * «Говорите» → прослушать → «Загрузить» или «Перезаписать». Вместо записи
 * можно выбрать файл с диска. И запись, и файл ещё в браузере сжимаются в
 * маленький MP3 (см. processAudio). Пока озвучены не все три формы, тренажёр
 * проговаривает тройку синтезом браузера.
 */
export function VerbAudioForm({
  verbId,
  infinitive,
  forms,
}: {
  verbId: string;
  /** Первая форма — по ней называются файлы: read_1.mp3, read_2.mp3… */
  infinitive: string;
  /** Три формы по порядку: текст и URL загруженного файла. */
  forms: [AudioSlot, AudioSlot, AudioSlot];
}) {
  const countdown = useCountdown();
  const complete = forms.every((slot) => slot.audioUrl);
  // Только что загруженные записи (object URL) по номеру формы: «Прослушать
  // все» играет их из памяти, как и плеер формы, — CDN может ещё не отдавать
  // свежий файл. undefined — свежей записи нет, берём audioUrl.
  const [fresh, setFresh] = useState<Partial<Record<FormNumber, string | null>>>({});
  const playable = forms.map((slot, i) => {
    const url = fresh[(i + 1) as FormNumber];
    return { ...slot, audioUrl: url === undefined ? slot.audioUrl : url };
  }) as [AudioSlot, AudioSlot, AudioSlot];

  return (
    <Card
      title="Озвучка"
      description={
        complete
          ? "Для тренажёра «Выбери, что слышишь». Формы звучат по очереди."
          : "Для тренажёра «Выбери, что слышишь». Пока не загружены все три формы, звучит синтез браузера."
      }
    >
      <div className="flex flex-col gap-3">
        <PlayAll forms={playable} />
        <CountdownToggle countdown={countdown} />

        {forms.map((slot, i) => (
          <AudioField
            key={i}
            verbId={verbId}
            form={(i + 1) as FormNumber}
            fileName={audioFileName(infinitive, (i + 1) as FormNumber)}
            countdown={countdown}
            onAudioChange={(url) => setFresh((prev) => ({ ...prev, [i + 1]: url }))}
            {...slot}
          />
        ))}
      </div>
    </Card>
  );
}

type AudioSlot = { text: string; audioUrl: string | null };

/**
 * «Прослушать все» — три формы подряд, как в тренажёре: полная тройка
 * файлов играет по очереди, иначе тройку проговаривает синтез браузера
 * (то же правило, что в src/app/trainers/[key]/page.tsx).
 */
function PlayAll({ forms }: { forms: [AudioSlot, AudioSlot, AudioSlot] }) {
  const { support, speaking, play } = useVerbSpeech();
  const [form1, form2, form3] = forms;
  const audioUrls =
    form1.audioUrl && form2.audioUrl && form3.audioUrl
      ? [form1.audioUrl, form2.audioUrl, form3.audioUrl]
      : null;
  // Без файлов играть нечем, если браузер не умеет синтез.
  const unavailable = !audioUrls && support !== "ready";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={speaking || unavailable}
        onClick={() =>
          play(spokenTriple({ form1: form1.text, form2: form2.text, form3: form3.text }), audioUrls)
        }
        className={buttonClass.outline}
      >
        {speaking ? <LoaderCircle className="animate-spin" /> : <Volume2 />}
        {speaking ? "Звучит…" : "Прослушать все"}
      </button>
      <span className="text-xs text-subtle">
        {audioUrls
          ? "Записи"
          : support === "unsupported"
            ? "Браузер не умеет синтез речи"
            : "Голос браузера — записаны не все формы"}
      </span>
    </div>
  );
}

/** Имя файла озвучки, как на сервере: read_1.mp3. */
export function audioFileName(infinitive: string, form: FormNumber) {
  return `${fileSlug(infinitive)}_${form}.mp3`;
}

/** Галочка «Отсчёт 3-2-1» — одна настройка на всю админку. */
export function CountdownToggle({ countdown }: { countdown: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={countdown}
        onChange={(event) => writeCountdown(event.target.checked)}
        className="size-4 accent-blue-600"
      />
      Отсчёт 3-2-1 перед записью
    </label>
  );
}

/** Готовая к загрузке запись: файл и object URL для прослушивания. */
type Draft = { file: File; url: string; recorded: boolean };

/**
 * Одна форма: текущий файл, запись (с отсчётом) или файл с диска,
 * прослушивание и загрузка. Используется и в карточке глагола, и в попапе
 * списка глаголов (VerbAudioButtons).
 */
export function AudioField({
  verbId,
  form,
  text,
  audioUrl,
  fileName,
  countdown,
  onAudioChange,
}: AudioSlot & {
  verbId: string;
  form: FormNumber;
  fileName: string;
  countdown: boolean;
  /** Файл формы загружен (URL записи в памяти) или удалён (null). */
  onAudioChange?: (url: string | null) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  // Только что загруженная запись. Играем её из памяти, а не с CDN: сразу
  // после перезаписи файла CDN может ещё не отдавать его по новому адресу,
  // и плеер, получив ошибку, больше не пробует. Байты те же, что в Blob,
  // а после перезагрузки страницы играет уже audioUrl.
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const currentUrl = uploadedUrl ?? audioUrl;
  const [converting, setConverting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [uploading, startUploading] = useTransition();
  const [removing, startRemoving] = useTransition();

  // Object URL черновиков живут, пока открыта страница: черновик может стать
  // загруженной записью, и его URL нужен дальше. Это килобайты — освобождаем
  // все разом при уходе со страницы.
  const objectUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  const toDraft = useCallback((file: File, recorded: boolean): Draft => {
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    return { file, url, recorded };
  }, []);

  const onRecorded = useCallback((file: File) => setDraft(toDraft(file, true)), [toDraft]);
  const recorder = useAudioRecorder(onRecorded, fileName);
  const error = recorder.error ?? fieldError;

  function record() {
    setFieldError(null);
    setDraft(null);
    void recorder.start({ countdown });
  }

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    setFieldError(null);
    recorder.clearError();
    setConverting(true);
    try {
      const mp3 = await processAudio(file, fileName);
      if (mp3) setDraft(toDraft(mp3, false));
      else setFieldError("В файле одна тишина");
    } catch (e) {
      console.error("audio conversion failed:", e);
      setFieldError("Не удалось прочитать файл — подойдёт MP3, M4A, WAV или OGG");
    } finally {
      setConverting(false);
    }
  }

  function upload(take: Draft) {
    setFieldError(null);
    recorder.clearError();
    startUploading(async () => {
      const formData = new FormData();
      formData.set(`audio_${form}`, take.file);
      const result = await uploadVerbAudio(verbId, {}, formData);
      if (result.error) return setFieldError(result.error);
      setUploadedUrl(take.url);
      onAudioChange?.(take.url);
      setDraft(null);
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-2.5 rounded-lg p-3 ring-1 ring-line">
      <p className="text-sm font-semibold">
        {form}. {text}
      </p>

      {recorder.status === "starting" ? (
        <Status>
          <LoaderCircle className="size-4 animate-spin" />
          Включаю микрофон…
        </Status>
      ) : recorder.status === "countdown" ? (
        <div className="flex items-center justify-between gap-2">
          <span
            key={recorder.count}
            aria-live="assertive"
            className="animate-pulse text-4xl leading-none font-extrabold text-blue-600 tabular-nums"
          >
            {recorder.count}
          </span>
          <button type="button" onClick={recorder.cancel} className={buttonClass.outline}>
            <X />
            Отмена
          </button>
        </div>
      ) : recorder.status === "recording" ? (
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <span className="size-2.5 animate-pulse rounded-full bg-red-600" />
            Говорите · {(recorder.elapsedMs / 1000).toFixed(1)} с
          </span>
          <button type="button" onClick={recorder.stop} className={buttonClass.destructive}>
            <Square className="fill-current" />
            Стоп
          </button>
        </div>
      ) : recorder.status === "processing" || converting ? (
        <Status>
          <LoaderCircle className="size-4 animate-spin" />
          Сжимаю…
        </Status>
      ) : draft ? (
        <>
          {/* Свежую запись сразу проигрываем — так быстрее решить, годится ли. */}
          <audio
            src={draft.url}
            controls
            autoPlay={draft.recorded}
            className="h-9 w-full min-w-0"
          />
          <span className="text-xs text-subtle">
            {fileName} · {formatSize(draft.file.size)}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => upload(draft)}
              className={buttonClass.success}
            >
              {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
              Загрузить
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={record}
              className={buttonClass.outline}
            >
              <RotateCcw />
              Перезаписать
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setDraft(null)}
              className="rounded-full px-2 py-1.5 text-sm font-medium text-subtle hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {currentUrl ? (
              <audio src={currentUrl} controls preload="none" className="h-9 min-w-0 flex-1" />
            ) : (
              <span className="flex flex-1 items-center gap-1.5 text-xs text-subtle">
                <VolumeOff className="size-4" />
                Файла нет
              </span>
            )}
            {currentUrl && (
              <button
                type="button"
                disabled={removing}
                aria-label={`Удалить озвучку «${text}»`}
                title="Удалить"
                onClick={() => {
                  if (!window.confirm(`Удалить озвучку «${text}»?`)) return;
                  startRemoving(async () => {
                    await removeVerbAudio(verbId, form);
                    setUploadedUrl(null);
                    onAudioChange?.(null);
                  });
                }}
                className="rounded-full p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 [&_svg]:size-4"
              >
                {removing ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={record} className={buttonClass.primary}>
              <Mic />
              {currentUrl ? "Перезаписать" : "Записать"}
            </button>
            <label className={`${buttonClass.outline} cursor-pointer`}>
              <FileUp />
              Файл
              <input
                type="file"
                accept={AUDIO_ACCEPT}
                className="sr-only"
                onChange={(event) => {
                  void chooseFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Status({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-2 py-2 text-sm text-subtle">{children}</span>;
}

function formatSize(bytes: number) {
  return bytes < 1024 ? `${bytes} Б` : `${(bytes / 1024).toFixed(1)} КБ`;
}

/** Инфинитив → часть имени файла, как на сервере (verbSlug в admin-actions.ts). */
function fileSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "verb";
}

// Галочка «Отсчёт 3-2-1» — личная настройка админа, живёт в localStorage.
// Через useSyncExternalStore: на сервере и при гидрации — значение по
// умолчанию, без рассинхрона разметки.
const COUNTDOWN_KEY = "admin.audio.countdown";

export function useCountdown() {
  return useSyncExternalStore(subscribeCountdown, readCountdown, () => true);
}

const countdownListeners = new Set<() => void>();

function readCountdown() {
  try {
    return localStorage.getItem(COUNTDOWN_KEY) !== "off";
  } catch {
    return true;
  }
}

function writeCountdown(on: boolean) {
  try {
    localStorage.setItem(COUNTDOWN_KEY, on ? "on" : "off");
  } catch {
    // Хранилище недоступно (приватный режим) — галочка просто не запомнится.
  }
  countdownListeners.forEach((listener) => listener());
}

function subscribeCountdown(listener: () => void) {
  countdownListeners.add(listener);
  return () => countdownListeners.delete(listener);
}
