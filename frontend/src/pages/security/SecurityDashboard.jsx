import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePolling } from '../../hooks/usePolling';
import { incidentService } from '../../services/incidentService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { StatusUpdateModal, AssignOfficerModal } from '../../components/incidents/IncidentModals';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldAlert, RefreshCw, AlertTriangle, UserCheck } from 'lucide-react';

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeIncidents, setActiveIncidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPolled, setLastPolled] = useState(new Date());

  // Modal States
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);

  // Polling function for active incidents every 5 seconds (Requirement #5)
  const fetchActiveIncidents = useCallback(async () => {
    try {
      const res = await incidentService.getActiveIncidents();
      setActiveIncidents(Array.isArray(res) ? res : (res?.data || []));
      setLastPolled(new Date());
    } catch (err) {
      console.error('Failed to poll active incidents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook handles setInterval + clean unmount
  usePolling(fetchActiveIncidents, 5000, true);

  useEffect(() => {
    userService.getOfficers().then((res) => setOfficers(Array.isArray(res) ? res : (res?.data || [])));
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await incidentService.updateStatus(id, {
        status: 'ACKNOWLEDGED',
        remarks: 'Security officer acknowledged emergency alert',
      });
      showToast('Incident acknowledged successfully', 'success');
      fetchActiveIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleOpenAssign = (incident) => {
    setSelectedIncident(incident);
    setAssignModalOpen(true);
  };

  const handleOpenStatusUpdate = (incident, status) => {
    setSelectedIncident(incident);
    setTargetStatus(status);
    setStatusModalOpen(true);
  };

  const handleAssignSubmit = async (assignmentData) => {
    if (!selectedIncident) return;
    try {
      await incidentService.assignOfficer(selectedIncident.id, assignmentData);
      showToast('Officer assigned successfully', 'success');
      fetchActiveIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleStatusSubmit = async (statusData) => {
    if (!selectedIncident) return;
    try {
      await incidentService.updateStatus(selectedIncident.id, statusData);
      showToast(`Incident status updated to ${statusData.status}`, 'success');
      fetchActiveIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;
  const unassignedCount = activeIncidents.filter((i) => !i.assignedOfficer).length;

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Active Duty Command Center
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">
            Security Control & Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live REST polling active (5s auto-refresh) &bull; Last updated:{' '}
            <span className="font-mono text-white">{lastPolled.toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchActiveIncidents}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-300 transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold border border-slate-700/60"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Critical Alert Bar if Critical incidents exist */}
      {criticalCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl shadow-lg flex items-center justify-between pulse-emergency">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-extrabold text-sm uppercase tracking-wider">
                Critical Priority Emergency Active ({criticalCount})
              </p>
              <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
                Immediate patrol intervention required. High severity alert logged on campus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Incidents</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeIncidents.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Critical Priority</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Assignment</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{unassignedCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <UserCheck className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Active Incidents Table */}
      <Card title="Active Emergency Incidents (Sorted by Priority)">
        <IncidentTable
          incidents={activeIncidents}
          userRole={user?.role}
          userId={user?.id}
          onAcknowledge={handleAcknowledge}
          onOpenAssign={handleOpenAssign}
          onOpenStatusUpdate={handleOpenStatusUpdate}
        />
      </Card>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        incident={selectedIncident}
        targetStatus={targetStatus}
        onSubmit={handleStatusSubmit}
      />

      {/* Officer Assignment Modal */}
      <AssignOfficerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incident={selectedIncident}
        officers={officers}
        onSubmit={handleAssignSubmit}
      />
    </div>
  );
};
