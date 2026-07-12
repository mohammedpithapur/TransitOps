import { useEffect, useState } from 'react';
import { vehiclesApi } from '../../api/vehicles';
import type { Vehicle } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useRBAC } from '../../hooks/useRBAC';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export function VehiclesPage() {
  const { can } = useRBAC();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  // Form values
  const [regNum, setRegNum] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Truck');
  const [fuelType, setFuelType] = useState('Diesel');
  const [maxLoad, setMaxLoad] = useState<number>(5000);
  const [cost, setCost] = useState<number>(2000000);
  const [odometer, setOdometer] = useState<number>(0);
  const [region, setRegion] = useState('North');
  const [expiry, setExpiry] = useState('');
  const [status, setStatus] = useState<'Available' | 'On Trip' | 'In Shop' | 'Retired'>('Available');

  const fetchVehicles = () => {
    setLoading(true);
    vehiclesApi.list({
      region: filterRegion || undefined,
      status: filterStatus || undefined,
      type: filterType || undefined
    })
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterRegion, filterStatus, filterType]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setRegNum('');
    setName('');
    setType('Truck');
    setFuelType('Diesel');
    setMaxLoad(5000);
    setCost(2000000);
    setOdometer(0);
    setRegion('North');
    setExpiry('');
    setStatus('Available');
    setError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setRegNum(v.registration_number);
    setName(v.name);
    setType(v.type);
    setFuelType(v.fuel_type);
    setMaxLoad(v.max_load_capacity_kg);
    setCost(v.acquisition_cost);
    setOdometer(v.current_odometer_km);
    setRegion(v.region || 'North');
    setExpiry(v.insurance_expiry || '');
    setStatus(v.status);
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      registration_number: regNum,
      name,
      type,
      fuel_type: fuelType,
      max_load_capacity_kg: Number(maxLoad),
      acquisition_cost: Number(cost),
      current_odometer_km: Number(odometer),
      region: region || undefined,
      insurance_expiry: expiry || undefined,
      status: editingId ? status : undefined
    };

    try {
      if (editingId) {
        await vehiclesApi.update(editingId, payload);
      } else {
        await vehiclesApi.create(payload);
      }
      setDialogOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehiclesApi.delete(id);
      fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-count-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Fleet Assets Registry</h3>
        {can('vehicles:write') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Register Vehicle
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap gap-3 items-center bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
        <select
          value={filterRegion}
          onChange={e => setFilterRegion(e.target.value)}
          className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none font-medium"
        >
          <option value="">All Regions</option>
          {['North', 'South', 'East', 'West'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none font-medium"
        >
          <option value="">All Types</option>
          {['Truck', 'Van', 'Bus', 'Tanker'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none font-medium"
        >
          <option value="">All Statuses</option>
          {['Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Reg Number</th>
                  <th className="px-6 py-4">Model/Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Max Cargo (kg)</th>
                  <th className="px-6 py-4">Odometer (km)</th>
                  <th className="px-6 py-4">Region</th>
                  {can('vehicles:write') && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-100">{v.registration_number}</td>
                      <td className="px-6 py-4 font-semibold">{v.name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">{v.type}</td>
                      <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                      <td className="px-6 py-4 font-semibold tabular-nums">{v.max_load_capacity_kg.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold tabular-nums">{v.current_odometer_km.toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="text-xs font-semibold bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{v.region || '—'}</span></td>
                      {can('vehicles:write') && (
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(v)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-primary" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-red-600" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={can('vehicles:write') ? 8 : 7} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No vehicles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* dialog modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-lg w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">{editingId ? 'Edit Vehicle Details' : 'Register New Fleet Asset'}</h4>
              <button onClick={() => setDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Registration #</label>
                  <input
                    type="text" required value={regNum} onChange={e => setRegNum(e.target.value.toUpperCase())}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. REG-009"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Asset Model Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. Volvo Heavy Truck"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Vehicle Type</label>
                  <select
                    value={type} onChange={e => setType(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['Truck', 'Van', 'Bus', 'Tanker'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Fuel Type</label>
                  <select
                    value={fuelType} onChange={e => setFuelType(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['Diesel', 'Petrol', 'CNG', 'Electric'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Max Load (kg)</label>
                  <input
                    type="number" required min={0} value={maxLoad} onChange={e => setMaxLoad(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Odometer (km)</label>
                  <input
                    type="number" required min={0} value={odometer} onChange={e => setOdometer(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Cost (INR)</label>
                  <input
                    type="number" required min={0} value={cost} onChange={e => setCost(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Region</label>
                  <select
                    value={region} onChange={e => setRegion(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['North', 'South', 'East', 'West'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Insurance Expiry</label>
                  <input
                    type="date" value={expiry} onChange={e => setExpiry(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {editingId && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Asset Status</label>
                  <select
                    value={status} onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
