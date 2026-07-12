import { useEffect, useState } from 'react';
import { fuelApi } from '../../api/fuel';
import { expensesApi } from '../../api/expenses';
import { vehiclesApi } from '../../api/vehicles';
import { driversApi } from '../../api/drivers';
import { tripsApi } from '../../api/trips';
import type { FuelLog, Expense, Vehicle, Driver, Trip } from '../../types';
import { useRBAC } from '../../hooks/useRBAC';
import { Plus, Fuel, DollarSign, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function FuelPage() {
  const { can } = useRBAC();
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
  
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // Fuel Form
  const [fuelVehicle, setFuelVehicle] = useState<number | ''>('');
  const [fuelDriver, setFuelDriver] = useState<number | ''>('');
  const [fuelTrip, setFuelTrip] = useState<number | ''>('');
  const [fuelDate, setFuelDate] = useState('');
  const [fuelQty, setFuelQty] = useState<number>(0);
  const [fuelPrice, setFuelPrice] = useState<number>(0);
  const [fuelOdometer, setFuelOdometer] = useState<number>(0);
  const [fuelStation, setFuelStation] = useState('');

  // Expense Form
  const [expVehicle, setExpVehicle] = useState<number | ''>('');
  const [expDriver, setExpDriver] = useState<number | ''>('');
  const [expTrip, setExpTrip] = useState<number | ''>('');
  const [expCategory, setExpCategory] = useState('Toll');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const refreshData = () => {
    setLoading(true);
    Promise.all([
      fuelApi.list(),
      expensesApi.list(),
      vehiclesApi.list(),
      driversApi.list(),
      tripsApi.list()
    ])
      .then(([fList, eList, vList, dList, tList]) => {
        setFuelLogs(fList);
        setExpenses(eList);
        setVehicles(vList);
        setDrivers(dList);
        setTrips(tList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenFuel = () => {
    setFuelVehicle('');
    setFuelDriver('');
    setFuelTrip('');
    setFuelDate(format(new Date(), 'yyyy-MM-dd'));
    setFuelQty(0);
    setFuelPrice(0);
    setFuelOdometer(0);
    setFuelStation('');
    setError('');
    setFuelDialogOpen(true);
  };

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fuelVehicle) {
      setError('Please select a vehicle');
      return;
    }
    try {
      await fuelApi.create({
        vehicle_id: Number(fuelVehicle),
        driver_id: fuelDriver ? Number(fuelDriver) : undefined,
        trip_id: fuelTrip ? Number(fuelTrip) : undefined,
        date: fuelDate,
        quantity_l: Number(fuelQty),
        price_per_litre: Number(fuelPrice),
        odometer_at_fuel: Number(fuelOdometer),
        station_name: fuelStation || undefined
      });
      setFuelDialogOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Error creating fuel log');
    }
  };

  const handleOpenExpense = () => {
    setExpVehicle('');
    setExpDriver('');
    setExpTrip('');
    setExpCategory('Toll');
    setExpAmount(0);
    setExpDate(format(new Date(), 'yyyy-MM-dd'));
    setExpDesc('');
    setError('');
    setExpenseDialogOpen(true);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await expensesApi.create({
        vehicle_id: expVehicle ? Number(expVehicle) : undefined,
        driver_id: expDriver ? Number(expDriver) : undefined,
        trip_id: expTrip ? Number(expTrip) : undefined,
        category: expCategory,
        amount: Number(expAmount),
        date: expDate,
        description: expDesc || undefined
      });
      setExpenseDialogOpen(false);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Error creating expense log');
    }
  };

  return (
    <div className="space-y-6 animate-count-up">
      {/* Tabs list */}
      <div className="flex justify-between items-center border-b border-[var(--border-color)]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'fuel' ? 'border-primary text-primary font-bold' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            <Fuel size={16} /> Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'expenses' ? 'border-primary text-primary font-bold' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            <DollarSign size={16} /> Ancillary Expenses
          </button>
        </div>

        {can('fuel:write') && (
          <div className="pb-2">
            {activeTab === 'fuel' ? (
              <button onClick={handleOpenFuel} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                <Plus size={14} /> Log Fuel Refill
              </button>
            ) : (
              <button onClick={handleOpenExpense} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                <Plus size={14} /> Log Expense
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>
      ) : activeTab === 'fuel' ? (
        /* FUEL LOG TABLE */
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Quantity (Liters)</th>
                  <th className="px-6 py-4">Price/L</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4">Odometer</th>
                  <th className="px-6 py-4">Efficiency</th>
                  <th className="px-6 py-4">Station</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {fuelLogs.length > 0 ? (
                  fuelLogs.map((log) => {
                    const vehicleObj = vehicles.find(v => v.id === log.vehicle_id);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-semibold">{format(new Date(log.date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[var(--text-secondary)]">
                          {vehicleObj ? `${vehicleObj.registration_number} (${vehicleObj.name})` : `ID: ${log.vehicle_id}`}
                        </td>
                        <td className="px-6 py-4 font-semibold tabular-nums">{log.quantity_l.toLocaleString()} L</td>
                        <td className="px-6 py-4 font-semibold tabular-nums">INR {log.price_per_litre.toFixed(2)}</td>
                        <td className="px-6 py-4 font-bold tabular-nums text-red-500">INR {log.total_cost.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold tabular-nums">{log.odometer_at_fuel.toLocaleString()} km</td>
                        <td className="px-6 py-4 font-semibold tabular-nums text-teal-600">
                          {log.fuel_efficiency_kml ? `${log.fuel_efficiency_kml.toFixed(2)} km/L` : '—'}
                          {log.km_since_last_fuel && <span className="block text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">+{log.km_since_last_fuel} km since last</span>}
                        </td>
                        <td className="px-6 py-4 font-semibold">{log.station_name || '—'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No fuel records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* EXPENSE LOG TABLE */
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/40 text-[11px] font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Trip Code</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {expenses.length > 0 ? (
                  expenses.map((e) => {
                    const vehicleObj = vehicles.find(v => v.id === e.vehicle_id);
                    const tripObj = trips.find(t => t.id === e.trip_id);
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-semibold">{format(new Date(e.date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300">{e.category}</span></td>
                        <td className="px-6 py-4 font-mono font-bold text-xs text-[var(--text-secondary)]">
                          {vehicleObj ? `${vehicleObj.registration_number} (${vehicleObj.name})` : '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{tripObj ? tripObj.trip_number : '—'}</td>
                        <td className="px-6 py-4 font-bold tabular-nums text-red-500">INR {e.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-[var(--text-secondary)]">{e.description || '—'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No expenses logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FUEL DIALOG */}
      {fuelDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-sm w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">Log Fuel Refill</h4>
              <button onClick={() => setFuelDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateFuel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Select Vehicle</label>
                <select
                  required value={fuelVehicle} onChange={e => setFuelVehicle(Number(e.target.value))}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="">Select a Vehicle</option>
                  {vehicles.filter(v => v.status !== 'Retired').map(v => (
                    <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Quantity (Liters)</label>
                  <input
                    type="number" required min={0} step="0.01" value={fuelQty} onChange={e => setFuelQty(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Price per Litre (INR)</label>
                  <input
                    type="number" required min={0} step="0.01" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Current Odometer (km)</label>
                  <input
                    type="number" required min={0} value={fuelOdometer} onChange={e => setFuelOdometer(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Refill Date</label>
                  <input
                    type="date" required value={fuelDate} onChange={e => setFuelDate(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Driver (Optional)</label>
                  <select
                    value={fuelDriver} onChange={e => setFuelDriver(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="">Select a Driver</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Trip Code (Optional)</label>
                  <select
                    value={fuelTrip} onChange={e => setFuelTrip(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="">Select a Trip</option>
                    {trips.filter(t => t.status === 'Dispatched').map(t => (
                      <option key={t.id} value={t.id}>{t.trip_number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Station Name</label>
                <input
                  type="text" value={fuelStation} onChange={e => setFuelStation(e.target.value)}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="e.g. NH-48 Shell Station"
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
                  type="button" onClick={() => setFuelDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 text-[var(--text-secondary)] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE DIALOG */}
      {expenseDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-2xl max-w-sm w-full overflow-hidden animate-count-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)]">Log Ancillary Expense</h4>
              <button onClick={() => setExpenseDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Category</label>
                  <select
                    value={expCategory} onChange={e => setExpCategory(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['Toll', 'Parking', 'Driver Allowance', 'Food', 'Loading-Unloading', 'Repair', 'Fine', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Amount (INR)</label>
                  <input
                    type="number" required min={0} value={expAmount} onChange={e => setExpAmount(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Vehicle (Optional)</label>
                  <select
                    value={expVehicle} onChange={e => setExpVehicle(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="">None</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Date</label>
                  <input
                    type="date" required value={expDate} onChange={e => setExpDate(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Driver (Optional)</label>
                  <select
                    value={expDriver} onChange={e => setExpDriver(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="">None</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Trip (Optional)</label>
                  <select
                    value={expTrip} onChange={e => setExpTrip(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="">None</option>
                    {trips.map(t => <option key={t.id} value={t.id}>{t.trip_number}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  value={expDesc} onChange={e => setExpDesc(e.target.value)} rows={2}
                  className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  placeholder="Detail the expense..."
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
                  type="button" onClick={() => setExpenseDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 text-[var(--text-secondary)] px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-xs font-semibold"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
