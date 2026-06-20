"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Send, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface MagicInputProps {
  onActivityLogged?: () => void;
}

export default function MagicInput({ onActivityLogged }: MagicInputProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition || 
        (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-IN"; // Best support for Indian english/hindi accents

        rec.onstart = () => {
          setIsListening(true);
          setError(null);
          setSuccessMsg(null);
        };

        rec.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptSegment;
            } else {
              interim += transcriptSegment;
            }
          }

          if (final) {
            setInputText((prev) => (prev ? prev.trim() + " " + final.trim() : final.trim()));
          }
          setInterimTranscript(interim);
        };

        rec.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error: ", event);
          if (event.error !== "no-speech") {
            setError(`Voice error: ${event.error}`);
            setIsListening(false);
          }
        };

        rec.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputText]);

  const handleToggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setError("Speech recognition is not supported in this browser. Try Google Chrome.");
      return;
    }

    if (isListening) {
      rec.stop();
    } else {
      setError(null);
      setSuccessMsg(null);
      try {
        rec.start();
      } catch (err) {
        console.error(err);
        rec.stop();
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    }

    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/log-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log activity");
      }

      setInputText("");
      setSuccessMsg("Activity logged successfully!");
      
      if (onActivityLogged) {
        onActivityLogged();
      }

      // Automatically clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Floating Magic Input Card */}
      <div className="relative rounded-3xl border border-[#E5E7EB] bg-white/70 backdrop-blur-md p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
        
        {/* Glow accent while processing */}
        {isLoading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-[shimmer_1.5s_infinite] bg-[length:200%_auto]" />
        )}

        <form onSubmit={handleSubmit} className="flex items-start gap-4">
          
          {/* Microphone button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 relative group cursor-pointer ${
              isListening
                ? "bg-red-50 border-red-200 text-red-500 shadow-md shadow-red-100"
                : "bg-emerald-50/60 border-emerald-100 text-[#059669] hover:bg-emerald-100/70 hover:border-emerald-200"
            }`}
            title={isListening ? "Stop listening" : "Log with voice"}
          >
            {isListening ? (
              <>
                <Mic className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </>
            ) : (
              <Mic className="h-5 w-5 transition-transform group-hover:scale-105" />
            )}
          </button>

          {/* Text Input area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={isListening ? "Listening... Speak naturally" : "Tell me what you did today..."}
              className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 text-base md:text-lg py-2.5 resize-none leading-relaxed min-h-[44px]"
            />
            
            {/* Live transcript overlay */}
            {isListening && interimTranscript && (
              <div className="text-sm text-gray-400 italic mt-1 pb-1 animate-pulse">
                {interimTranscript}
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 cursor-pointer ${
              inputText.trim() && !isLoading
                ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-100 hover:shadow-lg hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        {/* Skeleton shimmer loaders */}
        {isLoading && (
          <div className="space-y-3.5 mt-4 pt-4 border-t border-gray-100/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 animate-pulse">
              <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
              <span>Gemini is extracting carbon parameters...</span>
            </div>
            <div className="space-y-2.5 animate-pulse">
              <div className="h-3.5 bg-gray-200/70 rounded-full w-3/4" />
              <div className="h-3.5 bg-gray-200/70 rounded-full w-5/6" />
              <div className="h-3.5 bg-gray-200/70 rounded-full w-2/3" />
            </div>
          </div>
        )}

        {/* Messages feedbacks */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50/70 backdrop-blur-sm p-3.5 text-sm text-red-700 border border-red-100 animate-fadeIn">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50/70 backdrop-blur-sm p-3.5 text-sm text-emerald-800 border border-emerald-100 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}
      </div>

      <div className="mt-3.5 px-4 flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border">Enter</kbd> to submit</span>
        <span>Supports speech logging (Chrome/Safari)</span>
      </div>
    </div>
  );
}
