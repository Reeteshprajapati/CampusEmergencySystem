import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ShieldAlert,
  LayoutDashboard,
  AlertOctagon,
  CheckCircle2,
  History,
  Users,
  Shield,
  MapPin,
  FileText,
  Bell,
  Scroll,
  Settings,
  PlusCircle,
  User,
  X,
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, isStudent, isOfficer, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/report-emergency', label: 'Report Emergency', icon: PlusCircle, isEmergency: true },
    { to: '/student/my-incidents', label: 'My Incidents', icon: AlertOctagon },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const staffLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      label: 'Incidents',
      icon: ShieldAlert,
      children: [
        { to: '/incidents/active', label: 'Active Incidents', icon: AlertOctagon },
        ...(isOfficer ? [{ to: '/incidents/my-assigned', label: 'My Assigned', icon: Shield }] : []),
        { to: '/incidents/resolved', label: 'Resolved', icon: CheckCircle2 },
        { to: '/incidents/history', label: 'Incident History', icon: History },
      ],
    },
    ...(isAdmin ? [{ to: '/admin/students', label: 'Students', icon: Users }] : []),
    ...(isAdmin ? [{ to: '/admin/security-team', label: 'Security Team', icon: Shield }] : []),
    { to: '/locations', label: 'Locations', icon: MapPin },
    ...(isAdmin ? [{ to: '/admin/reports', label: 'Reports', icon: FileText }] : []),
    { to: '/notifications', label: 'Notifications', icon: Bell },
    ...(isAdmin ? [{ to: '/admin/audit-logs', label: 'Audit Logs', icon: Scroll }] : []),
    ...(isAdmin ? [{ to: '/admin/settings', label: 'Settings', icon: Settings }] : []),
  ];

  const links = isStudent ? studentLinks : staffLinks;

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-red-600 to-rose-500 rounded-xl text-white shadow-md shadow-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-lg">CampusGuard</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Safety & Security System</p>
          </div>
        </div>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        {links.map((item, idx) => {
          if (item.children) {
            return (
              <div key={idx} className="space-y-1 pt-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                <div className="pl-3 space-y-1 border-l border-slate-800 ml-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`
                      }
                    >
                      <child.icon className="w-4 h-4 shrink-0" />
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  item.isEmergency
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold shadow-lg shadow-red-600/30 hover:brightness-110 pulse-emergency'
                    : isActive
                    ? 'bg-slate-800 text-white font-semibold border-l-4 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              <item.icon className={`w-5 h-5 shrink-0 ${item.isEmergency ? 'text-white' : ''}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      {user && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 z-10">{content}</div>
        </div>
      )}
    </>
  );
};
