import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { incidentService } from '../../services/incidentService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/FormControls';
import { StatusTimeline } from '../../components/incidents/StatusTimeline';
import { StatusUpdateModal, AssignOfficerModal } from '../../components/incidents/IncidentModals';
import { formatDate } from '../../utils/formatters';
import {
  ShieldAlert,
  MapPin,
  Clock,
  User,
  Shield,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Lock,
  UserCheck,
  Play,
  ShieldCheck,
} from 'lucide-react';

export const IncidentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [incident, setIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);

  const fetchIncidentDetails = useCallback(async () => {
    try {
      const incRes = await incidentService.getIncidentById(id);
      setIncident(incRes?.data || incRes);

      const histRes = await incidentService.getIncidentHistory(id);
      setHistory(Array.isArray(histRes) ? histRes : (histRes?.data || []));
    } catch (err) {
      showToast(err.toString(), 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchIncidentDetails();
    if (user?.role === 'SECURITY_OFFICER' || user?.role === 'ADMIN') {
      userService.getOfficers().then((res) => setOfficers(Array.isArray(res) ? res : (res?.data || [])));
    }
  }, [fetchIncidentDetails, user]);

  const handleAcknowledge = async () => {
    try {
      await incidentService.updateStatus(id, {
        status: 'ACKNOWLEDGED',
        remarks: 'Acknowledged by security officer',
      });
      showToast('Incident acknowledged', 'success');
      fetchIncidentDetails();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleAssignSubmit = async (data) => {
    try {
      await incidentService.assignOfficer(id, data);
      showToast('Officer assigned successfully', 'success');
      fetchIncidentDetails();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleStatusSubmit = async (data) => {
    try {
      await incidentService.updateStatus(id, data);
      showToast(`Status updated to ${data.status}`, 'success');
      fetchIncidentDetails();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  if (loading) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (!incident) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Incident Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const isStaff = user?.role === 'SECURITY_OFFICER' || user?.role === 'ADMIN';
  const isAssignedToMe = incident.assignedOfficer?.id === user?.id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          {isStaff && incident.status === 'REPORTED' && (
            <Button size="sm" variant="primary" icon={ShieldCheck} onClick={handleAcknowledge}>
              Acknowledge Alert
            </Button>
          )}

          {isStaff && ['REPORTED', 'ACKNOWLEDGED'].includes(incident.status) && (
            <Button size="sm" variant="secondary" icon={UserCheck} onClick={() => setAssignModalOpen(true)}>
              Assign Officer
            </Button>
          )}

          {isStaff && ['ACKNOWLEDGED', 'ASSIGNED'].includes(incident.status) && (
            <Button
              size="sm"
              variant="primary"
              icon={Play}
              onClick={() => {
                setTargetStatus('IN_PROGRESS');
                setStatusModalOpen(true);
              }}
            >
              Start Response
            </Button>
          )}

          {isStaff && incident.status === 'IN_PROGRESS' && (isAssignedToMe || user?.role === 'ADMIN') && (
            <Button
              size="sm"
              variant="success"
              icon={CheckCircle2}
              onClick={() => {
                setTargetStatus('RESOLVED');
                setStatusModalOpen(true);
              }}
            >
              Resolve Incident
            </Button>
          )}

          {user?.role === 'ADMIN' && incident.status === 'RESOLVED' && (
            <Button
              size="sm"
              variant="secondary"
              icon={Lock}
              onClick={() => {
                setTargetStatus('CLOSED');
                setStatusModalOpen(true);
              }}
            >
              Close Incident
            </Button>
          )}
        </div>
      </div>

      {/* Header Overview Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-extrabold text-2xl text-slate-900">
              {incident.incidentNumber}
            </span>
            <Badge variant="severity">{incident.severity}</Badge>
            <Badge variant="status">{incident.status}</Badge>
          </div>
          <h2 className="text-base font-bold text-slate-700 mt-2">
            {incident.type?.replace(/_/g, ' ')} &bull; {incident.location?.building || 'Campus Location'}
          </h2>
        </div>

        <div className="text-right text-xs text-slate-500 font-mono">
          <p>Reported: {formatDate(incident.createdAt)}</p>
          <p className="mt-0.5">Last Updated: {formatDate(incident.updatedAt)}</p>
        </div>
      </div>

      {/* Grid Layout: Left Info & Notes | Right Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <Card title="Emergency Alert Information">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Incident Type
                </span>
                <Badge variant="type">{incident.type}</Badge>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Severity Level
                </span>
                <Badge variant="severity">{incident.severity}</Badge>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Current Status
                </span>
                <Badge variant="status">{incident.status}</Badge>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Reported By
                </span>
                <p className="font-bold text-slate-800">{incident.reportedBy?.fullName || 'Anonymous'}</p>
                <p className="text-slate-400">{incident.reportedBy?.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Assigned Officer
                </span>
                <p className="font-bold text-slate-800">
                  {incident.assignedOfficer?.fullName || 'Not Assigned'}
                </p>
                <p className="text-slate-400">{incident.assignedOfficer?.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Campus Location
                </span>
                <p className="font-bold text-slate-800">
                  {incident.location?.building || 'Campus Area'}
                </p>
                <p className="text-slate-400">{incident.location?.room || incident.location?.area}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Reporter's Description
              </span>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {incident.description}
              </p>
            </div>

            {incident.latitude && (
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Captured Geolocation: {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</span>
              </div>
            )}
          </Card>

          {/* Response Notes Card */}
          <Card title="Security Patrol & Resolution Notes" subtitle="Internal notes logged by responding officers and administrators">
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Responding Officer Notes:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed min-h-[48px]">
                  {incident.officerNotes || 'No officer response notes logged yet.'}
                </p>
              </div>

              {incident.resolutionSummary && (
                <div>
                  <span className="font-bold text-emerald-700 block mb-1">Final Resolution Summary:</span>
                  <p className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed font-medium">
                    {incident.resolutionSummary}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline History */}
        <div>
          <Card title="Incident Audit Timeline" subtitle="Chronological history of status updates">
            <StatusTimeline history={history} />
          </Card>
        </div>
      </div>

      {/* Modals */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        incident={incident}
        targetStatus={targetStatus}
        onSubmit={handleStatusSubmit}
      />

      <AssignOfficerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incident={incident}
        officers={officers}
        onSubmit={handleAssignSubmit}
      />
    </div>
  );
};
