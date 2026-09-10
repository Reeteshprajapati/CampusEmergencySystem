import React from 'react';
import { formatTime, formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Clock, User } from 'lucide-react';

export const StatusTimeline = ({ history = [] }) => {
  if (history.length === 0) {
    return <div className="text-xs text-slate-400 py-4 italic">No timeline history recorded yet.</div>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white border-4 border-white flex items-center justify-center shadow-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-blue-700">
                  {formatTime(item.createdAt)}
                </span>
                <Badge variant="status">{item.newStatus}</Badge>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {formatDate(item.createdAt)}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-800 pt-1 leading-relaxed">
              {item.remarks || `Incident status updated to ${item.newStatus}`}
            </p>

            {item.changedBy && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Updated by: <strong className="text-slate-700">{item.changedBy.fullName}</strong> ({item.changedBy.role?.replace('_', ' ')})</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
