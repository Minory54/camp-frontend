import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { useCreateStudent } from "../../api/generated";
import { getApiErrorMessage } from "../../api/http";
import { useRecoverAccess } from "../../hooks/useRecoveryAccess";
import { useSessionStore } from "../../stores/sessionStore";
import { Button } from "../Button";
import "./style.scss";
import { Typography } from "../Typography";

type Step = "choose" | "recover" | "register" | "save-recovery-code";

const titles: Record<Step, string> = {
  choose: "Твоё приключение",
  recover: "Восстановить прогресс",
  register: "Новый пользователь",
  "save-recovery-code": "Сохрани свой код",
};

export function StudentAccessModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("choose");
  const [value, setValue] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);

  const register = useCreateStudent({
    mutation: {
      onSuccess: async (data) => {
        await queryClient.cancelQueries();
        queryClient.removeQueries();

        setSession({
          studentId: data.student.id,
          accessToken: data.access_token,
        });

        setStep("save-recovery-code");
      },
    },
  });

  const recover = useRecoverAccess();

  const registration = register.data;
  const error = step === "register" ? register.error : recover.error;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  function changeStep(next: Step) {
    setStep(next);
    setValue("");
    register.reset();
    recover.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === "recover") {
      recover.mutate(
        { data: { recovery_code: value.trim().toUpperCase() } },
        { onSuccess: onComplete },
      );
    } else if (step === "register") {
      register.mutate({
        data: { display_code: value.trim() },
      });
    }
  }

  function renderContent() {
    switch (step) {
      case "choose":
        return (
          <>
            <Typography>
              Продолжи обучение или создай пользователя, чтобы сохранять свой прогресс.
            </Typography>

            <div className="student-access__actions">
              <Button color="blue" onClick={() => changeStep("recover")}>
                Восстановить прогресс
              </Button>

              <Button color="yellow" onClick={() => changeStep("register")}>
                Новый пользователь
              </Button>
            </div>

            <Link className="student-access__back" to="/">
              На главную
            </Link>
          </>
        );

      case "recover":
      case "register":
        return (
          <>
            <Typography>
              {step === "recover"
                ? "Введи код восстановления, который ты сохранил при регистрации."
                : "Придумай уникальное имя. Под ним будет сохраняться твой прогресс."}
            </Typography>

            <form className="student-access__form" onSubmit={handleSubmit}>
              <label>{step === "recover" ? "Код восстановления" : "Имя пользователя"}</label>

              <input
                name={step === "recover" ? "recovery_code" : "display_code"}
                value={value}
                onChange={(event) => {
                  setValue(
                    step === "recover" ? event.target.value.toUpperCase() : event.target.value,
                  );

                  if (error) {
                    register.reset();
                    recover.reset();
                  }
                }}
                placeholder={step === "recover" ? "SDC1234" : "Например, pixel_explorer"}
                required
                maxLength={step === "recover" ? 7 : 255}
                pattern={step === "recover" ? "SDC[0-9]{4}" : ".*\\S.*"}
                title={
                  step === "recover"
                    ? "Код в формате SDC1234"
                    : "Имя не должно состоять только из пробелов"
                }
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={Boolean(error)}
              />

              {error && (
                <Typography className="student-access__error">
                  {getApiErrorMessage(error)}
                </Typography>
              )}

              <Button
                type="submit"
                color="yellow"
              >
                {step === "recover" ? "Восстановить" : "Создать пользователя"}
              </Button>

              <Button
                onClick={() => changeStep("choose")}
              >
                Назад
              </Button>
            </form>
          </>
        );

      case "save-recovery-code":
        if (!registration) return null;

        return (
          <>
            <Typography>
              Пользователь {registration.student.display_code} создан! Этот код поможет вернуть
              прогресс на другом устройстве или после очистки браузера.
            </Typography>

            <div className="student-access__recovery-code">{registration.recovery_code}</div>

            <Typography className="student-access__hint">
              Сохрани код в надёжном месте и не передавай другим.
            </Typography>

            <div className="student-access__actions">
              <Button color="yellow" onClick={onComplete}>
                Я сохранил код, начать
              </Button>
            </div>
          </>
        );
    }
  }

  return (
    <dialog ref={dialogRef} className="student-access" onCancel={(event) => event.preventDefault()}>
      <div className="student-access__content">
        <Typography variable="title" className="student-access__title">
          {titles[step]}
        </Typography>
        {renderContent()}
      </div>
    </dialog>
  );
}
