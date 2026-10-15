import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Session {
  studentId: string;
  accessToken: string;
}

interface SessionState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: "camp-session",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
