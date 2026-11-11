import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Paperclip,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { ChatMessage } from '../types';
import { ActiveTab } from './Navigation';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onNavigate: (tab: ActiveTab) => void;
  isDemoMode: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  onNavigate,
  isDemoMode
}) => {
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    setErrorMsg(null);
    try {
      await onSendMessage(text);
    } catch (err: any) {
      setErrorMsg('Message failed to deliver. Please check your connection and retry.');
      setInputText(text); // preserve draft
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const promptSuggestions = [
    { text: 'I have no internship experience. Is my college project enough to apply?', label: 'No experience concern' },
    { text: 'Help me choose a role based on Python and SQL', label: 'Help me choose a role' },
    { text: 'Review my attendance project claim', label: 'Review my project' },
    { text: 'Find matching backend internships for me', label: 'Find matching internships' },
    { text: 'Remind me tomorrow to review my application draft', label: 'Remind me tomorrow' },
    { text: 'Practise interview questions on duplicate attendance records', label: 'Practise interview' }
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] md:w-[460px] bg-[#FFFFFF] border-l border-[#E8DFCF] shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8DFCF] bg-[#14213D] text-[#F4EDE0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B5B] flex items-center justify-center text-white font-bold font-display text-sm">
            A
          </div>
          <div>
            <h2 className="font-display font-semibold text-base text-white tracking-tight leading-tight">
              Talk to A-viora
            </h2>
            <p className="text-xs text-[#F4EDE0]/70 mt-0.5">
              Discuss your goals, questions and placement concerns.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-[#1E2F52] text-[#F4EDE0]/70 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode notice if demo */}
      {isDemoMode && (
        <div className="px-4 py-2 bg-[#F4EDE0] border-b border-[#E8DFCF] flex items-center gap-2 text-xs text-[#14213D]/80">
          <Info className="w-4 h-4 text-[#FF6B5B] shrink-0" />
          <span>Demo Mode · Built-in agent rules active (no live Gemini key detected).</span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]">
        {messages.map(msg => {
          const isStudent = msg.sender === 'student';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-xl p-3.5 text-sm leading-relaxed ${
                  isStudent
                    ? 'bg-[#14213D] text-[#F4EDE0] rounded-br-xs shadow-xs'
                    : 'bg-[#FFFFFF] text-[#14213D] border border-[#E8DFCF] rounded-bl-xs shadow-xs'
                }`}
              >
                {/* Message body */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Tool Activities if any executed */}
                {msg.toolActivities && msg.toolActivities.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#E8DFCF] space-y-1.5">
                    {msg.toolActivities.map((tool, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex items-center justify-between gap-2 p-2 rounded bg-[#F4EDE0]/80 text-[#14213D]"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono font-medium text-[11px] text-[#14213D]/70">
                            {tool.toolName}
                          </span>
                          <span className="truncate max-w-[200px] text-[11px]">{tool.summary}</span>
                        </div>
                        {tool.linkTarget && (
                          <button
                            onClick={() => onNavigate(tool.linkTarget as ActiveTab)}
                            className="text-[#FF6B5B] hover:text-[#E05A4A] font-semibold text-[11px] flex items-center gap-1 shrink-0"
                          >
                            Open <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp & Simulated tag */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#14213D]/50 font-mono">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.isSimulatedDemo && <span>· Simulated</span>}
              </div>

              {/* Suggested Follow-up Actions */}
              {!isStudent && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {msg.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => {
                        if (action.actionType === 'navigate' && action.target) {
                          onNavigate(action.target as ActiveTab);
                        } else if (action.actionType === 'prompt' && action.target) {
                          setInputText(action.target);
                          textareaRef.current?.focus();
                        }
                      }}
                      className="text-xs px-2.5 py-1 rounded bg-[#E8DFCF]/70 hover:bg-[#E8DFCF] text-[#14213D] font-medium transition-colors border border-[#14213D]/10 flex items-center gap-1.5"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-[#FFFFFF] border border-[#E8DFCF] rounded-xl rounded-bl-xs p-3.5 shadow-xs text-xs text-[#14213D]/70 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B5B] animate-ping" />
              <span>A-viora is reviewing facts and formulating practical guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Shelf */}
      <div className="p-2.5 bg-[#FFFFFF] border-t border-[#E8DFCF] overflow-x-auto">
        <div className="flex items-center gap-2 text-xs text-[#14213D]/60 mb-1.5 px-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B5B]" />
          <span>Quick Placement Prompts</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {promptSuggestions.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(p.text);
                textareaRef.current?.focus();
              }}
              className="text-xs whitespace-nowrap px-2.5 py-1 rounded-md bg-[#F4EDE0] hover:bg-[#E8DFCF] text-[#14213D] font-medium transition-colors border border-[#E8DFCF] shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Tray */}
      <div className="p-3 bg-[#FFFFFF] border-t border-[#E8DFCF]">
        {errorMsg && (
          <div className="mb-2 p-2 rounded bg-red-50 text-red-700 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-800 font-bold ml-2">×</button>
          </div>
        )}
        <div className="relative rounded-lg border border-[#E8DFCF] focus-within:border-[#14213D] bg-white transition-colors">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share a concern or ask for help…"
            rows={2}
            className="w-full p-2.5 text-sm bg-transparent resize-none focus:outline-hidden text-[#14213D] placeholder-[#14213D]/40"
          />
          <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-[#E8DFCF]/50 bg-[#FAF7F2]/40 rounded-b-lg">
            <span className="text-[11px] text-[#14213D]/50">
              Shift + Enter for new line
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputText('Here is my project README excerpt for the database schema:');
                  textareaRef.current?.focus();
                }}
                className="p-1.5 text-[#14213D]/60 hover:text-[#14213D] rounded-md hover:bg-[#E8DFCF]/50"
                title="Paste project source excerpt"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                  !inputText.trim() || isLoading
                    ? 'bg-[#E8DFCF] text-[#14213D]/40 cursor-not-allowed'
                    : 'bg-[#FF6B5B] text-[#14213D] hover:bg-[#E05A4A]'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
