import { useQueryClient } from "@tanstack/react-query";
import { useRecoverStudent } from "../api/generated";
import { useSessionStore } from "../stores/sessionStore";

export function useRecoverAccess() {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);

  return useRecoverStudent({
    mutation: {
      onSuccess: async (data) => {
        await queryClient.cancelQueries();
        queryClient.removeQueries();

        setSession({
          studentId: data.student.id,
          accessToken: data.access_token,
        });
      },
    },
  });
}
