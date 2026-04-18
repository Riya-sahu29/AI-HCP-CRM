import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions } from '../features/interactions/interactionSlice';
import { sendChatMessage, addUserMessage } from '../features/chat/chatSlice';

export default function HCPProfile() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.interactions);
  const { messages, loading: chatLoading } = useSelector(s => s.chat);

  const [searchName, setSearchName] = useState('');
  const [selectedHCP, setSelectedHCP] = useState(null);

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  // Get unique HCP names
  const uniqueHCPs = [...new Set(list.map(i => i.hcp_name).filter(Boolean))];

  // Filter HCPs by search
  const filteredHCPs = uniqueHCPs.filter(name =>
    name.toLowerCase().includes(searchName.toLowerCase())
  );

  // Get interactions for selected HCP
  const hcpInteractions = selectedHCP
    ? list.filter(i => i.hcp_name === selectedHCP)
    : [];

  // Stats for selected HCP
  const totalVisits    = hcpInteractions.filter(i => i.interaction_type === 'visit').length;
  const totalMeetings  = hcpInteractions.filter(i => i.interaction_type === 'meeting').length;
  const totalCalls     = hcpInteractions.filter(i => i.interaction_type === 'call').length;
  const products       = [...new Set(hcpInteractions.map(i => i.product_discussed).filter(Boolean))];
  const lastInteraction= hcpInteractions[0];
  const specialty      = hcpInteractions.find(i => i.hcp_specialty)?.hcp_specialty || 'Not specified';

  const typeColors = {
    visit:      'bg-blue-100 text-blue-700',
    call:       'bg-green-100 text-green-700',
    email:      'bg-amber-100 text-amber-700',
    conference: 'bg-purple-100 text-purple-700',
    meeting:    'bg-indigo-100 text-indigo-700',
  };

  const handleAskAI = async () => {
    if (!selectedHCP) return;
    const msg = `Show me the complete profile of ${selectedHCP}`;
    dispatch(addUserMessage(msg));
    await dispatch(sendChatMessage({ message: msg, history: messages }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          HCP Profiles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View complete interaction history for each Healthcare Professional
        </p>
      </div>

      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* LEFT — HCP List */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <input
                type="text"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                placeholder="Search doctor..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* HCP List */}
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {loading && (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-slate-100 rounded w-2/3 mb-1.5"></div>
                        <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredHCPs.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-3xl mb-2">👤</p>
                  <p className="text-xs text-slate-400">No HCPs found</p>
                </div>
              )}

              {!loading && filteredHCPs.map(name => {
                const hcpList = list.filter(i => i.hcp_name === name);
                const spec    = hcpList.find(i => i.hcp_specialty)?.hcp_specialty;
                const count   = hcpList.length;
                const isSelected = selectedHCP === name;

                return (
                  <button
                    key={name}
                    onClick={() => setSelectedHCP(name)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-l-2 border-indigo-500'
                        : 'hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isSelected ? 'text-indigo-700' : 'text-slate-700'
                      }`}>
                        {name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {spec || 'No specialty'} · {count} interaction{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — HCP Detail */}
        <div className="flex-1">

          {/* No HCP Selected */}
          {!selectedHCP && (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
              <p className="text-5xl mb-4">👨‍⚕️</p>
              <p className="text-base font-semibold text-slate-600">
                Select an HCP
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Click any doctor from the left to view their full profile
              </p>
            </div>
          )}

          {/* HCP Profile Detail */}
          {selectedHCP && (
            <div className="space-y-4">

              {/* Profile Header Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xl">
                        {selectedHCP.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {selectedHCP}
                      </h2>
                      <p className="text-sm text-slate-500">{specialty}</p>
                      {lastInteraction?.follow_up_date && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full border border-amber-100 mt-1.5">
                          🔔 Follow-up: {lastInteraction.follow_up_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ask AI Button */}
                  <button
                    onClick={handleAskAI}
                    disabled={chatLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
                  >
                    {chatLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      '🤖 Ask AI About This HCP'
                    )}
                  </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: 'Total Interactions', value: hcpInteractions.length, color: 'text-indigo-600' },
                    { label: 'Visits',             value: totalVisits,            color: 'text-blue-600'   },
                    { label: 'Meetings',           value: totalMeetings,          color: 'text-green-600'  },
                    { label: 'Calls',              value: totalCalls,             color: 'text-amber-600'  },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Products Discussed */}
                {products.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Products Discussed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {products.map((p, i) => (
                        <span
                          key={i}
                          className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full"
                        >
                          💊 {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Response */}
              {messages.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-indigo-700 mb-2">
                    🤖 AI Analysis
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {messages[messages.length - 1]?.content || ''}
                  </p>
                </div>
              )}

              {/* Interaction History */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Interaction History ({hcpInteractions.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-50">
                  {hcpInteractions.map((item, i) => (
                    <div key={item.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            typeColors[item.interaction_type] || 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.interaction_type}
                          </span>
                          {item.product_discussed && (
                            <span className="text-xs text-slate-500">
                              💊 {item.product_discussed}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {item.interaction_date || 'No date'}
                        </span>
                      </div>

                      {/* AI Summary */}
                      {item.ai_summary && (
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          {item.ai_summary}
                        </p>
                      )}

                      {/* Notes */}
                      {!item.ai_summary && item.notes && (
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">
                          {item.notes}
                        </p>
                      )}

                      {/* Follow-up */}
                      {item.follow_up_date && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                          <p className="text-xs text-amber-700">
                            🔔 Follow-up on {item.follow_up_date}
                            {item.follow_up_notes && ` — ${item.follow_up_notes}`}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-slate-300 mt-2">ID #{item.id}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}