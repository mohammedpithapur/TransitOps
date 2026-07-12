import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard Metrics',
  '/vehicles': 'Vehicle Registry',
  '/drivers': 'Driver Management',
  '/trips': 'Trip Log & Dispatch',
  '/maintenance': 'Maintenance Logs',
  '/fuel': 'Fuel & Expense Tracker',
  '/reports': 'Reports & Analytics',
};

export function Topbar() {
  const { isDark, toggleDark } = useUIStore();
  const location = useLocation();
  
  const title = Object.entries(titles).find(([k]) => 
    location.pathname === k || location.pathname.startsWith(k + '/')
  )?.[1] || 'TransitOps';

  return (
    <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between px-6 flex-shrink-0 shadow-sm z-10">
      <h2 className="font-display font-semibold text-[var(--text-primary)] text-lg tracking-tight">{title}</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          title={isDark ? "Activate Light Mode" : "Activate Dark Mode"}
        >
          {isDark ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-gray-600" />
          )}
        </button>
      </div>
    </header>
  );
}
