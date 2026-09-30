"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useInterviewStore } from "@/store/interview-store";
import { Loader2, Mic, MicOff, Play, RefreshCcw, Send, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  { id: "INPUT", label: "INPUT", title: "Upload your resume" },
  { id: "ANALYSIS", label: "ANALYSIS", title: "Profile Analysis" },
  { id: "PLANNING", label: "PLANNING", title: "Interview Planning" },
  { id: "INTERVIEW_LOOP", label: "INTERVIEW LOOP", title: "Q&A Session" },
  { id: "REPORT", label: "REPORT", title: "Final Report" },
];

export function InterviewClient({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const { currentStep, setCurrentStep, setSessionId } = useInterviewStore();
  
  useEffect(() => {
    setSessionId(sessionId);
  }, [sessionId, setSessionId]);

  const { data, isLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/interview/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json();
    },
    refetchInterval: (query) => {
       const state = query.state.data?.session?.status;
       return (state && state !== "REPORT" && state !== "INTERVIEW_LOOP") ? 2000 : false;
    }
  });

  const generateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/interview/sessions/${sessionId}/profile`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate profile");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/interview/sessions/${sessionId}/plan`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate plan");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });

  const generateQuestionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/interview/sessions/${sessionId}/questions/next`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate question");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (payload: { questionId: string; content: string; inputMode: string }) => {
      const res = await fetch(`/api/interview/sessions/${sessionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });

  const evaluateMutation = useMutation({
    mutationFn: async (payload: { answerId: string }) => {
      const res = await fetch(`/api/interview/sessions/${sessionId}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to evaluate answer");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });
  
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/interview/sessions/${sessionId}/report`, { method: "POST" });
      if (!res.ok) {
         const err = await res.json().catch(() => ({}));
         throw new Error(err.error || "Failed to generate report");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
  });

  // State machine auto-advancement
  useEffect(() => {
    if (!data?.session) return;
    const status = data.session.status;
    setCurrentStep(status);

    if (status === "INPUT") generateProfileMutation.mutate();
    if (status === "ANALYSIS") generatePlanMutation.mutate();
    if (status === "PLANNING") generateQuestionMutation.mutate();
    if (status === "REPORT" && !data.report && !generateReportMutation.isPending) {
       generateReportMutation.mutate();
    }
    if (status === "INTERVIEW_LOOP") {
       // if there are no questions, generate the first one
       if (!data.questions || data.questions.length === 0) {
          if (!generateQuestionMutation.isPending) generateQuestionMutation.mutate();
       } else {
          // check if last question has an answer
          const lastQuestion = data.questions[data.questions.length - 1];
          const lastAnswer = data.answers?.find((a: any) => a.questionId === lastQuestion.id);
          
          if (lastAnswer) {
             const lastEval = data.evaluations?.find((e: any) => e.answerId === lastAnswer.id);
             if (!lastEval) {
                // Evaluate answer
                if (!evaluateMutation.isPending) evaluateMutation.mutate({ answerId: lastAnswer.id });
             } else {
                // After evaluation, we need the next question (or report if finished)
                // We should only fire this once, so check if we already have a pending mutation
                // Actually, relying on a manual button to advance might be better for UX, 
                // but let's just show a "Next Question" button when evaluation is done.
             }
          }
       }
    }
  }, [data?.session?.status, data?.questions, data?.answers, data?.evaluations]);

  if (isLoading || !data) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin size-8 text-primary" /></div>;

  const { session, profile, plan, questions, answers, evaluations, report } = data;
  const activeStepIdx = STEPS.findIndex(s => s.id === currentStep);

  const lastQuestion = questions?.[questions.length - 1];
  const lastAnswer = answers?.find((a: any) => a.questionId === lastQuestion?.id);
  const lastEval = evaluations?.find((e: any) => e.answerId === lastAnswer?.id);

  return (
    <div className="mx-auto max-w-6xl mt-12 p-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        
        {/* Left Side: Vertical Stepper */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">Interview Progress</h2>
          <div className="relative space-y-0">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStepIdx;
              const isPast = idx < activeStepIdx;
              return (
                <div key={step.id} className="relative flex w-full gap-4 pb-8 text-left last:pb-0">
                  {idx < STEPS.length - 1 && (
                    <span className={`absolute left-[15px] top-9 h-full w-px ${isPast ? "bg-primary" : "bg-border"}`} />
                  )}
                  <span
                    className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                      isActive ? "border-primary bg-primary text-primary-foreground" : isPast ? "border-primary text-primary bg-background" : "border-border text-muted-foreground bg-background"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="size-4" /> : `0${idx + 1}`}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{step.label}</p>
                    <p className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Dynamic Content */}
        <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col min-h-[400px]">
          {currentStep === "INPUT" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="animate-spin size-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Analyzing your profile...</h3>
              <p className="text-muted-foreground">The AI is reviewing your resume against the job description.</p>
            </div>
          )}

          {currentStep === "ANALYSIS" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="animate-spin size-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Planning your interview...</h3>
              <p className="text-muted-foreground">We are generating a customized question plan based on your skill gaps.</p>
            </div>
          )}

          {currentStep === "PLANNING" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="animate-spin size-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Preparing first question...</h3>
            </div>
          )}

          {currentStep === "INTERVIEW_LOOP" && lastQuestion && (
            <div className="flex flex-col h-full space-y-6">
               <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold">Question {questions.length}</h3>
                    <Badge variant="outline" className="mt-1 text-xs text-muted-foreground bg-muted/50">Topic: {lastQuestion.topic}</Badge>
                  </div>
                  {lastQuestion.parentQuestionId && (
                    <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                      <RefreshCcw className="size-3" /> Follow-up
                    </Badge>
                  )}
               </div>

               <div className="bg-primary/5 p-5 rounded-lg border border-primary/20">
                  <p className="text-lg font-medium">{lastQuestion.prompt}</p>
                  <div className="mt-4 pt-3 border-t border-primary/10 flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold whitespace-nowrap">Why asked:</span>
                    <span>{lastQuestion.reason}</span>
                  </div>
               </div>

               {/* Interaction Area */}
               {!lastAnswer && (
                 <AnswerForm 
                   onSubmit={(content) => submitAnswerMutation.mutate({ questionId: lastQuestion.id, content, inputMode: "text" })}
                   isPending={submitAnswerMutation.isPending}
                 />
               )}

               {lastAnswer && !lastEval && (
                 <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-muted/30 rounded-lg">
                    <Loader2 className="animate-spin size-8 text-primary" />
                    <p className="font-medium">Evaluating your answer...</p>
                 </div>
               )}

               {lastEval && (
                 <div className="space-y-6">
                    <div className="bg-background border p-4 rounded-lg">
                       <h4 className="font-semibold mb-2">Your Answer:</h4>
                       <p className="text-muted-foreground">{lastAnswer.content}</p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-lg">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-bold text-green-700 dark:text-green-400">Evaluation</h4>
                          <Badge variant="outline" className="text-sm font-bold bg-background">Score: {lastEval.score} / 5</Badge>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-4">
                          <div>
                             <h5 className="font-semibold text-green-700 dark:text-green-400 mb-1">Strengths</h5>
                             <ul className="list-disc pl-5 text-sm space-y-1">
                                {lastEval.feedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                             </ul>
                          </div>
                          <div>
                             <h5 className="font-semibold text-red-700 dark:text-red-400 mb-1">Gaps / Missed</h5>
                             <ul className="list-disc pl-5 text-sm space-y-1 text-red-900/80 dark:text-red-300">
                                {lastEval.feedback.gaps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                             </ul>
                          </div>
                       </div>
                    </div>

                    <Button 
                       size="lg" 
                       className="w-full"
                       disabled={generateQuestionMutation.isPending || generateReportMutation.isPending}
                       onClick={() => {
                          generateQuestionMutation.mutate();
                       }}
                    >
                       {generateQuestionMutation.isPending || generateReportMutation.isPending ? (
                          <Loader2 className="animate-spin size-4 mr-2" />
                       ) : null}
                       {lastEval.score < 4 && !lastQuestion.parentQuestionId ? "Proceed to Follow-up" : "Next Question"}
                    </Button>
                 </div>
               )}
            </div>
          )}

          {currentStep === "REPORT" && (
            <div className="flex flex-col h-full space-y-6">
              {!report ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    {generateReportMutation.isError ? (
                       <div className="text-red-500 max-w-md">
                          <h3 className="text-xl font-semibold mb-2">Error Generating Report</h3>
                          <p className="text-sm mb-4">{generateReportMutation.error?.message || "An unknown error occurred"}</p>
                          <Button onClick={() => generateReportMutation.mutate()}>Try Again</Button>
                       </div>
                    ) : (
                       <>
                          <Loader2 className="animate-spin size-12 text-primary mx-auto" />
                          <h3 className="text-xl font-semibold">Generating Final Report...</h3>
                       </>
                    )}
                 </div>
              ) : (
                 <div className="space-y-6">
                    <div className="text-center pb-6 border-b">
                       <h2 className="text-3xl font-bold mb-2">Interview Complete</h2>
                       <div className="inline-block mt-4 p-4 bg-primary/10 rounded-full border border-primary/20">
                          <span className="text-4xl font-black text-primary">{report.overallScore}</span>
                          <span className="text-xl font-bold text-muted-foreground">/100</span>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-xl font-bold mb-4">Topic Breakdown</h3>
                       <div className="space-y-3">
                          {report.topicBreakdown.map((t: any, i: number) => (
                             <div key={i} className="bg-muted p-3 rounded flex justify-between items-center">
                                <span className="font-semibold">{t.topic}</span>
                                <Badge>{t.score}/100</Badge>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div>
                       <h3 className="text-xl font-bold mb-2">Executive Summary</h3>
                       <div className="p-5 bg-card border rounded-lg whitespace-pre-wrap leading-relaxed">
                          {report.summary}
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useSpeechToText } from "@/hooks/use-speech-to-text";

function AnswerForm({ onSubmit, isPending }: { onSubmit: (val: string) => void, isPending: boolean }) {
  const [val, setVal] = useState("");
  
  const { 
    isListening, 
    interim, 
    supported, 
    start, 
    stop 
  } = useSpeechToText(
    (text) => setVal(prev => prev + (prev.length > 0 && !prev.endsWith(" ") ? " " : "") + text)
  );

  const displayValue = val + (interim ? (val.length > 0 && !val.endsWith(" ") ? " " : "") + interim : "");

  return (
    <div className="space-y-4">
      {!supported && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          Your browser does not support the Web Speech API. Please use Chrome, Edge, or Safari.
        </div>
      )}
      <Textarea 
         placeholder="Type your answer here..."
         className="min-h-[150px] resize-y"
         value={displayValue}
         onChange={e => setVal(e.target.value)}
      />
      <div className="flex justify-between items-center">
         <Button 
            variant={isListening ? "destructive" : "outline"} 
            type="button"
            onClick={isListening ? stop : start}
            disabled={!supported}
         >
            {isListening ? (
              <>
                <span className="relative flex size-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-white"></span>
                </span>
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="size-4 mr-2" />
                Voice Answer
              </>
            )} 
         </Button>
         <Button 
           onClick={() => {
             stop();
             onSubmit(val);
           }} 
           disabled={!val.trim() || isPending}
         >
           {isPending && <Loader2 className="animate-spin size-4 mr-2" />}
           Submit Answer <Send className="size-4 ml-2" />
         </Button>
      </div>
    </div>
  );
}
