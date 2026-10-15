import type { GetCourseById200GroupsItem, GetCourseProgress200 } from "../../api/generated/models";
import { IslandElement } from "../IslandElement";
import "./style.scss";

interface IslandProps {
  group: GetCourseById200GroupsItem;
  progress: GetCourseProgress200["lessons"];
}

export const Island = ({ group, progress }: IslandProps) => {
  return (
    <section className="island">
      <IslandElement variable="start"/>
      {group.Lessons?.map((lesson) => {
        const lessonProgress = progress.find((item) => item.lessonId === lesson.id);

        return (
          <IslandElement
            key={lesson.id}
            lesson={lesson}
            available={group.state === "open" && (lessonProgress?.isAvailable ?? false)}
            variable="base"
          />
        );
      })}
      <IslandElement variable="end"/>
      <IslandElement variable="bridge"/>
    </section>
  );
};
