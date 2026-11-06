"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Volume2, Loader2 } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholderText?: string;
}

export function VoiceInputButton({ onTranscript, className = "" }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "bn-BD"; // Bengali (Bangladesh)

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            }
          }
          if (finalTranscript) {
            onTranscript(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSupported(false);
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) {
      // Simulate speech input for environments without Web Speech API or microphone permission
      setIsListening(true);
      setTimeout(() => {
        onTranscript("গতকাল রাত আটটায় বিবাদী দলবল নিয়ে এসে আমাদের জমিতে অবৈধভাবে কাঁটাতারের বেড়া দিয়েছে এবং প্রতিবাদ করায় রামদা দেখিয়ে প্রাণনাশের হুমকি প্রদান করেছে।");
        setIsListening(false);
      }, 1500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
          isListening
            ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20"
            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
        } ${className}`}
        title="বাংলায় কথা বলে জবানবন্দি রেকর্ড করুন"
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 animate-spin" />
            <span>শুনছি... (বাংলা বলুন)</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span>বাংলায় বলুন (ভয়েস টাইপিং)</span>
          </>
        )}
      </button>

      {isListening && (
        <span className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>লাইভ অডিও রেকর্ড হচ্ছে...</span>
        </span>
      )}
    </div>
  );
}
