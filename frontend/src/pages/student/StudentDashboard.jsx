import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { incidentService } from '../../services/incidentService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import { ShieldAlert, PlusCircle, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentService.getIncidents({ page: 0, size: 5 }).then((res) => {
      const pageData = res?.data || res;
      setRecentIncidents(pageData?.content || (Array.isArray(pageData) ? pageData : []));
      setLoading(false);
    });
  }, []);

  const totalReported = recentIncidents.length;
  const activeCount = recentIncidents.filter((i) =>
    ['REPORTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS'].includes(i.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Prominent Safety Callout Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-red-600/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Student Safety Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Campus Emergency Response
          </h1>
          <p className="text-sm text-red-100 mt-1 max-w-xl leading-relaxed">
            Need urgent assistance or witnessing an emergency on campus? Send an instant alert directly to active security officers on duty.
          </p>
        </div>

        <Link to="/student/report-emergency">
          <Button variant="danger" size="lg" className="py-3.5 px-6 text-sm font-bold shadow-lg shadow-red-950/20">
            <ShieldAlert className="w-5 h-5 mr-2" /> Report Emergency Now
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Alerts</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeCount}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Reports</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalReported}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Resolved</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {recentIncidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length}
            </h3>
          </div>
        </Card>
      </div>

      {/* My Recent Reports */}
      <Card
        title="My Recent Emergency Reports"
        action={
          <Link to="/student/my-incidents" className="text-xs font-bold text-blue-600 hover:underline">
            View All Reports →
          </Link>
        }
      >
        <div className="divide-y divide-slate-100">
          {recentIncidents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              You have not submitted any emergency alerts yet.
            </div>
          ) : (
            recentIncidents.map((incident) => (
              <div key={incident.id} className="py-3.5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/incidents/${incident.id}`} className="font-bold text-sm text-blue-600 hover:underline">
                      {incident.incidentNumber}
                    </Link>
                    <Badge variant="severity">{incident.severity}</Badge>
                    <Badge variant="status">{incident.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-1">{incident.description}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {formatDate(incident.createdAt)} &bull; Location:{' '}
                    {incident.location?.building || 'Campus Area'}
                  </p>
                </div>

                <Link to={`/incidents/${incident.id}`}>
                  <Button size="sm" variant="outline">
                    View Status
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
