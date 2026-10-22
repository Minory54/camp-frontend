import { Header } from "../../components/Header";
import { MdxContent } from "../../components/MdxContent";

export const RulePage = () => {
  return (
    <>
      <Header />
      <main className="layout-wrapper">
        <section className="container rule-page">
          <MdxContent source="local" title="Система оценивания" file="rule.mdx" />
        </section>
      </main>
    </>
  );
};
