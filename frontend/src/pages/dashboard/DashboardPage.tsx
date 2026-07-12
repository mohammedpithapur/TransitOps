import { useEffect, useState } from 'react';
import { Truck, Wrench, MapPin, Clock, Activity, AlertTriangle } from 'lucide-react';
import { KpiCard } from '../../components/common/KpiCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { reportsApi } from '../../api/reports';
import type { DashboardKPIs } from '../../types';

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  useEffect(() => {
    setLoading(true);
    reportsApi.dashboard({
      region: region || undefined,
      vehicle_type: vehicleType || undefined
    })
      .then(setKpis)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [region, vehicleType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!kpis) return null;

  const pieData = [
    { name: 'On Trip', value: kpis.active_vehicles, color: '#1A6DB5' },
    { name: 'Available', value: kpis.available_vehicles, color: '#00C9A7' },
    { name: 'In Maintenance', value: kpis.vehicles_in_maintenance, color: '#F4A942' },
    { name: 'Retired', value: kpis.retired_vehicles, color: '#E63946' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-count-up">
      {/* Expiry alerts banner */}
      {kpis.expiring_licenses_count > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 shadow-sm">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Action Required: Driver Licenses Expiring Soon</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              {kpis.expiring_licenses.map(d => `${d.name} (${d.days_left} days remaining)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary shadow-sm font-medium"
        >
          <option value="">All Regions</option>
          {['North', 'South', 'East', 'West'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={vehicleType}
          onChange={e => setVehicleType(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary shadow-sm font-medium"
        >
          <option value="">All Vehicle Types</option>
          {['Truck', 'Van', 'Bus', 'Tanker'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Active Vehicles" value={kpis.active_vehicles} icon={Truck} color="#3b82f6" />
        <KpiCard label="Available Vehicles" value={kpis.available_vehicles} icon={Truck} color="var(--color-accent)" />
        <KpiCard label="In Maintenance" value={kpis.vehicles_in_maintenance} icon={Wrench} color="var(--color-warn)" />
        <KpiCard label="Active Trips" value={kpis.active_trips} icon={MapPin} color="var(--color-primary)" />
        <KpiCard label="Pending Trips" value={kpis.pending_trips} icon={Clock} color="#a855f7" />
        <KpiCard label="Fleet Utilization" value={kpis.fleet_utilization_pct} suffix="%" icon={Activity} color="var(--color-accent)" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-4">Fleet Status Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} Vehicles`, 'Status']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-[var(--text-secondary)]">No fleet assets found matching filters.</div>
          )}
        </div>

        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-4">Fleet Operations Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Fleet Registry', value: kpis.total_vehicles, color: 'bg-blue-500' },
                { label: 'Drivers Active (On Duty)', value: kpis.drivers_on_duty, color: 'bg-emerald-500' },
                { label: 'Drivers Standby (Available)', value: kpis.available_drivers, color: 'bg-indigo-500' },
                { label: 'Inactive / Retired Fleet', value: kpis.retired_vehicles, color: 'bg-rose-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                    <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] text-base">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
