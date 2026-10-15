import "./style.scss";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar = ({ completed, total }: ProgressBarProps) => (
  <label className="progress-bar">
    <span>Пройдено уроков: {completed} из {total}</span>
    <progress value={completed} max={total || 1} />
  </label>
);
