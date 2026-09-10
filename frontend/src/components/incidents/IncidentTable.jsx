import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatters';
import { Eye, ShieldCheck, UserCheck, Play, CheckCircle, Lock, XCircle } from 'lucide-react';

export const IncidentTable = ({
  incidents = [],
  userRole,
  userId,
  onAcknowledge,
  onOpenAssign,
  onOpenStatusUpdate,
  onCancel,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-3.5">Incident ID</th>
            <th className="px-4 py-3.5">Type</th>
            <th className="px-4 py-3.5">Severity</th>
            <th className="px-4 py-3.5">Location</th>
            <th className="px-4 py-3.5">Reported By</th>
            <th className="px-4 py-3.5">Assigned Officer</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5">Reported At</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
          {incidents.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-14 text-center text-slate-400 font-medium">
                <div className="max-w-xs mx-auto space-y-1">
                  <p className="text-sm font-semibold text-slate-700">No Incidents Found</p>
                  <p className="text-xs text-slate-400">No emergency reports match the selected filters.</p>
                </div>
              </td>
            </tr>
          ) : (
            incidents.map((incident) => {
              const isReported = incident.status === 'REPORTED';
              const isAck = incident.status === 'ACKNOWLEDGED';
              const isAssigned = incident.status === 'ASSIGNED';
              const isInProgress = incident.status === 'IN_PROGRESS';
              const isResolved = incident.status === 'RESOLVED';
              const isClosed = incident.status === 'CLOSED';

              const isAssignedToMe = incident.assignedOfficer?.id === userId;
              const isReporterMe = incident.reportedBy?.id === userId;
              const isStaff = userRole === 'SECURITY_OFFICER' || userRole === 'ADMIN';

              return (
                <tr key={incident.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <Link to={`/incidents/${incident.id}`} className="text-blue-600 hover:underline">
                      {incident.incidentNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="type">{incident.type}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="severity">{incident.severity}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">
                      {incident.location?.building || 'Campus Area'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {incident.location?.room || incident.location?.area || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{incident.reportedBy?.fullName || 'Anonymous'}</div>
                    <div className="text-[11px] text-slate-400">{incident.reportedBy?.phone}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {incident.assignedOfficer ? (
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{incident.assignedOfficer.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="status">{incident.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                    {formatDate(incident.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/incidents/${incident.id}`}>
                        <Button size="sm" variant="outline" icon={Eye}>
                          View
                        </Button>
                      </Link>

                      {/* Staff Actions */}
                      {isStaff && isReported && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={ShieldCheck}
                          onClick={() => onAcknowledge && onAcknowledge(incident.id)}
                        >
                          Acknowledge
                        </Button>
                      )}

                      {isStaff && (isReported || isAck) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={UserCheck}
                          onClick={() => onOpenAssign && onOpenAssign(incident)}
                        >
                          Assign
                        </Button>
                      )}

                      {isStaff && (isAck || isAssigned) && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Play}
                          onClick={() =>
                            onOpenStatusUpdate && onOpenStatusUpdate(incident, 'IN_PROGRESS')
                          }
                        >
                          Start Response
                        </Button>
                      )}

                      {isStaff && isInProgress && (isAssignedToMe || userRole === 'ADMIN') && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle}
                          onClick={() =>
                            onOpenStatusUpdate && onOpenStatusUpdate(incident, 'RESOLVED')
                          }
                        >
                          Resolve
                        </Button>
                      )}

                      {userRole === 'ADMIN' && isResolved && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Lock}
                          onClick={() =>
                            onOpenStatusUpdate && onOpenStatusUpdate(incident, 'CLOSED')
                          }
                        >
                          Close
                        </Button>
                      )}

                      {/* Student Actions */}
                      {userRole === 'STUDENT' && isReporterMe && (isReported || isAck) && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={XCircle}
                          onClick={() => onCancel && onCancel(incident.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
