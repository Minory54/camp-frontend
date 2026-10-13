import "./style.scss";
import clsx from "clsx";

type Variable = "display" | "title" | "subtitle" | "subsubtitle" | "text";

interface TypographyProps {
  variable?: Variable;
  children: React.ReactNode;
  className?: string;
  mdx?: boolean;
}

export const Typography = ({ variable = "text", className, children, mdx }: TypographyProps) => {
  switch (variable) {
    case "display":
      return <h1 className={clsx("text--display", className)}>{children}</h1>;
    case "title":
      return <h1 className={clsx("text--title", mdx  && "mdx", className)}>{children}</h1>;
    case "subtitle":
      return <h2 className={clsx("text--subtitle", mdx  && "mdx", className)}>{children}</h2>;
    case "subsubtitle":
      return <h3 className={clsx("text--subsubtitle", mdx  && "mdx", className)}>{children}</h3>;
    case "text":
    default:
      return <p className={clsx("text", className)}>{children}</p>;
  }
};
