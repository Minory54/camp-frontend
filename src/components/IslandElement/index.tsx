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
      type: "Теория",
      color: "blue",
      details: lesson?.theory,
    },
    {
      id: lesson?.id_test,
      path: "/test",
      label: lesson?.theory?.technology?.title ?? "Тест",
      type: "Тест",
      color: "green",
      details: lesson?.test,
    },
    {
      id: lesson?.id_practice,
      path: "/practice",
      label: lesson?.theory?.technology?.title ?? "Практика",
      type: "Практика",
      color: "yellow",
      details: lesson?.practice,
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
                if (button.id == null) return null;

                const details = button.details;
                const title =
                  details &&
                  typeof details === "object" &&
                  "title" in details &&
                  typeof details.title === "string"
                    ? details.title
                    : lesson?.title;
                const description =
                  details &&
                  typeof details === "object" &&
                  "description" in details &&
                  typeof details.description === "string"
                    ? details.description
                    : null;

                return (
                  <div key={button.path} className="island-element__button">
                    <Button
                      link={available}
                      to={`${button.path}/${button.id}`}
                      color={button.color}
                      disabled = {!available}
                      small
                    >
                      {button.label}
                    </Button>
                    <div
                      className={clsx(
                        "island-element__tooltip",
                        `island-element__tooltip--${available ? button.color : "grey"}`,
                      )}
                      role="tooltip"
                    >
                      <h3>{title}</h3>
                      {description && <p>{description}</p>}
                      <div className="island-element__tooltip-tags">
                        <span className="island-element__tooltip-tag">{button.type}</span>
                        {lesson?.theory?.technology?.title && (
                          <span className="island-element__tooltip-tag">
                            {lesson.theory.technology.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      );
  }
};
