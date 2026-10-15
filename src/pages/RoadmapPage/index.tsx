import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { useGetCourseById, useGetCourseProgress, useGetCurrentStudent } from "../../api/generated";
import { Header } from "../../components/Header";
import { Island } from "../../components/Island";
import { ProgressBar } from "../../components/ProgressBar";
import { useSessionStore } from "../../stores/sessionStore";
import { StudentAccessModal } from "../../components/StudentAccessModal";
import "./style.scss";

export const RoadmapPage = () => {
  const session = useSessionStore((state) => state.session);
  const setSession = useSessionStore((state) => state.setSession);
  const [completedAccessToken, setCompletedAccessToken] = useState(session?.accessToken);
  const accessOpen = !session || session.accessToken !== completedAccessToken;
  const profileQuery = useGetCurrentStudent({
    query: {
      queryKey: ["student", session?.studentId, "profile"],
      enabled: Boolean(session) && !accessOpen,
      retry: false,
      refetchOnMount: "always",
    },
  });
  const courseQuery = useGetCourseById(1);
  const progressQuery = useGetCourseProgress(
    1,
    { studentId: session?.studentId ?? "" },
    {
      query: {
        enabled: Boolean(session) && !accessOpen && profileQuery.isSuccess,
      },
    },
  );
  const unauthorized =
    axios.isAxiosError(profileQuery.error) && profileQuery.error.response?.status === 401;

  useEffect(() => {
    if (unauthorized) {
      setSession(null);
    }
  }, [unauthorized, setSession]);

  let content: ReactNode;

  if (accessOpen) {
    content = (
      <StudentAccessModal
        onComplete={() => setCompletedAccessToken(useSessionStore.getState().session?.accessToken)}
      />
    );
  } else if (profileQuery.isError) {
    content = (
      <div role="alert">
        <p>Не удалось проверить сохранённый вход. Попробуй ещё раз.</p>
        <button
          type="button"
          onClick={() => void profileQuery.refetch()}
          disabled={profileQuery.isFetching}
        >
          {profileQuery.isFetching ? "Проверяем…" : "Повторить"}
        </button>
      </div>
    );
  } else if (courseQuery.isError || progressQuery.isError) {
    content = <p role="alert">Не удалось загрузить курс или прогресс.</p>;
  } else if (profileQuery.isPending || courseQuery.isPending || progressQuery.isPending) {
    content = <p role="status">Загрузка прогресса...</p>;
  } else {
    content = (
      <>
        <ProgressBar
          completed={progressQuery.data.lessons.filter((lesson) => lesson.isCompleted).length}
          total={progressQuery.data.lessons.length}
        />

        <div className="roadmap__islands">
          {courseQuery.data.Groups?.map((group, index, groups) => (
            <Island
              key={group.id}
              group={group}
              progress={progressQuery.data.lessons}
              showBridge={index < groups.length - 1}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <main className="layout-wrapper roadmap">
      <section className="container roadmap__content">
        <Header transparency />
        {content}
      </section>
    </main>
  );
};
