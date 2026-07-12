import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { Truck, Loader2 } from 'lucide-react';

const DEMO_USERS = [
  { label: 'Fleet Manager', email: 'manager@transitops.com' },
  { label: 'Dispatcher', email: 'dispatch@transitops.com' },
  { label: 'Safety Officer', email: 'safety@transitops.com' },
  { label: 'Financial Analyst', email: 'finance@transitops.com' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, quickEmail?: string) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(quickEmail || email, 'demo123');
      setAuth(res.access_token, res.user as any);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-count-up">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
            <Truck size={24} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">TransitOps</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Smart Transport Operations Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Sign In
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 text-[10px] tracking-wider font-bold">Quick Demo Login</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                onClick={() => handleLogin(undefined, u.email)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg transition-all text-center truncate shadow-sm cursor-pointer"
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
