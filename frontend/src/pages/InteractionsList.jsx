import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions, deleteInteraction } from '../features/interactions/interactionSlice';

export default function InteractionsList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(s => s.interactions);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editItem, setEditItem]     = useState(null);

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this interaction?')) {
      dispatch(deleteInteraction(id));
    }
  };

  const filtered = list.filter(item => {
    const matchSearch =
      !search ||
      (item.hcp_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.product_discussed || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === 'all' || item.interaction_type === filterType;
    return matchSearch && matchType;
  });

  const typeColors = {
    visit:      'bg-blue-100 text-blue-700',
    call:       'bg-green-100 text-green-700',
    email:      'bg-amber-100 text-amber-700',
    conference: 'bg-purple-100 text-purple-700',
    meeting:    'bg-indigo-100 text-indigo-700',
  };

  const typeIcons = {
    visit:      '🏥',
    call:       '📞',
    email:      '📧',
    conference: '🎤',
    meeting:    '🤝',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            All Interactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading...' : `${filtered.length} of ${list.length} interactions`}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
          ✕ {String(error)}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by doctor, product, notes..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-48"
        >
          <option value="all">All Types</option>
          <option value="visit">Visit</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="conference">Conference</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-11 h-11 bg-slate-100 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-base font-semibold text-slate-600">
            {search ? 'No results found' : 'No interactions yet'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? 'Try a different search term' : 'Log your first HCP interaction'}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-semibold text-sm">
                      {(item.hcp_name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {item.hcp_name}
                    </p>
                    {item.hcp_specialty && (
                      <p className="text-xs text-slate-400">{item.hcp_specialty}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${typeColors[item.interaction_type] || 'bg-slate-100 text-slate-600'}`}>
                  {typeIcons[item.interaction_type] || '📌'} {item.interaction_type}
                </span>
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap gap-2 mb-3">
                {item.product_discussed && (
                  <span className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                    💊 {item.product_discussed}
                  </span>
                )}
                {item.interaction_date && (
                  <span className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                    📅 {item.interaction_date}
                  </span>
                )}
                {item.follow_up_date && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                    🔔 Follow-up: {item.follow_up_date}
                  </span>
                )}
              </div>

              {/* AI Summary */}
              {item.ai_summary && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">
                    AI Summary
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.ai_summary}
                  </p>
                </div>
              )}

              {/* Notes fallback */}
              {!item.ai_summary && item.notes && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {item.notes}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400">
                  ID #{item.id}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setEditItem(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                Edit Interaction #{editItem.id}
              </h2>
              <button
                onClick={() => setEditItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-500 text-center py-4">
              Use the AI Chat to edit: <br />
              <span className="text-indigo-600 font-medium">
                "Edit interaction ID {editItem.id}, update notes to: your new notes"
              </span>
            </p>
            <button
              onClick={() => setEditItem(null)}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}