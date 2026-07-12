import { useEffect, useState } from 'react';
import { tripsApi } from '../../api/trips';
import { vehiclesApi } from '../../api/vehicles';
import { driversApi } from '../../api/drivers';
import type { Trip, Vehicle, Driver } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useRBAC } from '../../hooks/useRBAC';
import { Plus, Check, Play, Ban, X, AlertCircle } from 'lucide-react';


export function TripsPage() {
  const { can } = useRBAC();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Create Form State
  const [selectedVehicle, setSelectedVehicle] = useState<number | ''>('');
  const [selectedDriver, setSelectedDriver] = useState<number | ''>('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [cargo, setCargo] = useState<number>(0);
  const [estDist, setEstDist] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);

  // Complete Form State
  const [actDist, setActDist] = useState<number>(0);
  const [fuelL, setFuelL] = useState<number>(0);

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('');

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      tripsApi.list({ status: filterStatus || undefined }),
      vehiclesApi.list(),
      driversApi.list()
    ])
      .then(([tList, vList, dList]) => {
        setTrips(tList);
        setVehicles(vList);
        setDrivers(dList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, [filterStatus]);

  const handleOpenCreate = () => {
    setSelectedVehicle('');
    setSelectedDriver('');
    setSource('');
    setDestination('');
    setCargo(0);
    setEstDist(0);
    setRevenue(0);
    setError('');
    setCreateDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedVehicle || !selectedDriver) {
      setError('Please select a vehicle and a driver');
      return;
    }

    try {
      await tripsApi.create({
        vehicle_id: Number(selectedVehicle),
        driver_id: Number(selectedDriver),
        source,
        destination,
        cargo_weight_kg: Number(cargo),
        estimated_distance_km: Number(estDist),
        revenue: Number(revenue)
      });
      setCreateDialogOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Creation failed');
    }
  };

  const handleDispatch = async (id: number) => {
    if (!window.confirm("Do you want to dispatch this trip? Both vehicle and driver will be set to 'On Trip'.")) return;
    try {
      await tripsApi.dispatch(id);
      refreshData();
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    }
  };

  const handleOpenComplete = (id: number, est: number) => {
    setActiveTripId(id);
    setActDist(est);
    setFuelL(0);
    setError('');
    setCompleteDialogOpen(true);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activeTripId) return;

    try {
      await tripsApi.complete(activeTripId, {
        actual_distance_km: Number(actDist),
        fuel_consumed_l: Number(fuelL)
      });
      setCompleteDialogOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Completion failed');
    }
  };

  const handleOpenCancel = (id: number) => {
    setActiveTripId(id);
    setCancelReason('');
    setError('');
    setCancelDialogOpen(true);
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!activeTripId) return;

    try {
      await tripsApi.cancel(activeTripId, cancelReason);
      setCancelDialogOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Cancellation failed');
    }
  };

  // Filter dropdown selections to only AVAILABLE status
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  return (
    <div className="space-y-6 animate-count-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Trips & Logistics Lifecycle</h3>
        {can('trips:write') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Plan New Delivery
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap gap-3 items-center card-premium p-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none font-medium"
        >
          <option value="">All Statuses</option>
          {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
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
                  <th className="px-6 py-4">Trip Code</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Distance (km)</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Status</th>
                  {can('trips:dispatch') && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {trips.length > 0 ? (
                  trips.map((t) => {
                    const vehicleObj = vehicles.find(v => v.id === t.vehicle_id);
                    const driverObj = drivers.find(d => d.id === t.driver_id);
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-100">{t.trip_number}</td>
                        <td className="px-6 py-4 font-semibold">
                          {t.source} <span className="text-gray-400 font-normal">➔</span> {t.destination}
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-[var(--text-secondary)]">
                          {vehicleObj ? `${vehicleObj.registration_number} (${vehicleObj.name})` : `ID: ${t.vehicle_id}`}
                        </td>
                        <td className="px-6 py-4 font-semibold">{driverObj ? driverObj.name : `ID: ${t.driver_id}`}</td>
                        <td className="px-6 py-4 font-semibold tabular-nums">{t.cargo_weight_kg.toLocaleString()} kg</td>
                        <td className="px-6 py-4 font-semibold tabular-nums">
                          {t.status === 'Completed' ? `${t.actual_distance_km} (act)` : `${t.estimated_distance_km} (est)`}
                        </td>
                        <td className="px-6 py-4 font-semibold tabular-nums text-green-600">INR {t.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                        {can('trips:dispatch') && (
                          <td className="px-6 py-4 text-right flex justify-end gap-1.5">
                            {t.status === 'Draft' && (
                              <>
                                <button onClick={() => handleDispatch(t.id)} className="flex items-center gap-1 bg-[#00C9A7] hover:bg-[#00b396] text-white px-2.5 py-1 rounded text-xs font-semibold" title="Dispatch">
                                  <Play size={12} /> Dispatch
                                </button>
                                <button onClick={() => handleOpenCancel(t.id)} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold" title="Cancel">
                                  <Ban size={12} /> Cancel
                                </button>
                              </>
                            )}
                            {t.status === 'Dispatched' && (
                              <>
                                <button onClick={() => handleOpenComplete(t.id, t.estimated_distance_km)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-semibold" title="Complete">
                                  <Check size={12} /> Complete
                                </button>
                                <button onClick={() => handleOpenCancel(t.id)} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold" title="Cancel">
                                  <Ban size={12} /> Cancel
                                </button>
                              </>
                            )}
                            {t.status === 'Completed' && <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider px-2 py-1">Completed</span>}
                            {t.status === 'Cancelled' && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider px-2 py-1">Cancelled</span>}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={can('trips:dispatch') ? 9 : 8} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No trips recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DIALOG */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-lg w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">Plan New Logistics Trip</h4>
              <button onClick={() => setCreateDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Select Vehicle (Only Available)</label>
                <select
                  required value={selectedVehicle} onChange={e => setSelectedVehicle(Number(e.target.value))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Select a Vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} — {v.name} (Max Capacity: {v.max_load_capacity_kg} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Select Driver (Only Available)</label>
                <select
                  required value={selectedDriver} onChange={e => setSelectedDriver(Number(e.target.value))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Select a Driver</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Safety Score: {d.safety_score})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Source City</label>
                  <input
                    type="text" required value={source} onChange={e => setSource(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Destination City</label>
                  <input
                    type="text" required value={destination} onChange={e => setDestination(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. Pune"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number" required min={0} value={cargo} onChange={e => setCargo(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Est Distance (km)</label>
                  <input
                    type="number" required min={0} value={estDist} onChange={e => setEstDist(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Est Revenue (INR)</label>
                  <input
                    type="number" required min={0} value={revenue} onChange={e => setRevenue(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
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
                  type="button" onClick={() => setCreateDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 text-[var(--text-secondary)] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE DIALOG */}
      {completeDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-sm w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">Log Trip Completion</h4>
              <button onClick={() => setCompleteDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleComplete} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Actual Distance Driven (km)</label>
                <input
                  type="number" required min={0} value={actDist} onChange={e => setActDist(Number(e.target.value))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Total Fuel Consumed (Liters)</label>
                <input
                  type="number" required min={0} step="0.1" value={fuelL} onChange={e => setFuelL(Number(e.target.value))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/45 p-3 rounded-lg text-xs font-semibold">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button" onClick={() => setCompleteDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 text-[var(--text-secondary)] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL DIALOG */}
      {cancelDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-sm w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">Cancel Trip</h4>
              <button onClick={() => setCancelDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCancel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Reason for Cancellation</label>
                <textarea
                  required value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="Provide reason for cancellation..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/45 p-3 rounded-lg text-xs font-semibold">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button" onClick={() => setCancelDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 text-[var(--text-secondary)] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
