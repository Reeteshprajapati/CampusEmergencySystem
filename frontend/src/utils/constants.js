export const ROLES = {
  STUDENT: 'STUDENT',
  SECURITY_OFFICER: 'SECURITY_OFFICER',
  ADMIN: 'ADMIN',
};

export const INCIDENT_TYPES = [
  { id: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: 'HeartPulse', color: 'red' },
  { id: 'FIRE', label: 'Fire Hazard', icon: 'Flame', color: 'orange' },
  { id: 'HARASSMENT', label: 'Harassment', icon: 'UserX', color: 'purple' },
  { id: 'ACCIDENT', label: 'Accident', icon: 'AlertTriangle', color: 'amber' },
  { id: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity', icon: 'Eye', color: 'indigo' },
  { id: 'THEFT', label: 'Theft / Robbery', icon: 'ShieldAlert', color: 'blue' },
  { id: 'INFRASTRUCTURE_HAZARD', label: 'Infrastructure Hazard', icon: 'Wrench', color: 'slate' },
  { id: 'OTHER', label: 'Other Emergency', icon: 'HelpCircle', color: 'gray' },
];

export const SEVERITIES = [
  { id: 'LOW', label: 'Low', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'MEDIUM', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'HIGH', label: 'High', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300 font-bold pulse-emergency' },
];

export const INCIDENT_STATUSES = [
  { id: 'REPORTED', label: 'Reported', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'ACKNOWLEDGED', label: 'Acknowledged', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'ASSIGNED', label: 'Officer Assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'CLOSED', label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-50 text-rose-600 border-rose-200' },
];
