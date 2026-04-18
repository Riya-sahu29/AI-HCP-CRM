
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createInteraction, clearMessages } from '../features/interactions/interactionSlice';

const initialState = {
  hcp_name:         '',
  hcp_specialty:    '',
  interaction_type: 'visit',
  product_discussed:'',
  notes:            '',
  interaction_date: '', 
  follow_up_date:   '',
  follow_up_notes:  '',
};

export default function LogForm() {
  const dispatch          = useDispatch();
  const { loading, success, error } = useSelector(s => s.interactions);
  const [form, setForm]   = useState(initialState);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createInteraction(form));
    setForm(initialState);
    setTimeout(() => dispatch(clearMessages()), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Success / Error Banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✕ {error}
        </div>
      )}

      {/* Row 1 - HCP Name + Specialty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Doctor / HCP Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="hcp_name"
            value={form.hcp_name}
            onChange={handleChange}
            required
            placeholder="Dr. Rajesh Sharma"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Specialty
          </label>
          <input
            type="text"
            name="hcp_specialty"
            value={form.hcp_specialty}
            onChange={handleChange}
            placeholder="Cardiologist"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Row 2 - Interaction Type + Product */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Interaction Type
          </label>
          <select
            name="interaction_type"
            value={form.interaction_type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
          >
            <option value="visit">In-Person Visit</option>
            <option value="call">Phone Call</option>
            <option value="email">Email</option>
            <option value="conference">Conference</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Product Discussed
          </label>
          <input
            type="text"
            name="product_discussed"
            value={form.product_discussed}
            onChange={handleChange}
            placeholder="Metformin 500mg"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Row 3 - Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Interaction Date
          </label>
          <input
            type="date"
            name="interaction_date"
            value={form.interaction_date}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Follow-up Date
          </label>
          <input
            type="date"
            name="follow_up_date"
            value={form.follow_up_date}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Meeting Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Discussed Metformin efficacy with Dr. Sharma. Doctor showed interest in the new dosage form..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Follow-up Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Follow-up Action Notes
        </label>
        <textarea
          name="follow_up_notes"
          value={form.follow_up_notes}
          onChange={handleChange}
          rows={2}
          placeholder="Send product brochure and samples..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </>
        ) : (
          '+ Log Interaction'
        )}
      </button>
    </form>
  );
}