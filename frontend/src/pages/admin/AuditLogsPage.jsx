import React, { useState, useEffect } from 'react';
import { auditLogService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/FormControls';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../utils/formatters';
import { Scroll, User, Clock } from 'lucide-react';

export const AuditLogsPage = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    auditLogService
      .getAuditLogs({ page, size: 15 })
      .then((res) => {
        const pageData = res?.data || res;
        setLogs(pageData?.content || (Array.isArray(pageData) ? pageData : []));
        setTotalPages(pageData?.totalPages || 0);
      })
      .catch((err) => showToast(err.toString(), 'error'))
      .finally(() => setLoading(false));
  }, [page, showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Scroll className="w-6 h-6 text-purple-600" /> System Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">Complete security audit trial of user actions, status changes, and assignments.</p>
      </div>

      <Card className="p-0 border-slate-200">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Performed By</th>
                    <th className="px-4 py-3.5">Entity</th>
                    <th className="px-4 py-3.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 font-bold rounded-lg font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {log.user ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.user.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {log.entityType} #{log.entityId}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};
