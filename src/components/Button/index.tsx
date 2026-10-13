import { NavLink } from "react-router";
import "./style.scss";
import clsx from "clsx";

type Color = "base" | "yellow" | "blue" | "green" | "grey";

interface ButtonProp {
  link?: boolean;
  color?: Color;
  children: React.ReactNode;
  className?: string;
  to?: string;
  display?: boolean;
}

export const Button = ({ display, link, to = "/", color, className, children }: ButtonProp) => {
  const Tag = link ? NavLink : "button";

  switch (color) {
    case "yellow":
      return (
        <Tag
          to={to}
          className={clsx("button", "button--yellow", display && "button--display", className)}
        >
          {children}
        </Tag>
      );
    case "blue":
      return (
        <Tag to={to} className={clsx("button", "button--blue", display && "button--display", className)}>
          {children}
        </Tag>
      );
    case "green":
      return (
        <Tag to={to} className={clsx("button", "button--green", display && "button--display", className)}>
          {children}
        </Tag>
      );
    case "grey":
      return (
        <Tag to={to} className={clsx("button", "button--grey", display && "button--display", className)}>
          {children}
        </Tag>
      );
    default:
      return (
        <Tag to={to} className={clsx("button", "button--base", display && "button--display", className)}>
          {children}
        </Tag>
      );
  }
};
