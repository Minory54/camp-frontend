import { useParams } from "react-router";
import { useGetPracticeById } from "../../api/generated";
import { getApiErrorMessage } from "../../api/http";
import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { MdxContent } from "../../components/MdxContent";
import "./style.scss";

export const PracticePage = () => {
  const { id } = useParams();
  const practiceId = Number(id);
  const isValidId = Number.isInteger(practiceId) && practiceId > 0;
  const practiceQuery = useGetPracticeById(practiceId, {
    query: { enabled: isValidId },
  });

  let content;

  if (!id) {
    content = <p>Выберите задание на карте курса.</p>;
  } else if (!isValidId) {
    content = <p role="alert">Задание не найдено.</p>;
  } else if (practiceQuery.isPending) {
    content = <p role="status">Загрузка задания...</p>;
  } else if (practiceQuery.isError) {
    content = (
      <div role="alert">
        <p>{getApiErrorMessage(practiceQuery.error)}</p>
        <Button onClick={() => void practiceQuery.refetch()} small>
          Повторить
        </Button>
      </div>
    );
  } else {
    content = (
      <MdxContent
        source="db"
        title={practiceQuery.data.title}
        mdx_source={practiceQuery.data.mdx_source}
      />
    );
  }

  return (
    <div className="practice">
      <Header />
      <main className="practice__content">{content}</main>
    </div>
  );
};
