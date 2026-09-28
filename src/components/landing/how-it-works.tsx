"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const STEPS = [
  {
    id: "step-1",
    label: "INPUT",
    title: "Upload your resume",
    description: "Drop in a text-based resume PDF and paste the job description - that's all the interviewer needs to get started.",
  },
  {
    id: "step-2",
    label: "ANALYSIS",
    title: "The AI reads your background",
    description: "Your resume is compared with the role to build a profile: your level, your strongest skills, and the gaps the job cares about.",
  },
  {
    id: "step-3",
    label: "PLANNING",
    title: "It plans a tailored interview",
    description: "Based on the profile, it selects the topics to cover, allocating time to your weak spots and confirming your strong ones.",
  },
  {
    id: "step-4",
    label: "INTERVIEW LOOP",
    title: "Answer, get graded, get probed",
    description: "For each question, your answer is evaluated on the spot. If you miss the mark, the AI asks a follow-up to dig deeper.",
  },
  {
    id: "step-5",
    label: "REPORT",
    title: "A report you can act on",
    description: "After the last question, you get a detailed breakdown of your performance, with actionable feedback to improve.",
  }
];

export function HowItWorksStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is currently intersecting
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    const currentRefs = stepRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleStepClick = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    setActiveStep(index);
  };

  return (
    <section className="bg-[#0a0a12] py-24 min-h-screen text-slate-50 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight text-white">
          How the AI interview works
        </h2>

        <div className="relative">
          {/* Vertical line connecting all steps */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-[#2e2a52]" />

          <div className="space-y-0">
            {STEPS.map((step, index) => {
              const isActive = index === activeStep;

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                     stepRefs.current[index] = el;
                  }}
                  className="relative flex gap-8 md:gap-12 py-16 md:py-24 cursor-pointer group"
                  onClick={() => handleStepClick(index)}
                >
                  {/* Step Circle */}
                  <div className="relative shrink-0 mt-1">
                    <motion.div
                      layout
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? "#8b7cf6" : "transparent",
                        borderColor: isActive ? "#8b7cf6" : "#3a3568",
                        boxShadow: isActive ? "0 0 15px rgba(139,124,246,0.5)" : "none",
                        color: isActive ? "#ffffff" : "#64748b",
                      }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium relative z-10"
                    >
                      0{index + 1}
                    </motion.div>
                  </div>

                  {/* Content block */}
                  <div className="flex-1">
                    <motion.p
                      initial={false}
                      animate={{
                        color: isActive ? "#8b7cf6" : "#a78bfa50", // Muted purple to bright purple
                      }}
                      className="text-xs font-semibold tracking-widest uppercase mb-2"
                    >
                      {step.label}
                    </motion.p>
                    
                    <motion.h3
                      initial={false}
                      animate={{
                        color: isActive ? "#ffffff" : "#94a3b8", // White to slate-400
                      }}
                      className="text-2xl md:text-3xl font-bold transition-colors"
                    >
                      {step.title}
                    </motion.h3>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -10 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto", y: 0 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 text-[#9ca3af] text-base md:text-lg max-w-[420px] leading-relaxed">
                            {step.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
