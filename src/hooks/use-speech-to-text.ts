"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSpeechToText(onFinalText: (text: string) => void) {
  const recRef = useRef<any>(null);
  const wantListening = useRef(false);
  const onFinalRef = useRef(onFinalText);
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    onFinalRef.current = onFinalText;
  }, [onFinalText]);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const rec = new SR();
    // Use continuous = false because Chrome has a known bug where continuous = true 
    // stops firing onresult after a while or completely fails to return text.
    // We handle continuation manually via the onend event.
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let newInterimText = "";
      let newFinalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) newFinalText += chunk;
        else newInterimText += chunk;
      }
      
      console.log("Speech result:", { newInterimText, newFinalText });
      
      if (newFinalText) onFinalRef.current(newFinalText.trim());
      setInterim(newInterimText);
    };

    rec.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.error("Speech recognition error:", e.error);
      }
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantListening.current = false;
        setIsListening(false);
      }
    };

    rec.onend = () => {
      console.log("Speech recognition ended");
      if (wantListening.current) {
        // Automatically restart to simulate continuous=true but more robustly
        try { 
          rec.start(); 
        } catch (e) {
          console.error("Failed to restart recognition", e);
        }
      } else {
        setIsListening(false);
        setInterim("");
      }
    };

    recRef.current = rec;
    return () => {
      wantListening.current = false;
      rec.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!recRef.current || wantListening.current) return;
    wantListening.current = true;
    setIsListening(true);
    setInterim("");
    try { 
      recRef.current.start(); 
    } catch (e) {
      console.error("Failed to start recognition", e);
    }
  }, []);

  const stop = useCallback(() => {
    wantListening.current = false;
    setIsListening(false);
    recRef.current?.stop();
  }, []);

  return { isListening, interim, supported, start, stop };
}