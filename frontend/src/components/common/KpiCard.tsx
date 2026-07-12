import { useEffect, useState } from 'react';
import { type LucideIcon } from 'lucide-react';


interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  suffix?: string;
  trend?: string;
}

export function KpiCard({ label, value, icon: Icon, color = '#0F4C81', suffix = '', trend }: KpiCardProps) {
  const [displayed, setDisplayed] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const steps = 30;
    const increment = value / steps;
    const intervalTime = duration / steps;
    
    if (value === 0) {
      setDisplayed(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-color)] hover:-translate-y-1 transition-transform duration-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={20} style={{ color }} />
          </div>
          {trend && <span className="text-xs text-gray-500">{trend}</span>}
        </div>
        <p className="font-display font-bold text-3xl text-[var(--text-primary)] tabular-nums">
          {displayed.toLocaleString()}{suffix}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{label}</p>
      </div>
      <div className="mt-4 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
    </div>
  );
}
