import { NavLink } from "react-router";
import clsx from "clsx";
import { ROUTES } from "../../units/routes";
import "./style.scss";

interface HeaderProps {
  className?: string;
  transparency?: boolean;
}

export const Header = ({ className, transparency }: HeaderProps) => {
  return (
    <>
      <header className={clsx("header", transparency && "header--transparent", className)}>
        <nav className="header__nav">
          <NavLink className={"nav__link"} to={ROUTES.ROADMAP}>Дорожная карта</NavLink>
          <div className="vertical-line"></div>
          <NavLink className={"nav__link"}  to={ROUTES.THEORY}>База знаний</NavLink>
          <div className="vertical-line"></div>
          <NavLink className={"nav__link"}  to={ROUTES.COMPONENTS}>Библиотека компонентов</NavLink>
          <div className="vertical-line"></div>
          <NavLink className={"nav__link"}  to={ROUTES.RULE}>Как считаются баллы?</NavLink>
        </nav>
      </header>
    </>
  );
};
