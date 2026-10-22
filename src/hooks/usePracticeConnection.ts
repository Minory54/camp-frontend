import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getPracticeById } from "../api/generated";

export function usePracticeConnection(practiceId: number) {
  const [isConnected, setConnected] = useState(navigator.onLine);

  useEffect(() => {
    let active = true;
    let checking = false;
    const controller = new AbortController();

    async function check() {
      if (!navigator.onLine) {
        setConnected(false);
        return;
      }
      if (checking) return;
      checking = true;
      try {
        await getPracticeById(practiceId, { timeout: 5_000 }, controller.signal);
        if (active) setConnected(navigator.onLine);
      } catch (error) {
        if (active) {
          // Authentication and validation responses still mean the API is reachable.
          setConnected(
            navigator.onLine &&
              axios.isAxiosError(error) &&
              Boolean(error.response && error.response.status < 500),
          );
        }
      } finally {
        checking = false;
      }
    }

    const offline = () => setConnected(false);
    const online = () => {
      void check();
    };
    void check();
    const timer = window.setInterval(online, 15_000);
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    window.addEventListener("focus", online);

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
      window.removeEventListener("focus", online);
    };
  }, [practiceId]);

  const reportError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error) && !error.response) setConnected(false);
  }, []);

  return { isConnected, reportError };
}
