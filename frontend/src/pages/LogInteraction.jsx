import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createInteraction, clearMessages } from '../features/interactions/interactionSlice';
import { sendChatMessage, addUserMessage, clearChat } from '../features/chat/chatSlice';

//  AI Suggested follow-ups shown below form 
const SUGGESTIONS = [
  'Schedule a follow-up meeting in 2 weeks',
  'Send product brochure via email',
  'Add Dr. Sharma to advisory board invite list',
];

//  Sentiment options 
const SENTIMENTS = ['Positive', 'Neutral', 'Negative'];

//  Interaction types 
const INTERACTION_TYPES = ['Meeting', 'Call', 'Email', 'Conference', 'Visit'];

export default function LogInteraction() {
  const dispatch = useDispatch();
  const { loading: formLoading, success, error } = useSelector(s => s.interactions);
  const { messages, loading: chatLoading } = useSelector(s => s.chat);

  //Form State
  const [form, setForm] = useState({
    hcp_name:          '',
    hcp_specialty:     '',
    interaction_type:  'Meeting',
    interaction_date:  new Date().toISOString().split('T')[0],
    interaction_time:  new Date().toTimeString().slice(0, 5),
    attendees:         '',
    topics_discussed:  '',
    materials_shared:  '',
    samples_distributed: '',
    sentiment:         'Neutral',
    outcomes:          '',
    follow_up_notes:   '',
    follow_up_date:    '',
    product_discussed: '',
    notes:             '',
  });

  //  Chat State 
  const [chatInput, setChatInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (success) setTimeout(() => dispatch(clearMessages()), 3000);
  }, [success, dispatch]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  //Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      hcp_name:          form.hcp_name,
      hcp_specialty:     form.hcp_specialty,
      interaction_type:  form.interaction_type.toLowerCase(),
      interaction_date:  form.interaction_date,
      product_discussed: form.product_discussed,
      notes:             `Topics: ${form.topics_discussed} | Outcomes: ${form.outcomes} | Sentiment: ${form.sentiment}`,
      follow_up_date:    form.follow_up_date,
      follow_up_notes:   form.follow_up_notes,
    };
    await dispatch(createInteraction(payload));
  };

  //  Chat Send 
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    dispatch(addUserMessage(msg));
    const result = await dispatch(sendChatMessage({ message: msg, history: messages }));

    // Auto-fill form from AI response if it contains structured data
    if (result.payload?.structured) {
      const text = result.payload.reply;
      // Try to extract HCP name from AI response
      const nameMatch = text.match(/Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (nameMatch) setForm(prev => ({ ...prev, hcp_name: nameMatch[0] }));
      // Extract product
      const prodKeywords = ['Metformin', 'Insulin', 'Aspirin', 'Atorvastatin', 'Lisinopril'];
      prodKeywords.forEach(p => {
        if (text.toLowerCase().includes(p.toLowerCase()))
          setForm(prev => ({ ...prev, product_discussed: p }));
      });
      // Set topics from AI response summary
      if (text.length > 20)
        setForm(prev => ({ ...prev, topics_discussed: prev.topics_discussed || text.slice(0, 120) }));
    }
  };

  const handleChatKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Page Title */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Log HCP Interaction
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill the form manually or describe to the AI assistant on the right
        </p>
      </div>

      
      <div className="flex flex-col lg:flex-row gap-4 items-start">

            {/* LEFT PANEL — Structured Form */}
       
        <div className="w-full lg:w-[58%] bg-white border border-slate-200 rounded-2xl overflow-hidden">

          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">
              Interaction Details
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="px-5 py-5 space-y-4">

            {/* Success / Error */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium">
                ✓ Interaction logged successfully!
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium">
                ✕ {error}
              </div>
            )}

            {/* Row — HCP Name + Interaction Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  HCP Name
                </label>
                <input
                  type="text"
                  name="hcp_name"
                  value={form.hcp_name}
                  onChange={handleChange}
                  required
                  placeholder="Search or select HCP..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Interaction Type
                </label>
                <select
                  name="interaction_type"
                  value={form.interaction_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                  {INTERACTION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row — Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  name="interaction_date"
                  value={form.interaction_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  name="interaction_time"
                  value={form.interaction_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Attendees
              </label>
              <input
                type="text"
                name="attendees"
                value={form.attendees}
                onChange={handleChange}
                placeholder="Enter names or search..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Topics Discussed */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Topics Discussed
              </label>
              <textarea
                name="topics_discussed"
                value={form.topics_discussed}
                onChange={handleChange}
                rows={3}
                placeholder="Enter key discussion points..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
              />
              {/* Voice Note Button */}
              <button
                type="button"
                className="mt-2 flex items-center gap-2 text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
              >
                <span className="text-sm">🎙️</span>
                Summarize from Voice Note (Requires Consent)
              </button>
            </div>

            {/* Product Discussed */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Product Discussed
              </label>
              <input
                type="text"
                name="product_discussed"
                value={form.product_discussed}
                onChange={handleChange}
                placeholder="e.g. Metformin 500mg"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* Materials Shared + Samples */}
            <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600">
                Materials Shared / Samples Distributed
              </p>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Materials Shared</span>
                  <button
                    type="button"
                    className="text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition"
                  >
                    + Search/Add
                  </button>
                </div>
                <input
                  type="text"
                  name="materials_shared"
                  value={form.materials_shared}
                  onChange={handleChange}
                  placeholder="No materials added"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Samples Distributed</span>
                  <button
                    type="button"
                    className="text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition"
                  >
                    + Add Sample
                  </button>
                </div>
                <input
                  type="text"
                  name="samples_distributed"
                  value={form.samples_distributed}
                  onChange={handleChange}
                  placeholder="No samples added"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
                />
              </div>
            </div>

            {/* HCP Sentiment */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Observed / Inferred HCP Sentiment
              </label>
              <div className="flex gap-5">
                {SENTIMENTS.map(s => (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sentiment"
                      value={s}
                      checked={form.sentiment === s}
                      onChange={handleChange}
                      className="accent-indigo-600"
                    />
                    <span className={`text-sm font-medium ${
                      s === 'Positive' ? 'text-green-600' :
                      s === 'Negative' ? 'text-red-500'  : 'text-slate-600'
                    }`}>
                      {s === 'Positive' ? '😊' : s === 'Negative' ? '😐' : '😑'} {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Outcomes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Outcomes
              </label>
              <textarea
                name="outcomes"
                value={form.outcomes}
                onChange={handleChange}
                rows={2}
                placeholder="Key outcomes or agreements..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
              />
            </div>

            {/* Follow-up Actions + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Follow-up Actions
                </label>
                <textarea
                  name="follow_up_notes"
                  value={form.follow_up_notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Enter next steps or tasks..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={form.follow_up_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            </div>

            {/* AI Suggested Follow-ups */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-indigo-700 mb-2">
                ✨ AI Suggested Follow-ups:
              </p>
              <ul className="space-y-1">
                {SUGGESTIONS.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, follow_up_notes: s }))}
                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                    >
                      • {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {formLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                '+ Log Interaction'
              )}
            </button>

          </form>
        </div>

      
            {/* RIGHT PANEL — AI Chat Assistant */}
   
        <div className="w-full lg:w-[42%] bg-white border border-slate-200 rounded-2xl overflow-hidden lg:sticky lg:top-20 flex flex-col min-h-[600px]">

          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-semibold text-slate-700">AI Assistant</p>
                <p className="text-xs text-slate-400">Log interaction via chat</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearChat())}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[420px] max-h-[520px]">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
                Log interaction details here (e.g., "Met Dr. Smith, discussed
                Product X efficacy, positive sentiment, shared brochure") or
                ask for help.
              </div>
            )}

            {/* Chat bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2.5 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="bg-slate-100 px-3 py-2.5 rounded-xl flex gap-1 items-center">
                  <div className="dot w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <div className="dot w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <div className="dot w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick suggestion chips */}
          {messages.length === 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {[
                'Log a visit with Dr. Sharma',
                'Show Dr. Patel profile',
                'Schedule follow-up',
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => setChatInput(s)}
                  className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-slate-100 p-4 flex gap-2 items-end">
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKey}
              rows={2}
              placeholder="Describe interaction..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition"
            />
            <button
              onClick={handleChatSend}
              disabled={chatLoading || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex-shrink-0 flex items-center gap-1"
            >
              <span className="text-xs">🤖</span> Log
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}