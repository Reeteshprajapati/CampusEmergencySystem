import { INCIDENT_STATUSES, SEVERITIES } from './constants';

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeStyle = (status) => {
  const match = INCIDENT_STATUSES.find((s) => s.id === status);
  return match ? match.color : 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getSeverityBadgeStyle = (severity) => {
  const match = SEVERITIES.find((s) => s.id === severity);
  return match ? match.color : 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getIncidentTypeLabel = (type) => {
  if (!type) return 'Emergency';
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
