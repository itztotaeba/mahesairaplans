import { useState } from 'react';
import { useAuthStore } from '../authStore';
import { useToastStore } from '../toastStore';
import { X, LogIn, UserPlus } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export default function AuthModal({ isOpen, onClose }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, isLoading } = useAuthStore();
  const { addToast } = useToastStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { addToast('Email dan password wajib diisi', 'error'); return; }
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    if (error) { addToast(error, 'error'); return; }
    addToast(isLogin ? 'Login berhasil!' : 'Registrasi berhasil!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        <h2 className="font-heading text-xl font-bold text-gray-800 mb-4">{isLogin ? 'Login' : 'Daftar'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 karakter"
              className="w-full px-4 py-2.5 border border-[#E8E0D4] rounded-xl focus:ring-2 focus:ring-[#87A878]/30 focus:border-[#87A878] outline-none" />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2F6A43] to-[#1E4A2E] text-white rounded-xl font-medium disabled:opacity-50">
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#2F6A43] font-medium hover:underline">
            {isLogin ? 'Daftar' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
