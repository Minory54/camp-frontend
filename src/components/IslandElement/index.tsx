import type { GetCourseById200GroupsItemLessonsItem } from "../../api/generated/models";
import { Button } from "../Button";
import "./style.scss";
import clsx from "clsx";

type Variable = "end" | "start" | "bridge" | "base";

interface IslandElementProps {
  variable?: Variable;
  lesson?: GetCourseById200GroupsItemLessonsItem;
  available?: boolean;
}

export const IslandElement = ({ lesson, available, variable = "base" }: IslandElementProps) => {
  const buttons = [
    {
      id: lesson?.id_theory,
      path: "/theory",
      label: lesson?.theory?.technology?.title ?? "Теория",
      color: "blue",
    },
    {
      id: lesson?.id_test,
      path: "/test",
      label: lesson?.theory?.technology?.title ?? "Тест",
      color: "green",
    },
    {
      id: lesson?.id_practice,
      path: "/practice",
      label: lesson?.theory?.technology?.title ?? "Практика",
      color: "yellow",
    },
  ] as const;

  switch (variable) {
    case "start":
      return (
        <>
          <article className={clsx("island-element", `island-element--start`)}>
            <div className="land"></div>
          </article>
        </>
      );
    case "end":
      return (
        <>
          <article className={clsx("island-element", `island-element--start`)}>
            <div className="land"></div>
          </article>
          <article className={clsx("island-element", `island-element--end`)}>
            <div className="land"></div>
          </article>
        </>
      );
    case "bridge":
      return <article className={clsx("island-element", `island-element--${variable}`)}></article>;
    case "base":
    default:
      return (
        <article className={clsx("island-element", "island-element--base")}>
          <div className="land">
            <div className="island-element__group">
              {buttons.map((button) => {
                if (button.id === null) return null;

                return (
                  <Button
                    key={button.path}
                    link={available}
                    to={`${button.path}/${button.id}`}
                    color={available ? button.color : "grey"}
                    small
                  >
                    {button.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </article>
      );
  }
};
