import { useEffect, useState } from "react";

const COOLDOWN_MS = 5_000;

function readDeadline(key: string) {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function usePracticeCooldown(practiceId: number, studentId?: string) {
  const key = `camp-practice-submit:${studentId ?? "guest"}:${practiceId}`;
  const [deadline, setDeadline] = useState(() => readDeadline(key));
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        setDeadline(readDeadline(key));
        setNow(Date.now());
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  function start() {
    const current = Date.now();
    if (Math.max(deadline, readDeadline(key)) > current) return false;
    const next = current + COOLDOWN_MS;
    try {
      localStorage.setItem(key, String(next));
    } catch {
      /* The in-memory timer still applies. */
    }
    setDeadline(next);
    setNow(current);
    return true;
  }

  return { seconds: Math.max(0, Math.ceil((deadline - now) / 1000)), start };
}
