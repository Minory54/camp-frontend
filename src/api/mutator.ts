import type { AxiosError, AxiosRequestConfig } from "axios";
import { http } from "./http";

export async function apiRequest<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.request<T>({
    ...config,
    ...options,
  });

  return response.data;
}

export type ErrorType<TError> = AxiosError<TError>;
