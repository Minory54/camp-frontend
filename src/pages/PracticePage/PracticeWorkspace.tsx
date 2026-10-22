import { lazy, Suspense, useCallback, useRef, useState } from "react";
import axios from "axios";
import { Link, useBeforeUnload, useBlocker } from "react-router";
import { getApiErrorMessage } from "../../api/http";
import { Button } from "../../components/Button";
import { MdxContent } from "../../components/MdxContent";
import { usePracticeConnection } from "../../hooks/usePracticeConnection";
import { usePracticeCooldown } from "../../hooks/usePracticeCooldown";
import { useSubmitPractice } from "../../hooks/useSubmitPractice";
import { ROUTES } from "../../units/routes";
import { ConfirmDialog } from "./ConfirmDialog";
import type { PracticeData } from "./practiceData";
import { buildPreview, getInitialContents, getMainHtml, hasChanges } from "./practiceFiles";

const CodeEditor = lazy(async () => {
  // Prepare both languages before showing the editor, including first use offline.
  const [editor] = await Promise.all([
    import("../../components/Editor"),
    import("monaco-editor/languages/features/html/htmlMode"),
    import("monaco-editor/languages/features/css/cssMode"),
    import("monaco-editor/languages/definitions/html/html"),
    import("monaco-editor/languages/definitions/css/css"),
  ]);
  return editor;
});
type Feedback = { kind: "success" | "failed" | "error"; message: string };

export function PracticeWorkspace({ data, studentId }: { data: PracticeData; studentId?: string }) {
  const { practice, files, lesson } = data;
  const mainHtml = getMainHtml(files);
  const [activeId, setActiveId] = useState(mainHtml?.id ?? files[0]?.id);
  const [contents, setContents] = useState(data.contents);
  const [savedContents, setSavedContents] = useState(data.contents);
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState<{ source: string; revision: number } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const sending = useRef(false);
  const submit = useSubmitPractice();
  const connection = usePracticeConnection(practice.id);
  const cooldown = usePracticeCooldown(practice.id, studentId);
  const activeFile = files.find((file) => file.id === activeId);
  const dirty = hasChanges(files, contents, savedContents);
  const mustConfirmLeave = dirty || submit.isPending;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      mustConfirmLeave &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search),
  );

  useBeforeUnload(
    useCallback(
      (event) => {
        if (mustConfirmLeave) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      [mustConfirmLeave],
    ),
  );

  function run() {
    try {
      const source = buildPreview(files, contents);
      setPreview((previous) => ({ source, revision: (previous?.revision ?? 0) + 1 }));
    } catch (error) {
      setFeedback({ kind: "error", message: getApiErrorMessage(error) });
    }
  }

  async function checkSolution() {
    if (
      sending.current ||
      !studentId ||
      !lesson ||
      !connection.isConnected ||
      !navigator.onLine ||
      files.length === 0 ||
      cooldown.seconds > 0
    )
      return;

    const snapshot = { ...contents };
    const submissionFiles = files.map((file) => ({
      id_practice_file: file.id,
      code: snapshot[file.id],
    }));
    if (
      submissionFiles.length > 30 ||
      submissionFiles.some((file) => file.code.length > 200_000) ||
      submissionFiles.reduce(
        (sum, file) => sum + new TextEncoder().encode(file.code).byteLength,
        0,
      ) > 1_000_000
    ) {
      setFeedback({
        kind: "error",
        message: "Решение слишком большое: до 200 000 символов на файл и 1 МБ суммарно.",
      });
      return;
    }
    if (!cooldown.start()) return;
    sending.current = true;
    setFeedback(null);
    try {
      // The API saves every submitted file before checking the solution.
      const result = await submit.mutateAsync({
        data: { id_student: studentId, id_lesson: lesson.id, files: submissionFiles },
      });
      setSavedContents(snapshot);
      setFeedback(
        result.passed
          ? { kind: "success", message: "Решение сохранено и прошло проверку! Прогресс обновлён." }
          : {
              kind: "failed",
              message: `Решение сохранено. Ошибка: ${result.error || "Условия задания пока не выполнены."}`,
            },
      );
    } catch (error) {
      connection.reportError(error);
      const unauthorized = axios.isAxiosError(error) && error.response?.status === 401;
      setFeedback({
        kind: "error",
        message: unauthorized
          ? "Вход истёк. Вернитесь на карту, чтобы войти снова. Текущий код остаётся в редакторе."
          : `Не удалось проверить решение. ${getApiErrorMessage(error)}`,
      });
    } finally {
      sending.current = false;
    }
  }

  function resetSolution() {
    setContents(getInitialContents(files));
    setRevision((value) => value + 1);
    setPreview(null);
    setFeedback(null);
    setResetOpen(false);
  }

  const submitDisabled =
    !studentId ||
    !lesson ||
    !connection.isConnected ||
    files.length === 0 ||
    cooldown.seconds > 0 ||
    submit.isPending;
  const connectionLabel = connection.isConnected ? "Сервер доступен" : "Нет подключения к серверу";

  return (
    <>
      <main className="practice__workspace">
        <section className="practice__task" aria-label="Описание задания">
          <MdxContent source="db" title={practice.title} mdx_source={practice.mdx_source} />
        </section>

        <section className="practice__editor-column" aria-label="Файлы решения">
          <div className="practice__tabs" role="tablist" aria-label="Файлы задания">
            {files.map((file, index) => (
              <button
                key={file.id}
                id={`practice-tab-${file.id}`}
                type="button"
                role="tab"
                className="practice__tab"
                aria-selected={file.id === activeId}
                aria-controls="practice-editor"
                tabIndex={file.id === activeId ? 0 : -1}
                onClick={() => setActiveId(file.id)}
                onKeyDown={(event) => {
                  let next: number;
                  if (event.key === "ArrowRight") next = (index + 1) % files.length;
                  else if (event.key === "ArrowLeft")
                    next = (index - 1 + files.length) % files.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = files.length - 1;
                  else return;
                  event.preventDefault();
                  setActiveId(files[next].id);
                  document.getElementById(`practice-tab-${files[next].id}`)?.focus();
                }}
              >
                {file.filename}
              </button>
            ))}
          </div>

          <div
            id="practice-editor"
            className="practice__editor"
            role="tabpanel"
            aria-labelledby={activeFile ? `practice-tab-${activeFile.id}` : undefined}
          >
            {activeFile ? (
              <Suspense fallback={<p className="practice__message">Загрузка редактора…</p>}>
                <CodeEditor
                  key={revision}
                  file={activeFile}
                  value={contents[activeFile.id]}
                  modelPrefix={`inmemory://practice/${studentId ?? "guest"}/${practice.id}/${revision}/`}
                  onChange={(value) =>
                    setContents((previous) => ({ ...previous, [activeFile.id]: value }))
                  }
                />
              </Suspense>
            ) : (
              <p className="practice__message" role="alert">
                В задании пока нет файлов.
              </p>
            )}
          </div>

          <div className="practice__feedback" aria-live="polite" aria-atomic="true">
            {!studentId && (
              <p>
                Для сохранения и проверки <Link to={ROUTES.ROADMAP}>войдите на карте курса</Link>.
              </p>
            )}
            {!lesson && <p role="alert">Не найден урок для проверки этого задания.</p>}
            {!mainHtml && files.length > 0 && (
              <p role="alert">В задании нет HTML-файла для предпросмотра.</p>
            )}
            {!connection.isConnected && <p>Нет подключения к серверу. Проверка недоступна.</p>}
            {submit.isPending && <p role="status">Сохраняем и проверяем отправленное решение…</p>}
            {feedback && (
              <p
                className={`practice__result practice__result--${feedback.kind}`}
                role={feedback.kind === "error" ? "alert" : "status"}
              >
                {feedback.message}
              </p>
            )}
            {/* {feedback && dirty && (
              <p>В редакторе есть изменения после последней сохранённой версии.</p>
            )} */}
          </div>

          <div className="practice__editor-actions">
            <Button onClick={run} disabled={!mainHtml} small>
              Запустить
            </Button>
            <Button
              onClick={() => void checkSolution()}
              disabled={submitDisabled}
              color="blue"
              className="practice__submit"
              small
            >
              {cooldown.seconds > 0
                ? `${cooldown.seconds} сек`
                : submit.isPending
                  ? "Проверяем…"
                  : "Проверить решение"}
            </Button>
          </div>
        </section>

        <section className="practice__preview-column" aria-label="Предпросмотр результата">
          <div className="practice__preview-toolbar">
            <div className="practice__filename" title={mainHtml?.filename}>
              {mainHtml?.filename ?? "HTML-файл"}
            </div>
            <div
              className="practice__connection"
              title={connectionLabel}
              role="status"
              aria-label={connectionLabel}
            >
              <span
                className={`practice__connection-dot${connection.isConnected ? " practice__connection-dot--online" : ""}`}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="practice__preview">
            {preview ? (
              <iframe
                key={preview.revision}
                title="Результат выполнения кода"
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={preview.source}
              />
            ) : (
              <p className="practice__preview-placeholder">
                Результаты выполнения вашего кода отобразятся здесь после запуска проекта.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="practice__footer">
        <Button
          onClick={() => setResetOpen(true)}
          disabled={files.length === 0 || submit.isPending}
          small
        >
          Сбросить решение
        </Button>
        <Button link to={ROUTES.ROADMAP} small>
          Вернуться на карту
        </Button>
      </footer>

      {resetOpen && (
        <ConfirmDialog
          title="Сбросить решение?"
          confirmLabel="Сбросить решение"
          onCancel={() => setResetOpen(false)}
          onConfirm={resetSolution}
        >
          <p>
            Текущий код будет заменён исходными файлами задания. Несохранённые изменения будут
            потеряны.
          </p>
          <p>Сохранённое решение на сервере останется без изменений.</p>
        </ConfirmDialog>
      )}

      {blocker.state === "blocked" && (
        <ConfirmDialog
          title="Покинуть задание?"
          confirmLabel="Перейти"
          onCancel={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        >
          <p>
            {submit.isPending
              ? "Решение ещё проверяется. Если уйти сейчас, результат проверки не отобразится на этой странице."
              : "В редакторе есть несохранённые изменения. При переходе они будут потеряны."}
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
