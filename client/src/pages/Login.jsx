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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#050505]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF0033]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#FF0033]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#FF0033] blur-[40px] opacity-20 rounded-full" />
            <img 
              src="/logos/logo.png" 
              alt="METANARU" 
              className="w-32 sm:w-40 relative z-10 drop-shadow-[0_0_20px_rgba(255,0,51,0.4)]"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mt-6 text-white text-center"
            style={{ fontFamily: "'Metal Mania', cursive" }}
          >
            STAFF<span className="text-[#FF0033]">.PORTAL</span>
          </motion.h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-gray-500 uppercase mt-2">Authorized Access Only</p>
        </div>

        {/* Card Section */}
        <div className="relative">
          {/* Border Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF0033] to-[#880011] rounded-[2rem] opacity-20 blur-sm" />
          
          <div className="relative p-8 sm:p-10 rounded-[2rem] bg-black/60 backdrop-blur-2xl border border-white/5 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-7">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#FF0033] ml-1">Admin Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#FF0033] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl block pl-12 p-4 focus:ring-1 focus:ring-[#FF0033]/50 focus:border-[#FF0033] transition-all outline-none placeholder:text-gray-700"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#FF0033] ml-1">Access Token</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-[#FF0033] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl block pl-12 pr-12 p-4 focus:ring-1 focus:ring-[#FF0033]/50 focus:border-[#FF0033] transition-all outline-none placeholder:text-gray-700"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-[#FF0033] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-tight"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-[#FF0033] to-[#CC0029] text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(255,0,51,0.2)] hover:shadow-[0_0_40px_rgba(255,0,51,0.4)] disabled:opacity-50 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[-20deg]" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      INITIALIZE ACCESS
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-8 bg-white/10" />
            <ShieldCheck size={16} className="text-gray-600" />
            <div className="h-px w-8 bg-white/10" />
          </div>
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] mb-4">
            © 2026 METANARU CORE SYSTEM
          </p>
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] text-gray-500 hover:text-[#FF0033] font-bold uppercase tracking-[0.5em] transition-colors"
          >
            RETURN TO PUBLIC SITE
          </button>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap');
      `}</style>
    </div>
  );
};

export default Login;










