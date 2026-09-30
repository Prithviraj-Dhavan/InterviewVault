"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileText, MessageCircle, Building2, Briefcase,
  ClipboardList, TrendingUp, ChevronDown, Play,
  CheckCircle2, ArrowUpRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function PrepStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef    = useRef<HTMLDivElement>(null);

  // Element refs
  const phaseARef  = useRef<HTMLDivElement>(null);
  const phaseBRef  = useRef<HTMLDivElement>(null);
  const sketchRef  = useRef<HTMLImageElement>(null);
  const colorRef   = useRef<HTMLImageElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<(HTMLDivElement | null)[]>([]);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // ── Master timeline pinned to the container ──────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.0,
        },
      });

      // Set initial states immediately — text and sketch visible from frame 0
      gsap.set(phaseARef.current, { opacity: 1, y: 0 });
      gsap.set(sketchRef.current, { opacity: 1, scale: 1 });
      gsap.set(colorRef.current,  { opacity: 0, scale: 0.92 });
      gsap.set(phaseBRef.current, { opacity: 0, y: 24 });

      // 0% → 8% : scroll hint fades out
      tl.to(hintRef.current, { opacity: 0, duration: 0.08 }, 0);

      // 5% → 35% : Cards stagger in
      cardsRef.current.forEach((card, i) => {
        tl.fromTo(card, { opacity: 0, y: 24, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1 },
          0.04 + i * 0.05
        );
      });

      // 55% → 65% : Phase A + cards fade out
      tl.to(phaseARef.current, { opacity: 0, y: -16, duration: 0.1 }, 0.55);
      tl.to(cardsRef.current,  { opacity: 0, stagger: 0.01, duration: 0.08 }, 0.55);

      // 55% → 78% : Sketch fades out + zooms forward
      tl.to(sketchRef.current, { opacity: 0, scale: 1.06, duration: 0.23 }, 0.55);

      // 58% → 85% : Color blooms in on top
      tl.to(colorRef.current,
        { opacity: 1, scale: 1, duration: 0.27 },
        0.58
      );

      // 65% → 73% : Phase B fades in from below
      tl.to(phaseBRef.current,
        { opacity: 1, y: 0, duration: 0.1 },
        0.65
      );

    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section className="relative w-full py-24 bg-background overflow-hidden flex flex-col items-center">
        <div className="z-10 text-center mb-12 px-4">
          <div className="text-primary font-bold tracking-widest text-xs uppercase mb-4">BUILT AROUND YOU</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Your prep. <span className="text-primary">All in one place.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Practise, get feedback and feel ready for your next step.</p>
        </div>
        <div className="relative w-full h-[480px] flex items-end justify-center mt-8">
          <img src="/illustrations/student-color.png" alt="Student" className="h-full w-auto max-h-[55vh] object-contain object-bottom" />
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative w-full bg-background" style={{ height: "320vh" }}>
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Phase A */}
        <div ref={phaseARef} className="absolute top-[12%] left-0 right-0 z-20 text-center px-4 pointer-events-none opacity-0">
          <div className="text-primary font-bold tracking-widest text-xs uppercase mb-3">BUILT AROUND YOU</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Your prep. <span className="text-primary">All in one place.</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">Practise, get feedback and feel ready for your next step.</p>
        </div>

        {/* Phase B — initially invisible, strictly separated */}
        <div ref={phaseBRef} className="absolute top-[12%] left-0 right-0 z-20 text-center px-4 pointer-events-none opacity-0">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Walk in with <span className="text-primary">confidence.</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">Turn every practice into a better next attempt.</p>
        </div>

        {/* Illustration — SKETCH behind, COLOR on top */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none" style={{ height: "74%", zIndex: 10 }}>
          {/* Sketch: z-index lower */}
          <img
            ref={sketchRef}
            src="/illustrations/student-sketch.png"
            alt="Student sketch"
            className="absolute bottom-0 w-auto max-w-[310px] md:max-w-[390px] h-full object-contain object-bottom"
            style={{ zIndex: 1 }}
          />
          {/* Color: z-index higher — always rendered ON TOP */}
          <img
            ref={colorRef}
            src="/illustrations/student-color.png"
            alt="Student full color"
            className="absolute bottom-0 w-auto max-w-[310px] md:max-w-[390px] h-full object-contain object-bottom opacity-0"
            style={{ zIndex: 2 }}
          />
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} className="absolute bottom-8 left-0 right-0 flex flex-col items-center text-muted-foreground z-20 pointer-events-none">
          <span className="text-sm mb-2">Scroll to see it come together</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>

        {/* Floating Cards */}
        <div className="absolute inset-0 max-w-6xl mx-auto pointer-events-none z-30">

          <div ref={el => { cardsRef.current[0] = el; }} className="absolute top-[18%] left-[2%] md:left-[8%] w-[240px] bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 opacity-0">
            <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Your resume</h3></div>
            <p className="text-xs text-muted-foreground mb-3">Make your experience count</p>
            <div className="space-y-1.5 mb-3">
              <div className="h-1.5 w-full bg-muted-foreground/20 rounded-full" />
              <div className="h-1.5 w-5/6 bg-muted-foreground/20 rounded-full" />
              <div className="h-1.5 w-4/6 bg-muted-foreground/20 rounded-full" />
            </div>
            <div className="text-[10px] text-muted-foreground/70">Skills · Projects · Experience</div>
          </div>

          <div ref={el => { cardsRef.current[1] = el; }} className="absolute top-[44%] left-[0%] md:left-[4%] w-[240px] bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 opacity-0">
            <div className="flex items-center gap-2 mb-2"><MessageCircle className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Communication</h3></div>
            <p className="text-xs text-muted-foreground mb-3">Speak. Listen. Improve.</p>
            <div className="flex gap-1 mb-3 items-center h-7">
              {[3,5,8,12,16,12,8,6,8,14,18,14,9,5,3].map((h,i) => (
                <div key={i} className="w-1 bg-teal-500/60 rounded-full" style={{ height: `${h*1.4}px` }} />
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground/70">Build confidence, one answer at a time</div>
          </div>

          <div ref={el => { cardsRef.current[2] = el; }} className="absolute top-[72%] left-[4%] md:left-[12%] w-[240px] bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 opacity-0">
            <div className="flex items-center gap-2 mb-3"><Building2 className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Target companies</h3></div>
            <div className="flex gap-4 mb-3 items-center">
              <div className="font-bold text-xl"><span className="text-blue-500">G</span><span className="text-red-500 text-sm">o</span><span className="text-yellow-500 text-sm">o</span></div>
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5"><div className="bg-[#F25022]"/><div className="bg-[#7FBA00]"/><div className="bg-[#00A4EF]"/><div className="bg-[#FFB900]"/></div>
              <div className="font-bold text-lg text-pink-600 tracking-tighter">tcs</div>
            </div>
            <div className="text-[10px] text-muted-foreground/70">Practise for the role you want</div>
          </div>

          <div ref={el => { cardsRef.current[3] = el; }} className="absolute top-[18%] right-[2%] md:right-[8%] w-[240px] bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 opacity-0">
            <div className="flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Interview practice</h3></div>
            <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-muted">
              <img src="/illustrations/ai-interviewer.png" alt="AI Interviewer" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs font-medium text-muted-foreground">"Tell me about yourself."</div>
          </div>

          <div ref={el => { cardsRef.current[4] = el; }} className="absolute top-[44%] right-[0%] md:right-[4%] w-[240px] bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 opacity-0">
            <div className="flex items-center gap-2 mb-2"><ClipboardList className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Skill assessments</h3></div>
            <p className="text-xs text-muted-foreground mb-3">Put your skills to the test</p>
            <div className="space-y-1.5">
              <div className="border border-border rounded-lg p-2 text-xs flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 rounded bg-muted flex items-center justify-center text-[10px] font-medium">A</div>Try an approach
              </div>
              <div className="border border-primary/30 bg-primary/5 rounded-lg p-2 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20 text-primary flex items-center justify-center text-[10px] font-medium">B</div>
                  <span className="font-medium text-primary">Right answer</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </div>

          <div ref={el => { cardsRef.current[5] = el; }} className="absolute top-[72%] right-[4%] md:right-[12%] w-[240px] bg-card rounded-2xl p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 opacity-0">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Clear feedback</h3></div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs border border-border/50 rounded-lg p-2">
                <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="w-2.5 h-2.5 text-green-500" /></div>
                <span className="text-muted-foreground font-medium">Good structure</span>
              </div>
              <div className="flex items-center gap-2 text-xs border border-border/50 rounded-lg p-2">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center"><ArrowUpRight className="w-2.5 h-2.5 text-primary" /></div>
                <span className="text-muted-foreground font-medium">Add a real example</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground/70">Know what to work on next</div>
          </div>

        </div>
      </div>
    </section>
  );
}
