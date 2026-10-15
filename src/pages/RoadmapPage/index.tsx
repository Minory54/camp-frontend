import { useGetCourseById, useGetCourseProgress } from "../../api/generated";
import { Header } from "../../components/Header";
import { Island } from "../../components/Island";
import { ProgressBar } from "../../components/ProgressBar";
import "./style.scss";

export const RoadmapPage = () => {
  const studentId = "b15f8e06-4c3b-46d0-94d1-c2941ed23e3a";
  const courseQuery = useGetCourseById(1);
  const progressQuery = useGetCourseProgress(1, { studentId });

  if (courseQuery.isError || progressQuery.isError) {
    return <p>Не удалось загрузить курс или прогресс.</p>;
  }
  if (courseQuery.isPending || progressQuery.isPending) {
    return <p>Загрузка...</p>;
  }

  return (
    <>
      <main className="layout-wrapper roadmap">
        <section className="container roadmap__content">
          <Header transparency></Header>
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
        </section>
      </main>
    </>
  );
};
