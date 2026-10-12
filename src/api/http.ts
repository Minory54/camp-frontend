import axios from "axios";
import { useSessionStore } from "../stores/sessionStore";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("Не задан VITE_API_URL");
}

export const http = axios.create({
  baseURL,
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const session = useSessionStore.getState().session;

  if (session) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Не удалось выполнить запрос";
  }

  return error instanceof Error ? error.message : "Произошла ошибка";
}
