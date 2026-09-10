import React, { useState, useEffect } from 'react';
import { incidentService } from '../../services/incidentService';
import { StatCard } from '../../components/dashboard/StatCard';
import {
  CategoryChart,
  SeverityChart,
  LocationChart,
  OfficerPerformanceChart,
} from '../../components/dashboard/IncidentCharts';
import { Spinner } from '../../components/ui/FormControls';
import { ShieldAlert, AlertTriangle, CheckCircle2, LayoutDashboard } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentService.getDashboardStats().then((res) => {
      setStats(res?.data || res);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            System Administration
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-purple-400" /> Executive Analytics & Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, category trends, location distribution, and officer metrics.
          </p>
        </div>
      </div>

      {/* Requirement #7: Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={stats?.totalIncidents || 0}
          icon={ShieldAlert}
          color="blue"
          subtitle="All recorded emergency reports"
        />

        <StatCard
          title="Active Incidents"
          value={stats?.activeIncidents || 0}
          icon={AlertTriangle}
          color="amber"
          subtitle="Reported, Acknowledged & In Progress"
        />

        <StatCard
          title="Critical Incidents"
          value={stats?.criticalIncidents || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Immediate emergency intervention"
        />

        <StatCard
          title="Resolved Today"
          value={stats?.resolvedToday || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Incidents resolved in last 24 hours"
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={stats?.categoryDistribution || []} />
        <SeverityChart data={stats?.severityDistribution || []} />
        <LocationChart data={stats?.locationDistribution || []} />
        <OfficerPerformanceChart data={stats?.officerPerformance || []} />
      </div>
    </div>
  );
};
