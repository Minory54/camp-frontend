import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { getApiErrorMessage } from "../../api/http";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { useSessionStore } from "../../stores/sessionStore";
import { ROUTES } from "../../units/routes";
import { loadPractice } from "./practiceData";
import { PracticeWorkspace } from "./PracticeWorkspace";
import "./style.scss";

export const PracticePage = () => {
  const { id } = useParams();
  const [search] = useSearchParams();
  const studentId = useSessionStore((state) => state.session?.studentId);
  const practiceId = Number(id);
  const lessonId = search.has("lessonId") ? Number(search.get("lessonId")) : undefined;
  const isValidId = Number.isInteger(practiceId) && practiceId > 0;
  const practiceQuery = useQuery({
    queryKey: ["practice-workspace", practiceId, studentId, lessonId],
    queryFn: ({ signal }) => loadPractice(practiceId, studentId, lessonId, signal),
    enabled: isValidId,
    // Editors own their state until leaving. Reopen from the server next time.
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    networkMode: "always",
  });

  let content;

  if (!id) {
    content = <p>Выберите задание на карте курса.</p>;
  } else if (!isValidId) {
    content = <p role="alert">Задание не найдено.</p>;
  } else if (practiceQuery.isPending) {
    content = <p role="status">Загрузка задания...</p>;
  } else if (practiceQuery.isError) {
    content = (
      <div role="alert">
        <p>Не удалось загрузить задание или сохранённое решение.</p>
        <p>{getApiErrorMessage(practiceQuery.error)}</p>
        <Button onClick={() => void practiceQuery.refetch()} small>
          Повторить
        </Button>
      </div>
    );
  } else {
    content = (
      <PracticeWorkspace
        key={`${practiceId}:${studentId ?? "guest"}:${lessonId ?? "default"}`}
        data={practiceQuery.data}
        studentId={studentId}
      />
    );
  }

  return (
    <div className="practice">
      <Header />
      <div className="practice__body">
        {practiceQuery.isSuccess && isValidId ? (
          content
        ) : (
          <>
            <main className="practice__message">{content}</main>
            <footer className="practice__footer">
              <Button link to={ROUTES.ROADMAP} small>
                Вернуться на карту
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
