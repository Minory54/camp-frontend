import { NavLink } from "react-router";
import clsx from "clsx";
import "./style.scss";
import { Typography } from "../Typography";

type DocsNavigationProps = {
  groups: {
    id: number | string;
    title: string;
    items: { id: number | string; title: string }[];
  }[];
  basePath: string;
};

export const DocsNavigation = ({ groups, basePath }: DocsNavigationProps) => {
  return (
    <nav className="docs-navigation" aria-label="Навигация по материалам">
      {groups.map((group) => (
        <section className="docs-navigation__group" key={group.id}>
          <Typography variable="subsubtitle" className="docs-navigation__title">
            {group.title}
          </Typography>
          <ul className="docs-navigation__list">
            {group.items.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={`${basePath}/${item.id}`}
                  end
                  className={({ isActive }) =>
                    clsx("docs-navigation__link", isActive && "docs-navigation__link--active")
                  }
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
};
