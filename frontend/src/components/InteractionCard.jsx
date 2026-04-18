import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions, deleteInteraction } from '../features/interactions/interactionSlice';
import InteractionCard from '../components/InteractionCard';
import EditModal from './EditModal';

export default function InteractionsList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.interactions);

  const [search,     setSearch]   = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editItem,   setEditItem]  = useState(null);

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
      item.hcp_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.product_discussed?.toLowerCase().includes(search.toLowerCase()) ||
      item.notes?.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === 'all' || item.interaction_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            All Interactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} of {list.length} interactions
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by doctor, product, notes..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition bg-white"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition sm:w-48"
        >
          <option value="all">All Types</option>
          <option value="visit">Visit</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="conference">Conference</option>
        </select>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse"
            >
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
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-base font-semibold text-slate-600">
            No interactions found
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {search
              ? 'Try a different search term'
              : 'Log your first HCP interaction'}
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <InteractionCard
              key={item.id}
              interaction={item}
              onEdit={setEditItem}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal — shows only when editItem is set */}
      {editItem && (
        <EditModal
          interaction={editItem}
          onClose={() => setEditItem(null)}
        />
      )}

    </div>
  );
}