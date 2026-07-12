import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports';
import { useRBAC } from '../../hooks/useRBAC';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileDown } from 'lucide-react';

export function ReportsPage() {
  const { can } = useRBAC();
  const [activeTab, setActiveTab] = useState<'roi' | 'efficiency' | 'cost' | 'utilization'>('roi');
  
  const [roiData, setRoiData] = useState<any[]>([]);
  const [efficiencyData, setEfficiencyData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = () => {
    setLoading(true);
    Promise.all([
      reportsApi.vehicleRoi(),
      reportsApi.fuelEfficiency(),
      reportsApi.operationalCost(),
      reportsApi.fleetUtilization()
    ])
      .then(([roi, eff, cost, util]) => {
        setRoiData(roi);
        setEfficiencyData(eff);
        setCostData(cost);
        setUtilizationData(util);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-count-up">
      {/* Report selector */}
      <div className="flex justify-between items-center border-b border-[var(--border-color)]">
        <div className="flex gap-4">
          {[
            { id: 'roi', label: 'Vehicle ROI' },
            { id: 'efficiency', label: 'Fuel Efficiency' },
            { id: 'cost', label: 'Operational Cost' },
            { id: 'utilization', label: 'Fleet Utilization' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary font-bold' : 'border-transparent text-[var(--text-secondary)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {can('reports:export') && (
          <button
            onClick={() => {
              if (activeTab === 'roi') downloadCSV(roiData, 'vehicle_roi_report.csv');
              else if (activeTab === 'efficiency') downloadCSV(efficiencyData, 'fuel_efficiency_report.csv');
              else if (activeTab === 'cost') downloadCSV(costData, 'operational_cost_report.csv');
              else if (activeTab === 'utilization') downloadCSV(utilizationData.by_vehicle, 'fleet_utilization_report.csv');
            }}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm mb-2"
          >
            <FileDown size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* REPORT VIEWS */}
      {activeTab === 'roi' && (
        <div className="space-y-6">
          <div className="card-premium p-6">
            <h4 className="font-semibold text-sm mb-4">Vehicle ROI Analysis</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="registration_number" />
                  <YAxis unit="%" />
                  <Tooltip formatter={(v) => [v != null ? `${v}%` : '0%', 'ROI']} />
                  <Bar dataKey="roi_pct" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Acquisition Cost</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4">Maintenance Cost</th>
                  <th className="px-6 py-4">Fuel Cost</th>
                  <th className="px-6 py-4">Vehicle ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {roiData.map((d) => (
                  <tr key={d.vehicle_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs">{d.registration_number} ({d.name})</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">INR {d.acquisition_cost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-green-600">INR {d.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-red-500">INR {d.maintenance_cost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-red-500">INR {d.fuel_cost.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${d.roi_pct >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'}`}>
                        {d.roi_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="card-premium p-6">
            <h4 className="font-semibold text-sm mb-4">Fuel Efficiency Chart (km/L)</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="registration_number" />
                  <YAxis unit=" km/L" />
                  <Tooltip formatter={(v) => [v != null ? `${v} km/L` : '— km/L', 'Efficiency']} />
                  <Bar dataKey="efficiency_kml" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Total Distance (km)</th>
                  <th className="px-6 py-4">Total Fuel Consumed</th>
                  <th className="px-6 py-4">Average Fuel Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {efficiencyData.map((d) => (
                  <tr key={d.vehicle_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs">{d.registration_number} ({d.name})</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">{d.total_km.toLocaleString()} km</td>
                    <td className="px-6 py-4 font-semibold tabular-nums">{d.total_fuel_l.toLocaleString()} L</td>
                    <td className="px-6 py-4 font-bold text-teal-600 tabular-nums">{d.efficiency_kml ? `${d.efficiency_kml} km/L` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cost' && (
        <div className="space-y-6">
          <div className="card-premium p-6">
            <h4 className="font-semibold text-sm mb-4">Total Operational Cost Stack</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="registration_number" />
                  <YAxis />
                  <Tooltip formatter={(v) => [v != null ? `INR ${v.toLocaleString()}` : 'INR 0', 'Cost']} />
                  <Legend />
                  <Bar dataKey="fuel_cost" stackId="a" fill="var(--color-danger)" name="Fuel" />
                  <Bar dataKey="maintenance_cost" stackId="a" fill="var(--color-warn)" name="Maintenance" />
                  <Bar dataKey="other_expenses" stackId="a" fill="#a855f7" name="Other Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Fuel Cost</th>
                  <th className="px-6 py-4">Maintenance Cost</th>
                  <th className="px-6 py-4">Ancillary Expenses</th>
                  <th className="px-6 py-4">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {costData.map((d) => (
                  <tr key={d.vehicle_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs">{d.registration_number} ({d.name})</td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-red-500">INR {d.fuel_cost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-red-500">INR {d.maintenance_cost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold tabular-nums text-red-500">INR {d.other_expenses.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold tabular-nums text-red-600">INR {d.total_ops_cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'utilization' && utilizationData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-premium p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-4">Utilization Score</h4>
              <div className="text-center py-6">
                <span className="font-display font-black text-6xl text-primary tracking-tight">{utilizationData.utilization_pct}%</span>
                <p className="text-xs text-[var(--text-secondary)] mt-2 uppercase font-bold tracking-wider">Fleet Assets Active</p>
              </div>
            </div>
            <div className="space-y-2 border-t border-[var(--border-color)] pt-4 text-xs font-semibold text-[var(--text-secondary)]">
              <div className="flex justify-between"><span>Total Fleet Assets (Non-Retired):</span><span className="text-[var(--text-primary)] font-bold">{utilizationData.total_non_retired}</span></div>
              <div className="flex justify-between"><span>Vehicles currently On Trip:</span><span className="text-[var(--text-primary)] font-bold">{utilizationData.on_trip}</span></div>
              <div className="flex justify-between"><span>Vehicles in Maintenance (In Shop):</span><span className="text-[var(--text-primary)] font-bold">{utilizationData.in_shop}</span></div>
            </div>
          </div>

          <div className="card-premium overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex justify-between items-center"><h4 className="font-semibold text-sm">Asset Status Inventory</h4></div>
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/40 text-[10px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                  {utilizationData.by_vehicle.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs">{v.registration_number} — {v.name}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-semibold">{v.type}</td>
                      <td className="px-4 py-3 text-xs font-bold uppercase">{v.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
