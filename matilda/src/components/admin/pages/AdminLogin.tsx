import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = password.trim();
    if (!trimmed) {
      setError('Please enter access code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.token || 'matilda_auth_ok');
        document.cookie = `admin_session=${data.token || 'matilda_auth_ok'}; path=/; max-age=604800`;
        navigate('/admin/orders');
        return;
      }

      // If password is MANGO11 or datmat1, allow client login as fallback
      if (trimmed.toUpperCase() === 'MANGO11' || trimmed === 'datmat1') {
        const fallbackToken = 'matilda_mango11_session_token';
        localStorage.setItem('admin_token', fallbackToken);
        document.cookie = `admin_session=${fallbackToken}; path=/; max-age=604800`;
        navigate('/admin/orders');
        return;
      }

      const errData = await res.json().catch(() => ({}));
      setError(errData.error || 'Invalid access code. Password is MANGO11');
    } catch (e) {
      if (trimmed.toUpperCase() === 'MANGO11' || trimmed === 'datmat1') {
        const fallbackToken = 'matilda_mango11_session_token';
        localStorage.setItem('admin_token', fallbackToken);
        document.cookie = `admin_session=${fallbackToken}; path=/; max-age=604800`;
        navigate('/admin/orders');
        return;
      }
      setError('Network issue logging in. Try entering MANGO11');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white/90 backdrop-blur-xl border border-[var(--border-admin,#722F37)]/20 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#722F37] via-[#A83232] to-[#722F37]" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#722F37]/10 flex items-center justify-center text-[#722F37] mb-4 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl font-bold lowercase tracking-tight text-[#1A1A1A]">
            matilda suite
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            administrative access
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="access code (e.g. MANGO11)"
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/20 bg-white pr-12 transition-all font-mono placeholder:font-sans placeholder:text-gray-400 text-center tracking-wider text-base"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-2.5 px-4 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#722F37] hover:bg-[#5C262C] text-white font-micro tracking-widest text-xs uppercase py-4 rounded-2xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>authenticating...</span>
            ) : (
              <>
                <span>enter suite</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#722F37]" />
            Access Code: <strong className="text-gray-700 font-bold">MANGO11</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
