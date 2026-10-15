import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "../stores/sessionStore";
import { useCheckPractice } from "../api/generated";

export function useSubmitPractice() {
  const queryClient = useQueryClient();
  const studentId = useSessionStore((state) => state.session?.studentId);

  return useCheckPractice({
    mutation: {
      onSuccess: async () => {
        if (!studentId) return;

        await queryClient.invalidateQueries({
          queryKey: ["student", studentId, "progress"],
        });
      },
    },
  });
}
