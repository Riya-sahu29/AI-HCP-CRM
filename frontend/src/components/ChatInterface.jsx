
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage, addUserMessage, clearChat } from '../features/chat/chatSlice';

const suggestions = [
  "Log a visit with Dr. Sharma about Metformin today",
  "Show me Dr. Patel's profile",
  "Summarize all interactions with Dr. Kumar",
  "Schedule a follow-up with Dr. Mehta on 2025-05-01",
  "Edit interaction ID 1 — update notes to: discussed new dosage",
];

export default function ChatInterface() {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector(s => s.chat);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    dispatch(addUserMessage(msg));
    await dispatch(sendChatMessage({ message: msg, history: messages }));
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[520px]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-slate-700">AI Agent</span>
          <span className="text-xs text-slate-400">gemma2-9b-it</span>
        </div>
        <button
          onClick={() => dispatch(clearChat())}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">AI CRM Assistant</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Type naturally to log interactions, check HCP profiles, or schedule follow-ups
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 text-center">Try saying:</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 px-3 py-2.5 rounded-xl border border-slate-100 hover:border-primary-200 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar */}
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            )}

            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="chat-bubble flex justify-start">
            <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
              <div className="dot w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="dot w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="dot w-2 h-2 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl text-center">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            placeholder="Type: Log a visit with Dr. Sharma about Metformin today..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none transition"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 h-fit"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}