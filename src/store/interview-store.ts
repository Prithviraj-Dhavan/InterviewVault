import { create } from 'zustand';

type InterviewState = {
  currentStep: "INPUT" | "ANALYSIS" | "PLANNING" | "INTERVIEW_LOOP" | "REPORT";
  sessionId: string | null;
  setCurrentStep: (step: "INPUT" | "ANALYSIS" | "PLANNING" | "INTERVIEW_LOOP" | "REPORT") => void;
  setSessionId: (id: string | null) => void;
};

export const useInterviewStore = create<InterviewState>((set) => ({
  currentStep: "INPUT",
  sessionId: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setSessionId: (id) => set({ sessionId: id }),
}));
