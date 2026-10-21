import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router";
import { getGetCourseProgressQueryKey, getTestAnswers, getTestById } from "../../api/generated";
import { getApiErrorMessage } from "../../api/http";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { Typography } from "../../components/Typography";
import { useSessionStore } from "../../stores/sessionStore";
import { ROUTES } from "../../units/routes";
import { TestQuestion } from "../../components/TestQuestion";
import "./style.scss";

export const TestPage = () => {
  const { id } = useParams();
  const studentId = useSessionStore((state) => state.session?.studentId);
  const testId = Number(id);
  const isValidId = Number.isInteger(testId) && testId > 0;
  const testKey = `${testId}:${studentId}`;
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [progress, setProgress] = useState({
    testKey: "",
    index: 0,
    correct: false,
    completed: false,
  });
  const testQuery = useQuery({
    queryKey: ["test-page", testId, studentId],
    queryFn: async ({ signal }) => {
      const [test, answers] = await Promise.all([
        getTestById(testId, undefined, signal),
        getTestAnswers(testId, undefined, signal),
      ]);
      const questions = (test.Test_questions ?? []).toSorted((a, b) => a.position - b.position);
      const firstUnanswered = questions.findIndex(
        (question) =>
          !answers.some((answer) => answer.id_question === question.id && answer.is_correct),
      );

      return { test, questions, initialIndex: Math.max(firstUnanswered, 0) };
    },
    enabled: isValidId && Boolean(studentId),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const currentProgress =
    progress.testKey === testKey
      ? progress
      : { testKey, index: testQuery.data?.initialIndex ?? 0, correct: false, completed: false };
  const questions = testQuery.data?.questions ?? [];
  const question = questions[currentProgress.index];
  const completed = currentProgress.completed;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!completed || !dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, [completed]);

  function handleCorrect() {
    const isLastQuestion = currentProgress.index === questions.length - 1;
    setProgress({ ...currentProgress, correct: true, completed: isLastQuestion });

    if (isLastQuestion) {
      void queryClient.invalidateQueries({ queryKey: getGetCourseProgressQueryKey(1) });
    }
  }

  let content: ReactNode;

  if (!studentId) {
    content = <Typography>Войдите через карту курса, чтобы сохранять ответы.</Typography>;
  } else if (testQuery.isPending) {
    content = <Typography>Загрузка теста...</Typography>;
  } else if (testQuery.isError) {
    const unauthorized =
      axios.isAxiosError(testQuery.error) && testQuery.error.response?.status === 401;

    content = (
      <div className="test-page__message">
        <Typography>
          {unauthorized ? "Войдите заново через карту курса." : getApiErrorMessage(testQuery.error)}
        </Typography>
        {!unauthorized && <Button onClick={() => void testQuery.refetch()}>Повторить</Button>}
      </div>
    );
  } else {
    content = (
      <>
        <Typography variable="title">
          {testQuery.data.test.title}
        </Typography>
        <label className="test-page__progress">
          <span>
            Вопрос {currentProgress.index + 1} из {questions.length}
          </span>
          <progress
            value={currentProgress.index + Number(currentProgress.correct)}
            max={questions.length}
          />
        </label>
        <TestQuestion
          key={`${testKey}:${question.id}`}
          question={question}
          studentId={studentId}
          onCorrect={handleCorrect}
          onNext={() =>
            setProgress({
              testKey,
              index: currentProgress.index + 1,
              correct: false,
              completed: false,
            })
          }
        />
      </>
    );
  }

  return (
    <div className="layout-wrapper test-page">
      <Header />
      <main className="container test-page__content">
        {content}
        {!question && (
          <Button link to={ROUTES.ROADMAP} small>
            Вернуться на карту
          </Button>
        )}
      </main>
      {completed && (
        <dialog
          ref={dialogRef}
          className="test-page__dialog"
          onCancel={(event) => event.preventDefault()}
        >
          <div>
            <Typography variable="subtitle">Поздравляем! Тест пройден</Typography>
          </div>
          <Typography>Вы правильно ответили на все вопросы.</Typography>
          <Button link to={ROUTES.ROADMAP} color="green">
            Вернуться на карту
          </Button>
        </dialog>
      )}
    </div>
  );
};
