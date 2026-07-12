import { useEffect, useState } from 'react';
import { maintenanceApi } from '../../api/maintenance';
import { vehiclesApi } from '../../api/vehicles';
import type { MaintenanceLog, Vehicle } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useRBAC } from '../../hooks/useRBAC';
import { Plus, CheckCircle, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function MaintenancePage() {
  const { can } = useRBAC();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState<number | ''>('');
  const [type, setType] = useState('Routine Service');
  const [description, setDescription] = useState('');
  const [partsCost, setPartsCost] = useState<number>(0);
  const [labourCost, setLabourCost] = useState<number>(0);
  const [odometer, setOdometer] = useState<number>(0);
  const [scheduledDate, setScheduledDate] = useState('');
  const [vendorName, setVendorName] = useState('');

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      maintenanceApi.list(),
      vehiclesApi.list()
    ])
      .then(([lList, vList]) => {
        setLogs(lList);
        setVehicles(vList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedVehicle('');
    setType('Routine Service');
    setDescription('');
    setPartsCost(0);
    setLabourCost(0);
    setOdometer(0);
    setScheduledDate('');
    setVendorName('');
    setError('');
    setDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    try {
      await maintenanceApi.create({
        vehicle_id: Number(selectedVehicle),
        type,
        description,
        parts_cost: Number(partsCost),
        labour_cost: Number(labourCost),
        odometer_at_service: Number(odometer),
        scheduled_date: scheduledDate,
        vendor_name: vendorName || undefined
      });
      setDialogOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Creation failed');
    }
  };

  const handleCloseLog = async (id: number) => {
    if (!window.confirm("Do you want to close this maintenance log? The vehicle will be returned to 'Available' status.")) return;
    try {
      await maintenanceApi.close(id);
      refreshData();
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  // Only display vehicles that are NOT Retired for logging new maintenance
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  return (
    <div className="space-y-6 animate-count-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Maintenance & Repairs logs</h3>
        {can('maintenance:write') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Schedule Maintenance
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Service Type</th>
                  <th className="px-6 py-4">Odometer</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4">Cost (INR)</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Status</th>
                  {can('maintenance:write') && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const vehicleObj = vehicles.find(v => v.id === log.vehicle_id);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[var(--text-secondary)]">
                          {vehicleObj ? `${vehicleObj.registration_number} (${vehicleObj.name})` : `ID: ${log.vehicle_id}`}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {log.type}
                          <span className="block text-xs font-normal text-[var(--text-secondary)] mt-0.5">{log.description}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold tabular-nums">{log.odometer_at_service.toLocaleString()} km</td>
                        <td className="px-6 py-4 font-semibold">{format(new Date(log.scheduled_date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4 font-semibold tabular-nums text-red-500">
                          {log.total_cost.toLocaleString()}
                          <span className="block text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">Parts: {log.parts_cost.toLocaleString()} | Lab: {log.labour_cost.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{log.vendor_name || 'In-House'}</td>
                        <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                        {can('maintenance:write') && (
                          <td className="px-6 py-4 text-right flex justify-end">
                            {log.status === 'Open' ? (
                              <button onClick={() => handleCloseLog(log.id)} className="flex items-center gap-1 bg-[#00C9A7] hover:bg-[#00b396] text-white px-2.5 py-1 rounded text-xs font-semibold shadow-sm" title="Mark Closed">
                                <CheckCircle size={12} /> Close Log
                              </button>
                            ) : (
                              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider px-2 py-1">Closed ({log.completed_date ? format(new Date(log.completed_date), 'dd MMM') : '—'})</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={can('maintenance:write') ? 8 : 7} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No maintenance logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DIALOG */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-lg w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">Schedule Vehicle Maintenance</h4>
              <button onClick={() => setDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-950/20 p-3 rounded-lg text-xs text-amber-700 dark:text-amber-300 font-medium">
                ⚠️ IMPORTANT: Creating an open maintenance log will automatically update the vehicle's status to "In Shop", making it unavailable for trip dispatches.
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Select Vehicle</label>
                <select
                  required value={selectedVehicle} onChange={e => setSelectedVehicle(Number(e.target.value))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Select a Vehicle</option>
                  {activeVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} — {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Service Type</label>
                  <select
                    value={type} onChange={e => setType(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['Routine Service', 'Breakdown Repair', 'Tyre Service', 'Electrical', 'Accident Repair', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Odometer Reading (km)</label>
                  <input
                    type="number" required min={0} value={odometer} onChange={e => setOdometer(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Description / Issues</label>
                <textarea
                  required value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="Detail the problems or service checklist..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Parts Cost (INR)</label>
                  <input
                    type="number" min={0} value={partsCost} onChange={e => setPartsCost(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Labour Cost (INR)</label>
                  <input
                    type="number" min={0} value={labourCost} onChange={e => setLabourCost(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Scheduled Date</label>
                  <input
                    type="date" required value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Service Vendor</label>
                  <input
                    type="text" value={vendorName} onChange={e => setVendorName(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. Authorized Workshop"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/45 p-3 rounded-lg text-xs font-semibold">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button" onClick={() => setDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 text-[var(--text-secondary)] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
