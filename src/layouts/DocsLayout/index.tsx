import { useParams } from "react-router";
import { MdxComponent } from "../../components/MdxComponent";

type DocsLayoutProps = {
  section: "theory" | "components";
};

export const DocsLayout = ({ section }: DocsLayoutProps) => {
  const { id } = useParams();
  return (
    <>
      <h1>Docs layout</h1>
      <main className="docs__content">
        {!id ? <p>← Выберите тему</p> : <MdxComponent section={section} id={Number(id)} />}
      </main>
    </>
  );
};
