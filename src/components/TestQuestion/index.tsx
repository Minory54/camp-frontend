import { useState, type FormEvent } from "react";
import axios from "axios";
import { useCheckAnswer } from "../../api/generated";
import type { GetTestById200TestQuestionsItem } from "../../api/generated/models";
import { getApiErrorMessage } from "../../api/http";
import { Button } from "../Button";
import { Typography } from "../Typography";
import "./style.scss";

interface TestQuestionProps {
  question: GetTestById200TestQuestionsItem;
  studentId: string;
  onCorrect: () => void;
  onNext: () => void;
}

export const TestQuestion = ({ question, studentId, onCorrect, onNext }: TestQuestionProps) => {
  const [selected, setSelected] = useState<number[]>([]);
  const check = useCheckAnswer({
    mutation: {
      networkMode: "always",
      onSuccess: (result) => {
        if (result.is_correct) onCorrect();
      },
    },
  });
  const wrong =
    (check.isSuccess && !check.data.is_correct) ||
    (axios.isAxiosError<{ message?: string }>(check.error) &&
      check.error.response?.status === 400 &&
      check.error.response.data.message === "Упс, не верно");
  const correct = check.isSuccess && check.data.is_correct;
  const multiple = question.type === "multiple";
  const options = (question.Question_options ?? []).toSorted((a, b) => a.position - b.position);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (check.isPending) return;

    if (wrong) {
      setSelected([]);
      check.reset();
    } else if (correct) {
      onNext();
    } else if (selected.length > 0) {
      check.mutate({
        data: {
          id_student: studentId,
          id_question: question.id,
          selected_option_ids: selected,
        },
      });
    }
  }

  return (
    <form className="test-question" onSubmit={handleSubmit}>
      <div className="test-question__content">
        <Typography variable="subtitle" className="test-question__title">
          {question.title}
        </Typography>
        {question.description && (
          <Typography className="test-question__description">{question.description}</Typography>
        )}
        {question.code_block && (
          <pre className="test-question__code">
            <code>{question.code_block}</code>
          </pre>
        )}
      </div>

      <div className="test-question__content">
        <Typography className="test-question__hint">
          {multiple
            ? "Вопрос с несколькими правильными ответами"
            : "Вопрос с одним правильным ответом"}
        </Typography>
        <fieldset
          className="test-question__options"
          aria-label="Варианты ответа"
          disabled={check.isPending || wrong || correct}
        >
          {options.map((option) => (
            <label key={option.id} className="test-question__option">
              <input
                type={multiple ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                value={option.id}
                checked={selected.includes(option.id)}
                onChange={() => {
                  check.reset();
                  setSelected((current) =>
                    multiple
                      ? current.includes(option.id)
                        ? current.filter((id) => id !== option.id)
                        : [...current, option.id]
                      : [option.id],
                  );
                }}
              />
              <span>{option.title}</span>
            </label>
          ))}
        </fieldset>
        {check.isError && !wrong && (
          <p className="test-question__error">{getApiErrorMessage(check.error)}</p>
        )}
        <div className="test-question__actions" aria-live="polite">
          <Button
            type="submit"
            color={correct ? "green" : wrong ? "yellow" : "blue"}
            disabled={check.isPending || selected.length === 0}
          >
            {check.isPending
              ? "Проверяем..."
              : wrong
                ? "Упс, неправильно. Попробовать еще раз"
                : correct
                  ? "Правильно! Следующий вопрос"
                  : "Проверить"}
          </Button>
        </div>
      </div>
    </form>
  );
};
