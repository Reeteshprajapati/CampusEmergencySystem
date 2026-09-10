import React, { useState, useEffect } from 'react';
import { incidentService } from '../../services/incidentService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/FormControls';
import { FileText, Download, Printer } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentService.getDashboardStats().then((res) => {
      setStats(res?.data || res);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Campus Safety Compliance Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generated safety metrics report for campus administration.</p>
        </div>
        <Button variant="outline" icon={Printer} onClick={handlePrint}>
          Print Executive Summary
        </Button>
      </div>

      <Card title="Executive Safety Metrics Summary">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Reported</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalIncidents}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Currently Active</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.activeIncidents}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Critical Emergencies</span>
            <p className="text-2xl font-extrabold text-red-600 mt-1">{stats?.criticalIncidents}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Resolved Today</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.resolvedToday}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Incident Type Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(stats?.categoryDistribution || []).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800">{cat.name?.replace(/_/g, ' ')}</span>
                <span className="font-mono font-bold text-blue-600">{cat.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure polling intervals, security thresholds, and system preferences.</p>
      </div>

      <Card title="Polling & Real-Time Configuration">
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Security Dashboard Polling Interval</p>
              <p className="text-slate-500 mt-0.5">REST API auto-refresh interval for active incidents</p>
            </div>
            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              5 Seconds
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Notification Badge Polling</p>
              <p className="text-slate-500 mt-0.5">Unread alert count refresh interval</p>
            </div>
            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              5 Seconds
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Persistent Socket Connections (WebSockets / SSE / Firebase)</p>
              <p className="text-slate-500 mt-0.5">Architectural protocol constraint enforcement</p>
            </div>
            <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
              DISABLED ❌ (REST Polling Enabled)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
