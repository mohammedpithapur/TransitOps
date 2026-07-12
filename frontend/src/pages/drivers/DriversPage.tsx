import { useEffect, useState } from 'react';
import { driversApi } from '../../api/drivers';
import type { Driver } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useRBAC } from '../../hooks/useRBAC';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function DriversPage() {
  const { can } = useRBAC();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Form values
  const [name, setName] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [category, setCategory] = useState('HMV,Transport');
  const [expiryDate, setExpiryDate] = useState('');
  const [contact, setContact] = useState('');
  const [safetyScore, setSafetyScore] = useState<number>(100);
  const [status, setStatus] = useState<'Available' | 'On Trip' | 'Off Duty' | 'Suspended'>('Available');

  const fetchDrivers = () => {
    setLoading(true);
    driversApi.list(filterStatus || undefined)
      .then(setDrivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrivers();
  }, [filterStatus]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setLicenseNum('');
    setCategory('HMV,Transport');
    setExpiryDate('');
    setContact('');
    setSafetyScore(100);
    setStatus('Available');
    setError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingId(d.id);
    setName(d.name);
    setLicenseNum(d.license_number);
    setCategory(d.license_category);
    setExpiryDate(d.license_expiry_date);
    setContact(d.contact_number);
    setSafetyScore(d.safety_score);
    setStatus(d.status);
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name,
      license_number: licenseNum,
      license_category: category,
      license_expiry_date: expiryDate,
      contact_number: contact,
      safety_score: Number(safetyScore),
      status: editingId ? status : undefined
    };

    try {
      if (editingId) {
        await driversApi.update(editingId, payload);
      } else {
        await driversApi.create(payload);
      }
      setDialogOpen(false);
      fetchDrivers();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await driversApi.delete(id);
      fetchDrivers();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400';
    if (score >= 60) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400';
    return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400';
  };

  return (
    <div className="space-y-6 animate-count-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Fleet Drivers Directory</h3>
        {can('drivers:write') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Driver Record
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
          {['Available', 'On Trip', 'Off Duty', 'Suspended'].map(s => <option key={s} value={s}>{s}</option>)}
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
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">License Number</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Safety Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Contact</th>
                  {can('drivers:write') && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
                {drivers.length > 0 ? (
                  drivers.map((d) => {
                    const daysLeft = differenceInDays(new Date(d.license_expiry_date), new Date());
                    const isExpired = daysLeft < 0;
                    const isExpiringSoon = !isExpired && daysLeft <= 30;

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-semibold">{d.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">{d.license_number}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">{d.license_category}</td>
                        <td className="px-6 py-4 font-semibold">
                          <span className={isExpired ? 'text-red-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : ''}>
                            {format(new Date(d.license_expiry_date), 'dd MMM yyyy')}
                          </span>
                          {isExpired ? (
                            <span className="block text-[10px] text-red-500 font-bold">Expired</span>
                          ) : isExpiringSoon ? (
                            <span className="block text-[10px] text-amber-500 font-bold">Expires soon ({daysLeft}d)</span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreBadge(d.safety_score)}`}>
                            {d.safety_score}
                          </span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                        <td className="px-6 py-4 font-semibold">{d.contact_number}</td>
                        {can('drivers:write') && (
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleOpenEdit(d)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-primary" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-red-600" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={can('drivers:write') ? 8 : 7} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No drivers found.</td>
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
              <h4 className="font-semibold text-[var(--text-primary)]">{editingId ? 'Edit Driver Record' : 'Register Driver'}</h4>
              <button onClick={() => setDialogOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Full Name</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. Ramesh Chandra"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">License Number</label>
                  <input
                    type="text" required value={licenseNum} onChange={e => setLicenseNum(e.target.value.toUpperCase())}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. DL-12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">License Category</label>
                  <input
                    type="text" required value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. HMV, Transport"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">License Expiry Date</label>
                  <input
                    type="date" required value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Contact Number</label>
                  <input
                    type="text" required value={contact} onChange={e => setContact(e.target.value)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                    placeholder="e.g. +91 987654321"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Safety Score (0-100)</label>
                  <input
                    type="number" min={0} max={100} value={safetyScore} onChange={e => setSafetyScore(Number(e.target.value))}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {editingId && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Duty Status</label>
                  <select
                    value={status} onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                  >
                    {['Available', 'On Trip', 'Off Duty', 'Suspended'].map(s => <option key={s} value={s}>{s}</option>)}
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
