import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "../stores/sessionStore";
import { useCheckPractice } from "../api/generated";

export function useSubmitPractice() {
  const queryClient = useQueryClient();
  const studentId = useSessionStore((state) => state.session?.studentId);

  return useCheckPractice({
    mutation: {
      networkMode: "always",
      onSuccess: async (result) => {
        if (!studentId || !result.passed) return;

        await queryClient.invalidateQueries({
          predicate: (query) => {
            const [resource, params] = query.queryKey;
            return (
              typeof resource === "string" &&
              /^\/api\/courses\/\d+\/progress$/.test(resource) &&
              typeof params === "object" &&
              params !== null &&
              "studentId" in params &&
              params.studentId === studentId
            );
          },
        });
      },
    },
  });
}
