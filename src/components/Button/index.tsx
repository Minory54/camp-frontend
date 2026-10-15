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
  small?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = ({
  display,
  link,
  to = "/",
  color = "base",
  className,
  children,
  small,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProp) => {
  const buttonClassName = clsx(
    "button",
    `button--${disabled ? "grey" : color}`,
    display && "button--display",
    small && "button--small",
    className,
  );

  if (link && !disabled) {
    return (
      <NavLink to={to} className={buttonClassName} onClick={onClick}>
        {children}
      </NavLink>
    );
  }

  return (
    <button type={type} className={buttonClassName} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
