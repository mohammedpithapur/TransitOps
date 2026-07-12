import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { useRBAC } from '../../hooks/useRBAC';
import {
  LayoutDashboard, Truck, Users, MapPin, Wrench,
  Fuel, BarChart3, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navGroups = [
  {
    group: 'OPERATIONS',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: null },
      { to: '/vehicles', icon: Truck, label: 'Vehicles', permission: 'vehicles:read' },
      { to: '/drivers', icon: Users, label: 'Drivers', permission: 'drivers:read' },
      { to: '/trips', icon: MapPin, label: 'Trips', permission: 'trips:read' },
      { to: '/maintenance', icon: Wrench, label: 'Maintenance', permission: 'maintenance:read' },
    ]
  },
  {
    group: 'FINANCE & REPORTS',
    items: [
      { to: '/fuel', icon: Fuel, label: 'Fuel & Expenses', permission: 'fuel:read' },
      { to: '/reports', icon: BarChart3, label: 'Reports', permission: 'reports:read' },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();
  const { can } = useRBAC();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const roleColors: Record<string, string> = {
    fleet_manager: 'bg-blue-600',
    dispatcher: 'bg-teal-600',
    safety_officer: 'bg-red-600',
    financial_analyst: 'bg-purple-600',
  };

  const roleLabels: Record<string, string> = {
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] text-slate-400 transition-all duration-300 flex-shrink-0',
      sidebarCollapsed ? 'w-16' : 'w-60'
    )}>
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
        {!sidebarCollapsed && (
          <div>
            <span className="font-display font-bold text-base text-white tracking-tight">TransitOps</span>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Fleet Portal</p>
          </div>
        )}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-800/80 hover:text-white transition-colors ml-auto">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.group}>
            {!sidebarCollapsed && (
              <p className="px-4 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{group.group}</p>
            )}
            <div className="space-y-0.5 mt-1">
              {group.items.map((item) => {
                if (item.permission && !can(item.permission)) return null;
                const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 text-sm font-medium',
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile details */}
      {user && (
        <div className="p-3 border-t border-[var(--border-color)] bg-slate-950/40">
          <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 uppercase">
              {user.name[0]}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate leading-tight">{user.name}</p>
                <span className={cn('inline-block text-[9px] font-bold px-2 py-0.5 rounded-full text-white mt-1.5', roleColors[user.role] || 'bg-gray-600')}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            )}
            <button onClick={logout} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors" title="Sign Out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
