import React from 'react';
import { getStatusBadgeStyle, getSeverityBadgeStyle, getIncidentTypeLabel } from '../../utils/formatters';

export const Badge = ({ children, variant = 'status', type }) => {
  let styleClass = 'bg-gray-100 text-gray-800 border-gray-200';

  if (variant === 'status') {
    styleClass = getStatusBadgeStyle(children);
  } else if (variant === 'severity') {
    styleClass = getSeverityBadgeStyle(children);
  } else if (variant === 'role') {
    styleClass = {
      STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      SECURITY_OFFICER: 'bg-blue-50 text-blue-700 border-blue-200',
      ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    }[children] || styleClass;
  }

  const displayText = variant === 'type' ? getIncidentTypeLabel(children) : children;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styleClass} whitespace-nowrap`}>
      {displayText}
    </span>
  );
};
