import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions } from '../features/interactions/interactionSlice';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.interactions);

  useEffect(() => { dispatch(fetchInteractions()); }, [dispatch]);

  const total      = list.length;
  const visits     = list.filter(i => i.interaction_type === 'visit').length;
  const calls      = list.filter(i => i.interaction_type === 'call').length;
  const followUps  = list.filter(i => i.follow_up_date).length;
  const recent     = list.slice(0, 3);

  const stats = [
    { label: 'Total Interactions', value: total,     color: 'bg-primary-50  text-primary-700',  border: 'border-primary-100'  },
    { label: 'In-Person Visits',   value: visits,    color: 'bg-blue-50     text-blue-700',     border: 'border-blue-100'     },
    { label: 'Phone Calls',        value: calls,     color: 'bg-green-50    text-green-700',    border: 'border-green-100'    },
    { label: 'Follow-ups Pending', value: followUps, color: 'bg-amber-50    text-amber-700',    border: 'border-amber-100'    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Good morning, Sales Rep 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's your HCP interaction overview
          </p>
        </div>
        <Link
          to="/log"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          + Log Interaction
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${s.color} border ${s.border} rounded-2xl p-4 sm:p-5`}>
            <p className="text-2xl sm:text-3xl font-bold">{loading ? '—' : s.value}</p>
            <p className="text-xs sm:text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: '/log',    icon: '✍️', title: 'Log Interaction',  desc: 'Form or AI chat'        },
            { to: '/log',    icon: '🤖', title: 'Ask AI Agent',     desc: '5 tools available'      },
            { to: '/interactions', icon: '📋', title: 'View All',   desc: 'Search & manage HCPs'   },
          ].map((a, i) => (
            <Link
              key={i} to={a.to}
              className="bg-white border border-slate-100 hover:border-primary-200 hover:shadow-sm rounded-2xl p-4 flex items-center gap-4 transition-all group"
            >
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">
                  {a.title}
                </p>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Interactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">Recent Interactions</h2>
          <Link to="/interactions" className="text-xs text-primary-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium text-slate-600">No interactions yet</p>
            <p className="text-xs text-slate-400 mt-1">Start by logging your first HCP interaction</p>
            <Link to="/log" className="inline-block mt-4 text-sm text-primary-600 font-semibold hover:underline">
              Log now →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(item => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {item.hcp_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800">{item.hcp_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.interaction_type} · {item.product_discussed || 'No product'} · {item.interaction_date || 'No date'}
                  </p>
                  {item.ai_summary && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.ai_summary}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}