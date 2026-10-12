import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (!axios.isAxiosError(error)) return false;

        const status = error.response?.status;

        return failureCount < 1
          && (status === undefined || status >= 500);
      },
    },
    mutations: {
      retry: false,
    },
  },
});