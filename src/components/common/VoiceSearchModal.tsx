/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Search, ArrowRight, Volume2 } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../ui/Base';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (query: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    setTranscript('');
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMessage('Speech recognition is not supported in this browser. Please try Chrome or Edge, or type your search query below.');
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          setIsListening(false);
          onTranscript(text);
          onClose();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser settings to use voice search.');
        } else {
          setErrorMessage(`Voice recognition note: ${event.error}. You can also click any quick search command below.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setErrorMessage('Could not start microphone automatically. Please select a quick query below or type in search.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (!isOpen) return null;

  const quickCommands = [
    'MCB Circuit Breaker',
    'XLPE Power Cable',
    'Siemens PLC Module',
    'LED Industrial Floodlight',
    'Schneider Contactor',
    'Distribution Board'
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.25)] relative text-center space-y-6 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close Voice Search"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Voice Search Assistant</span>
          </div>
          <h2 className="text-xl font-extrabold text-white text-glow-cyan">
            {isListening ? "Listening to your voice..." : "Voice Search Ready"}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Speak clearly to search 15,000+ industrial electrical parts, SKUs, and brands.
          </p>
        </div>

        {/* Pulsing Mic Graphic */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-cyan-500/20 border border-cyan-400/50 ${isListening ? 'animate-ping' : ''}`} />
          <div className={`absolute -inset-3 rounded-full bg-blue-600/10 border border-blue-500/30 ${isListening ? 'animate-pulse' : ''}`} />
          <button
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening ? 'bg-gradient-to-tr from-red-500 to-pink-600 text-black shadow-[0_0_30px_rgba(255,42,95,0.8)]' : 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-black shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <MicOff className="w-8 h-8" />}
          </button>
        </div>

        {/* Transcript Result */}
        <div className="p-4 bg-[#07090e] border border-cyan-500/30 rounded-xl min-h-[60px] flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-bold text-cyan-400 tracking-wide">"{transcript}"</p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isListening ? "Say something like 'Find circuit breaker'..." : "Microphone paused. Click mic to speak or choose a command below."}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs text-rose-300 text-left font-sans">
            {errorMessage}
          </div>
        )}

        {/* Quick Voice Commands */}
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Voice Commands</span>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  onTranscript(cmd);
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#07090e] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 rounded-lg text-xs text-slate-200 hover:text-cyan-400 transition-all"
              >
                🎙️ {cmd}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <SecondaryButton onClick={onClose} className="px-6 text-xs uppercase tracking-wider">
            Close Voice Assistant
          </SecondaryButton>
        </div>

      </div>
    </div>
  );
};
