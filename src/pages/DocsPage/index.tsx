import { useEffect, useRef, type ReactNode } from "react";
import { useParams } from "react-router";
import { useGetTechnologies, useGetTheoryById } from "../../api/generated";
import { getApiErrorMessage } from "../../api/http";
import { DocsNavigation } from "../../components/DocsNavigation";
import { Header } from "../../components/Header";
import { MdxContent } from "../../components/MdxContent";
import { TableOfContents } from "../../components/TableOfContents";
import { ROUTES } from "../../units/routes";
import "./style.scss";

type DocsPageProps = {
  section: "theory" | "components";
};

export const DocsPage = ({ section }: DocsPageProps) => {
  const { id } = useParams();
  const contentRef = useRef<HTMLElement>(null);
  const groupsQuery = useGetTechnologies({
    query: { enabled: section === "theory" },
  });
  const documentQuery = useGetTheoryById(Number(id), {
    query: { enabled: section === "theory" && Boolean(id) },
  });
  const groups = (groupsQuery.data ?? []).map((group) => ({
    id: group.id,
    title: group.title,
    items: (group.Theories ?? []).toSorted((a, b) => a.position - b.position),
  }));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [section, id]);

  let navigation: ReactNode;

  if (section === "components") {
    navigation = <h2 className="docs__panel-title">Библиотека компонентов</h2>;
  } else if (groupsQuery.isPending) {
    navigation = <p className="docs__message">Загрузка материалов...</p>;
  } else if (groupsQuery.isError) {
    navigation = (
      <div className="docs__message" role="alert">
        <p>{getApiErrorMessage(groupsQuery.error)}</p>
        <button className="docs__retry" onClick={() => void groupsQuery.refetch()}>
          Повторить
        </button>
      </div>
    );
  } else if (groups.length === 0) {
    navigation = <p className="docs__message">Материалов пока нет.</p>;
  } else {
    navigation = <DocsNavigation groups={groups} basePath={ROUTES.THEORY} />;
  }

  let content: ReactNode;

  if (section === "components") {
    content = <p className="docs__message">Библиотека компонентов скоро появится.</p>;
  } else if (!id) {
    content = <p className="docs__message">← Выберите материал</p>;
  } else if (documentQuery.isPending) {
    content = <p className="docs__message">Загрузка материала...</p>;
  } else if (documentQuery.isError) {
    content = (
      <div className="docs__message" role="alert">
        <p>{getApiErrorMessage(documentQuery.error)}</p>
        <button className="docs__retry" onClick={() => void documentQuery.refetch()}>
          Повторить
        </button>
      </div>
    );
  } else {
    content = (
      <MdxContent title={documentQuery.data.title} mdx_source={documentQuery.data.mdx_source} />
    );
  }

  return (
    <div className="docs">
      <Header />
      <main className="docs__layout">
        <aside className="docs__sidebar docs__sidebar--navigation" aria-label="Материалы">
          {navigation}
        </aside>

        <article className="docs__article" ref={contentRef}>
          {content}
        </article>

        <aside className="docs__sidebar" aria-labelledby="docs-contents-title">
          <h2 className="docs__panel-title" id="docs-contents-title">
            Содержание
          </h2>
          {section === "theory" && id && documentQuery.isSuccess && (
            <TableOfContents contentRef={contentRef} documentId={documentQuery.data.id} />
          )}
        </aside>
      </main>
    </div>
  );
};
