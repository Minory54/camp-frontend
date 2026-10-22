import { Component, isValidElement, type ComponentProps, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { useBDMdxContent } from "../../hooks/useBDMdxContent";
import { useLocalMdxContent } from "../../hooks/useLocalMdxContent";
import { Button } from "../Button";
import { Typography } from "../Typography";
import "./style.scss";

type MdxContentProps = {
  title: string;
} & ({ source: "db"; mdx_source: string } | { source: "local"; file: string });

const mdxComponents: MDXComponents = {
  Button,
  Typography,
  pre: ({ children, ...props }: ComponentProps<"pre">) => {
    const language = isValidElement<{ className?: string }>(children)
      ? /(?:^|\s)language-(\S+)/.exec(children.props.className ?? "")?.[1]
      : undefined;

    return (
      <div className="mdx-content__code">
        {language && <div className="mdx-content__code-title">{language}</div>}
        <pre {...props}>{children}</pre>
      </div>
    );
  },
  h1: ({ children }: ComponentProps<"h1">) => {
    return (
      <Typography variable="title" mdx>
        {children}
      </Typography>
    );
  },
  h2: ({ children }: ComponentProps<"h2">) => {
    return (
      <Typography variable="subtitle" mdx>
        {children}
      </Typography>
    );
  },
  h3: ({ children }: ComponentProps<"h3">) => {
    return (
      <Typography variable="subsubtitle" mdx>
        {children}
      </Typography>
    );
  },
  p: ({ children }: ComponentProps<"p">) => {
    return <Typography mdx>{children}</Typography>;
  },
  ol: ({ children }: ComponentProps<"ol">) => {
    return <ol className="list">{children}</ol>;
  },

  ul: ({ children }: ComponentProps<"ul">) => {
    return <ul className="list">{children}</ul>;
  },
  a: ({ children }: ComponentProps<"a">) => {
    return <a className="link">{children}</a>;
  },
  blockquote: ({ children }: ComponentProps<"blockquote">) => {
    return <blockquote className="blockquote">{children}</blockquote>;
  },
  img: ({ ...props }: ComponentProps<"img">) => {
    return <img {...props} className="img"></img>;
  },
};

class MdxErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  render() {
    if (this.state.error) {
      return (
        <p className="mdx-content__message" role="alert">
          Не удалось отобразить материал: {this.state.error.message}
        </p>
      );
    }

    return this.props.children;
  }
}

export const MdxContent = (props: MdxContentProps) => {
  const dbContent = useBDMdxContent(props.source === "db" ? props.mdx_source : undefined);
  const localContent = useLocalMdxContent(props.source === "local" ? props.file : undefined);
  const { Content, isLoading, error } = props.source === "db" ? dbContent : localContent;
  const contentKey = props.source === "db" ? "db:" + props.mdx_source : "local:" + props.file;

  return (
    <div className="mdx-content" aria-busy={isLoading}>
      <Typography variable="title">{props.title}</Typography>

      {isLoading && (
        <p className="mdx-content__message" role="status">
          Подготовка материала...
        </p>
      )}

      {error && (
        <p className="mdx-content__message" role="alert">
          Не удалось загрузить материал: {error.message}
        </p>
      )}

      {Content && (
        <MdxErrorBoundary key={contentKey}>
          <Content components={mdxComponents} />
        </MdxErrorBoundary>
      )}
    </div>
  );
};
