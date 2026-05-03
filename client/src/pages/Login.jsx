import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/public/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin');
      } else {
        setError(data.error || 'Kredensial tidak valid. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan sistem. Pastikan backend sudah menyala.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[35%] h-[35%] sm:w-[40%] sm:h-[40%] bg-vibrant-pink rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] sm:w-[40%] sm:h-[40%] bg-gold rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-vibrant-pink/10 text-vibrant-pink mb-6 border border-vibrant-pink/20 shadow-lg shadow-vibrant-pink/5">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-2">Staff Portal</h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-gray-400 uppercase">Akses sistem internal METANARU</p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-white/5 backdrop-blur-xl bg-white/5 shadow-2xl relative">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-vibrant-pink transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-2xl block pl-12 p-3.5 sm:p-4 focus:ring-1 focus:ring-vibrant-pink focus:border-vibrant-pink transition-all outline-none placeholder:text-gray-600"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-vibrant-pink transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-2xl block pl-12 pr-12 p-3.5 sm:p-4 focus:ring-1 focus:ring-vibrant-pink focus:border-vibrant-pink transition-all outline-none placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-vibrant-pink transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-vibrant-pink hover:bg-pink-600 text-white font-black uppercase tracking-widest text-[11px] sm:text-xs py-4 sm:py-5 rounded-2xl transition-all shadow-xl shadow-vibrant-pink/20 hover:shadow-vibrant-pink/40 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-[9px] sm:text-[10px] text-gray-600 font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] space-y-2">
          <p>© 2026 METANARU — SYSTEM SECURITY</p>
          <button 
            onClick={() => navigate('/')}
            className="text-vibrant-pink hover:underline uppercase tracking-[0.3em]"
          >
            ← Kembali ke Publik
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;









