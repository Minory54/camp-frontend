import { useGetLessons } from "../../api/generated";
import { getApiErrorMessage } from "../../api/http";

export function LessonsList({ groupId }: { groupId: number }) {
  const query = useGetLessons({ groupId });

  if (query.isPending) return <p>Загрузка...</p>;

  if (query.isError) {
    return (
      <div>
        <p>{getApiErrorMessage(query.error)}</p>
        <button onClick={() => void query.refetch()}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <ul>
      {query.data?.map((lesson) => (
        <li key={lesson.id}>{lesson.title}</li>
      ))}
    </ul>
  );
}