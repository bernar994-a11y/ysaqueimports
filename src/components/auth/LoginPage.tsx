'use client';

import { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0b]">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 group transition-all duration-500 hover:scale-110">
            <Smartphone className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Ysaque Imports</h1>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">Bem-vindo ao centro de operações da sua loja.</p>
        </div>

        <div className="glass-card p-8 border-white/5 shadow-2xl backdrop-blur-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label text-xs uppercase tracking-widest font-bold mb-2 block">E-mail ou Usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)] group-focus-within:text-indigo-400 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs uppercase tracking-widest font-bold mb-2 block">Senha Segura</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)] group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 group relative overflow-hidden h-14"
            >
              {loading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Criptografia Ativa
            </div>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" />
              Conexão Segura
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">
          &copy; 2026 Ysaque Imports - Tecnologia de Ponta
        </p>
      </div>
    </div>
  );
}
