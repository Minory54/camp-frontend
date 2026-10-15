import { useParams } from "react-router";
import { MdxComponent } from "../../components/Mdx";
import { LessonsList } from "../../components/LessonList";
import { Header } from "../../components/Header";

type DocsLayoutProps = {
  section: "theory" | "components";
};

export const DocsLayout = ({ section }: DocsLayoutProps) => {
  const { id } = useParams();
  return (
    <>
      <main className="docs__content">
        <Header />
        {!id ? <p>← Выберите тему</p> : <MdxComponent section={section} id={Number(id)} />}
        <LessonsList groupId={1}></LessonsList>
      </main>
    </>
  );
};
