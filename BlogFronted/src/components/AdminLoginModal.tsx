import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Lock, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('请填写用户名和密码');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      onClose();
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#fffefa] border border-natural-border w-full max-w-sm shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-natural-border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-natural-accent" />
                  <span className="text-xs uppercase tracking-[0.2em] text-natural-text font-medium">管理员登录</span>
                </div>
                <button onClick={onClose} className="text-natural-light hover:text-natural-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                <label className="block">
                  <span className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-natural-light">用户名</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    className="w-full border-b border-natural-border bg-transparent px-1 py-2 text-sm outline-none transition focus:border-natural-accent"
                    placeholder="admin"
                  />
                </label>

                <label className="block">
                  <span className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-natural-light">密码</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-natural-border bg-transparent px-1 py-2 text-sm outline-none transition focus:border-natural-accent"
                    placeholder="········"
                  />
                </label>

                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-natural-accent px-5 py-2.5 text-[10px] uppercase tracking-widest text-white transition hover:bg-natural-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  {loading ? '验证中...' : '登 录'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
