import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateInteraction, clearMessages } from '../features/interactions/interactionSlice';

export default function EditModal({ interaction, onClose }) {
  const dispatch        = useDispatch();
  const { loading }     = useSelector(s => s.interactions);
  const [form, setForm] = useState({
    hcp_name:          '',
    hcp_specialty:     '',
    interaction_type:  'visit',
    product_discussed: '',
    notes:             '', 
    interaction_date:  '', 
    follow_up_date:    '',
    follow_up_notes:   '',
  });

  useEffect(() => {
    if (interaction) {
      setForm({
        hcp_name:          interaction.hcp_name          || '',
        hcp_specialty:     interaction.hcp_specialty      || '',
        interaction_type:  interaction.interaction_type   || 'visit',
        product_discussed: interaction.product_discussed  || '',
        notes:             interaction.notes              || '',
        interaction_date:  interaction.interaction_date   || '',
        follow_up_date:    interaction.follow_up_date     || '',
        follow_up_notes:   interaction.follow_up_notes    || '',
      });
    }
  }, [interaction]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateInteraction({ id: interaction.id, data: form }));
    setTimeout(() => dispatch(clearMessages()), 2000);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800 text-base">Edit Interaction</h2>
            <p className="text-xs text-slate-400 mt-0.5">ID #{interaction?.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                HCP Name
              </label>
              <input
                type="text"
                name="hcp_name"
                value={form.hcp_name}
                onChange={handleChange}
                placeholder="Dr. Sharma"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Specialty
              </label>
              <input
                type="text"
                name="hcp_specialty"
                value={form.hcp_specialty}
                onChange={handleChange}
                placeholder="Cardiologist"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Interaction Type
              </label>
              <select
                name="interaction_type"
                value={form.interaction_type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              >
                <option value="visit">In-Person Visit</option>
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="conference">Conference</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Product Discussed
              </label>
              <input
                type="text"
                name="product_discussed"
                value={form.product_discussed}
                onChange={handleChange}
                placeholder="Metformin 500mg"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
          </div>

          {/* Row 3 - Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Interaction Date
              </label>
              <input
                type="date"
                name="interaction_date"
                value={form.interaction_date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Follow-up Date
              </label>
              <input
                type="date"
                name="follow_up_date"
                value={form.follow_up_date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Meeting Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Update meeting notes here..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none"
            />
          </div>

          {/* Follow-up Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Follow-up Notes
            </label>
            <textarea
              name="follow_up_notes"
              value={form.follow_up_notes}
              onChange={handleChange}
              rows={2}
              placeholder="What to discuss next time..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

