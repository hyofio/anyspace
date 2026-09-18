import React, { useState, useEffect, useMemo } from 'react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, setDoc, getDoc } from 'firebase/firestore';
import {
Home, List, Calendar, History as HistoryIcon, Plus, CheckCircle,
Circle, Briefcase, User, Clock, ChevronRight, ChevronLeft,
Search, MoreVertical, Tag, AlertCircle, X,
Settings, LogOut, Copy, Download, Bell, UserCircle,
Edit2, Trash2, Camera, Loader2, Lock
} from 'lucide-react';

const supabaseLoginWithGoogle = async () => { return await signInWithPopup(auth, googleProvider); };
const supabaseLogout = async () => { return await signOut(auth); };
const supabaseFetchActivities = async () => {
    if (!auth.currentUser) return [];
    const q = query(collection(db, 'activities'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
const supabaseFetchTasks = async () => {
    if (!auth.currentUser) return [];
    const q = query(collection(db, 'tasks'), where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
const supabaseInsertActivity = async (data) => {
    if (!auth.currentUser) return;
    const docRef = await addDoc(collection(db, 'activities'), { ...data, userId: auth.currentUser.uid });
    return docRef.id;
};
const supabaseUpdateActivity = async (id, data) => {
    const docRef = doc(db, 'activities', id);
    await updateDoc(docRef, data);
};
const supabaseDeleteActivity = async (id) => {
    await deleteDoc(doc(db, 'activities', id));
};
const supabaseInsertTask = async (data) => {
    if (!auth.currentUser) return;
    const docRef = await addDoc(collection(db, 'tasks'), { ...data, userId: auth.currentUser.uid });
    return docRef.id;
};
const supabaseUpdateTask = async (id, data) => {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, data);
};
const supabaseDeleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
};
const supabaseUpdateProfilePic = async (fileUrl) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: fileUrl });
    }
};

const processAvatar = (file) => {
return new Promise((resolve) => {
const reader = new FileReader();
reader.onload = (event) => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
const size = 256;
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext('2d');

// Crop center
const min = Math.min(img.width, img.height);
const sx = (img.width - min) / 2;
const sy = (img.height - min) / 2;

ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
resolve(canvas.toDataURL('image/webp', 0.8));
};
img.src = event.target.result;
};
reader.readAsDataURL(file);
});
};

const baseDate = new Date();
const today = new Date(baseDate);
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

const formatDate = (dateString, includeYear = true) => {
if (!dateString) return '';
const options = { day: 'numeric', month: 'long', year: includeYear ? 'numeric' : undefined };
return new Date(dateString).toLocaleDateString('id-ID', options);
};

const isToday = (dateString) => {
if(!dateString) return false;
const d = new Date(dateString);
return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

const getGreeting = () => {
const hour = today.getHours();
if (hour < 12) return 'Selamat pagi' ; if (hour < 15) return 'Selamat siang' ; if (hour < 18) return 'Selamat sore' ;
    return 'Selamat malam' ; }; const generateId=()=> Math.random().toString(36).substr(2, 9);

    const initialActivities = [
    {
    id: 'a1', title: 'Google Student Ambassador', org: 'Google', type: 'Organisasi', role: 'Duta Mahasiswa',
    status: 'NOW', regStatus: 'PASSED', startDate: '2025-08-10', endDate: '2026-08-14', completedDate: null,
    description: 'Mewakili Google di kampus, menyelenggarakan acara dan lokakarya teknologi.',
    responsibilities: ['Mengorganisir 3 acara kampus', 'Mempromosikan teknologi Google'], tags: ['#Google', '#Kampus'],
    notes: ''
    },
    {
    id: 'a2', title: 'Nusantara Fest', org: 'Komunitas XYZ', type: 'Kepanitiaan', role: 'Staf Desain',
    status: 'NOW', regStatus: 'PASSED', startDate: '2026-08-10', endDate: '2026-11-20', completedDate: null,
    description: 'Kepanitiaan festival budaya tahunan.',
    responsibilities: ['Membuat Feed Instagram', 'Mendesain poster acara', 'Aset media sosial'], tags: ['#Desain',
    '#Kepanitiaan'], notes: 'Perlu kolaborasi dengan tim marketing.'
    },
    {
    id: 'a3', title: 'Samsung Innovation Campus', org: 'Samsung', type: 'Proyek', role: 'Peserta',
    status: 'UPCOMING', regStatus: 'APPLIED', startDate: '2026-09-01', endDate: '2026-12-01', completedDate: null,
    description: 'Program pelatihan teknologi dan pengembangan proyek.',
    responsibilities: [], tags: ['#Teknologi', '#Proyek'], notes: 'Menunggu pengumuman.'
    }
    ];

    const initialTasks = [
    { id: 't1', activityId: 'a2', title: 'Desain poster', deadline: today.toISOString().split('T')[0], isCompleted:
    false },
    { id: 't2', activityId: 'a2', title: 'Desain Feed Instagram', deadline: yesterday.toISOString().split('T')[0],
    isCompleted: true },
    { id: 't4', activityId: 'a3', title: 'Siapkan portofolio untuk wawancara', deadline:
    tomorrow.toISOString().split('T')[0], isCompleted: false },
    ];

    const StatusBadge = ({ status, type = 'main' }) => {
    const styles = {
    UPCOMING: 'bg-blue-100 text-blue-700',
    NOW: 'bg-indigo-100 text-indigo-700',
    DONE: 'bg-emerald-100 text-emerald-700',
    HISTORY: 'bg-slate-100 text-slate-700',
    PLANNED: 'bg-slate-100 text-slate-600',
    APPLIED: 'bg-amber-100 text-amber-700',
    PASSED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    CANCELLED: 'bg-slate-200 text-slate-500'
    };

    const labels = {
    UPCOMING: 'MENDATANG',
    NOW: 'SEKARANG',
    DONE: 'SELESAI',
    HISTORY: 'RIWAYAT',
    PLANNED: 'DIRENCANAKAN',
    APPLIED: 'DILAMAR',
    PASSED: 'DITERIMA',
    REJECTED: 'DITOLAK',
    CANCELLED: 'DIBATALKAN'
    };

    const displayStyle = styles[status] || 'bg-gray-100 text-gray-700';
    return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${displayStyle}`}>
        {labels[status] || status}
    </span>
    );
    };

    const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Konfirmasi", isDestructive =
    false }) => {
    if (!isOpen) return null;
    return (
    <div
        className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">{message}</p>
            <div className="flex justify-end space-x-3">
                <button onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    Batal
                </button>
                <button onClick={onConfirm} className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl
                    transition-all shadow-sm ${isDestructive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' }`}>
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
    );
    };

    const LoginGate = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
        if (isSignUp) {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            await updateProfile(userCredential.user, { displayName: formData.fullName });
        } else {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
        }
    } catch (error) {
        console.error(error);
        setIsLoading(false);
        if (error.code === 'auth/weak-password') {
            setErrorMsg('Kata sandi minimal 6 karakter.');
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            setErrorMsg('Email atau kata sandi salah, atau akun belum terdaftar.');
        } else if (error.code === 'auth/email-already-in-use') {
            setErrorMsg('Email ini sudah terdaftar.');
        } else {
            setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
        }
    }
    };

    const handleGoogle = async () => {
    setIsLoading(true);
    try {
        await supabaseLoginWithGoogle();
    } catch (error) {
        console.error(error);
        setIsLoading(false);
    }
    };

    return (
    <div
        className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 relative overflow-hidden">
        <div
            className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse">
        </div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"
            style={{ animationDelay: '2s' }}></div>

        <div
            className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-100/50 border border-white relative z-10">
            <div
                className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-8 transform -rotate-6 transition-transform hover:rotate-0">
                <Briefcase size={36} className="text-white transform rotate-6" />
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isSignUp ? 'Buat Akun' : 'Selamat Datang'}</h1>
                <p className="text-sm text-slate-500 font-medium mt-2">ANYSPACE Pelacak Pribadi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                {isSignUp && (
                <div>
                    <input required type="text" placeholder="Nama Lengkap"
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-semibold placeholder-slate-400"
                        value={formData.fullName} onChange={e=> setFormData({...formData, fullName: e.target.value})}
                    />
                </div>
                )}
                <div>
                    <input required type="email" placeholder="Alamat Email"
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-semibold placeholder-slate-400"
                        value={formData.email} onChange={e=> setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div>
                    <input required type="password" placeholder="Kata Sandi" minLength={6}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-semibold placeholder-slate-400"
                        value={formData.password} onChange={e=> setFormData({...formData, password: e.target.value})}
                    />
                </div>

                {errorMsg && (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-semibold mb-4">
                        {errorMsg}
                    </div>
                )}
                <button type="submit" disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center mt-2">
                    {isLoading ?
                    <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Daftar Sekarang' : 'Masuk')}
                </button>
            </form>

            <div className="relative flex items-center py-2 mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span
                    className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Atau</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button onClick={handleGoogle} disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm mb-6">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Lanjutkan dengan Google</span>
            </button>

            <p className="text-center text-sm font-medium text-slate-500 mt-8">
                {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
                <button onClick={()=> setIsSignUp(!isSignUp)} className="font-bold text-indigo-600 hover:text-indigo-700
                    transition-colors">
                    {isSignUp ? "Masuk" : "Daftar"}
                </button>
            </p>
        </div>
    </div>
    );
    };

    const SettingsPanel = ({ isOpen, onClose, onLogout, onExportCV, user, onUpdateUser, onToast }) => {
    const [pushEnabled, setPushEnabled] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(user?.fullName || '');

    // State untuk Modal Ganti Kata Sandi
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });

    useEffect(() => { setTempName(user?.fullName || ''); }, [user?.fullName]);

    const saveName = async () => {
        if(tempName.trim()) {
            setIsEditingName(false);
            onUpdateUser({ ...user, fullName: tempName.trim() });
            onToast("Nama berhasil diperbarui!");
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: tempName.trim() });
                await setDoc(doc(db, 'users', auth.currentUser.uid), { fullName: tempName.trim() }, { merge: true });
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassStatus({ loading: false, error: '', success: '' });

        if (passwords.new.length < 6) {
            setPassStatus({ loading: false, error: 'Kata sandi minimal 6 karakter.', success: '' });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setPassStatus({ loading: false, error: 'Konfirmasi kata sandi tidak cocok.', success: '' });
            return;
        }

        setPassStatus({ loading: true, error: '', success: '' });
        
        // Memanggil API Supabase untuk update password (Mock)
        setTimeout(() => {
            // const { error } = await supabase.auth.updateUser({ password: passwords.new });
            const error = null; // Mock success
            if (error) {
                setPassStatus({ loading: false, error: error.message, success: '' });
            } else {
                setPassStatus({ loading: false, error: '', success: 'Kata sandi berhasil diperbarui!' });
                onToast("Kata sandi berhasil diperbarui!");
                // Tutup modal secara otomatis setelah 2 detik
                setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setPasswords({ new: '', confirm: '' });
                    setPassStatus({ loading: false, error: '', success: '' });
                }, 2000);
            }
        }, 1000);
    };

    const handleToggleNotification = async () => {
        if (!pushEnabled) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setPushEnabled(true);
                    new Notification('Anyspace', { body: 'Notifikasi pengingat aktif!' });
                    onToast("Notifikasi diaktifkan!");
                } else {
                    alert('Izin notifikasi diblokir browser.');
                }
            } else {
                alert('Browser Anda tidak mendukung notifikasi.');
            }
        } else {
            setPushEnabled(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const croppedImage = await processAvatar(file);
            onUpdateUser({ ...user, avatarUrl: croppedImage });
            supabaseUpdateProfilePic(croppedImage);
            if (auth.currentUser) {
                await setDoc(doc(db, 'users', auth.currentUser.uid), { avatarUrl: croppedImage }, { merge: true });
            }
            onToast("Foto profil diperbarui!");
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[70] transition-opacity animate-in fade-in" onClick={onClose}></div>
            )}
            <div className={`fixed inset-y-0 right-0 w-[85%] max-w-[400px] bg-slate-50 shadow-2xl z-[80] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white">
                    <h2 className="text-xl font-black text-slate-900">Pengaturan</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8 hide-scrollbar">
                    {/* Bagian Profil Atas */}
                    <div className="flex flex-col items-center text-center">
                        <label className="relative cursor-pointer group mb-3 block">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl shadow-inner ring-4 ring-white overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user?.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.fullName ? user.fullName.charAt(0).toUpperCase() : "A"
                                )}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        {isEditingName ? (
                            <div className="flex items-center space-x-2 mt-2">
                                <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500" autoFocus onKeyDown={e => e.key === 'Enter' && saveName()} />
                                <button onClick={saveName} className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Simpan</button>
                            </div>
                        ) : (
                            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center cursor-pointer group mt-2" onClick={() => setIsEditingName(true)}>
                                {user?.fullName || 'Pengguna'}
                                <Edit2 size={14} className="ml-2 text-slate-400 group-hover:text-indigo-500" />
                            </h3>
                        )}
                    </div>

                    {/* AKUN & DATA */}
                    <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Akun & Data</h4>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2">
                            {/* Email Akun */}
                            <div className="flex items-center p-3 border-b border-slate-50">
                                <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl mr-4">
                                    <UserCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Email Akun</p>
                                    <p className="text-xs font-medium text-slate-500">{user?.email || 'Memuat email...'}</p>
                                </div>
                            </div>

                            {/* Ganti Kata Sandi */}
                            <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left group">
                                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl mr-4 group-hover:scale-105 transition-transform">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Ganti Kata Sandi</p>
                                    <p className="text-xs font-medium text-slate-500">Perbarui keamanan akun</p>
                                </div>
                            </button>

                            {/* Salin CV */}
                            <button onClick={onExportCV} className="w-full flex items-center p-3 hover:bg-slate-50 transition-colors text-left group">
                                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl mr-4 group-hover:scale-105 transition-transform">
                                    <Copy size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Salin CV 1-Klik</p>
                                    <p className="text-xs font-medium text-slate-500">Salin riwayat ke Markdown</p>
                                </div>
                            </button>
                        </div>
                    </section>

                    {/* PREFERENSI */}
                    <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Preferensi</h4>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2">
                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl mr-4">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Notifikasi Push</p>
                                        <p className="text-xs font-medium text-slate-500">Pengingat tenggat waktu harian</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleNotification}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${pushEnabled ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-slate-200 bg-white">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center space-x-2 py-3.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Keluar Akun</span>
                    </button>
                </div>
            </div>

            {/* MODAL GANTI KATA SANDI */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900">Ganti Kata Sandi</h2>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Kata Sandi Baru</label>
                                <input 
                                    required 
                                    type="password" 
                                    placeholder="Minimal 6 karakter"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                    value={passwords.new} 
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Kata Sandi</label>
                                <input 
                                    required 
                                    type="password" 
                                    placeholder="Ulangi kata sandi baru"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                    value={passwords.confirm} 
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>

                            {/* Status Messages */}
                            {passStatus.error && <p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-xl">{passStatus.error}</p>}
                            {passStatus.success && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl flex items-center"><CheckCircle size={14} className="mr-2"/>{passStatus.success}</p>}

                            <button 
                                type="submit" 
                                disabled={passStatus.loading || passStatus.success}
                                className="w-full mt-2 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {passStatus.loading ? <Loader2 size={18} className="animate-spin" /> : 'Perbarui Kata Sandi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
    };
    const DailyReminderModal = ({ isOpen, onClose, todayTasks, todayEvents }) => {
    if (!isOpen) return null;
    const totalAgenda = todayTasks.length + todayEvents.length;

    return (
    <div
        className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
        <div
            className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-6 relative text-white">
                <button onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded-full transition-colors">
                    <X size={20} />
                </button>
                <div
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                    <Bell size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">Pengingat Hari Ini</h3>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                    Kamu punya <span
                        className="font-bold text-white bg-indigo-500/50 px-2 py-0.5 rounded-lg">{totalAgenda}</span>
                    agenda penting hari ini. Jangan lupa diselesaikan ya, semangat! 🔥
                </p>
            </div>

            <div className="p-6 max-h-[50vh] overflow-y-auto hide-scrollbar space-y-6">
                {todayTasks.length > 0 && (
                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tenggat Waktu Tugas
                        Hari Ini</h4>
                    <div className="space-y-3">
                        {todayTasks.map(t => (
                        <div key={t.id} className="flex items-start p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 mr-3 flex-shrink-0 animate-pulse">
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-snug">{t.title}</p>
                        </div>
                        ))}
                    </div>
                </div>
                )}

                {todayEvents.length > 0 && (
                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Kegiatan Berjalan
                    </h4>
                    <div className="space-y-3">
                        {todayEvents.map(a => (
                        <div key={a.id}
                            className="flex items-start p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-indigo-900 leading-snug">{a.title}</p>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">
                                    {a.role}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button onClick={onClose}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                    Siap, Laksanakan!
                </button>
            </div>
        </div>
    </div>
    );
    };

    const Dashboard = ({ activities, tasks, onToggleTask, navigateTo, onOpenSettings, user, onEditTask, onDeleteTask }) => {
    const todayTasks = tasks.filter(t => isToday(t.deadline) && !t.isCompleted);
    const upcomingTasks = tasks.filter(t => !isToday(t.deadline) && !t.isCompleted).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const activeActivities = activities.filter(a => a.status === 'NOW');
    const upcomingActivities = activities.filter(a => a.status === 'UPCOMING');
    const completedCount = activities.filter(a => a.status === 'DONE').length;

    const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Kawan';

    return (
    <div className="pb-24 md:pb-8 animate-in fade-in duration-500 p-0 md:p-8">
        <div className="md:grid md:grid-cols-12 md:gap-10 flex flex-col space-y-6 md:space-y-0">
            <div className="md:col-span-5 space-y-8 md:space-y-10">
                <div
                    className="bg-white px-6 pt-12 pb-8 md:p-8 md:rounded-[2.5rem] rounded-b-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                    <div
                        className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-2xl opacity-60 pointer-events-none">
                    </div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex-1 pr-4">
                            <h1
                                className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                                {getGreeting()},<br /><span className="text-indigo-600">{firstName}</span> 👋
                            </h1>
                            <p
                                className="text-sm font-semibold text-emerald-600 flex items-center bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                                <span
                                    className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                Siap produktif hari ini
                            </p>
                        </div>

                        <button onClick={onOpenSettings}
                            className="relative group flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all mt-1">
                            <div
                                className="w-16 h-16 rounded-[1.5rem] bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl ring-4 ring-white shadow-lg overflow-hidden border-2 border-indigo-100">
                                {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                firstName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div
                                className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <Settings size={16} />
                            </div>
                        </button>
                    </div>

                    <div className="flex space-x-4 mt-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
                        <div onClick={()=> navigateTo('activities', null, 'NOW')} className="snap-start bg-indigo-600
                            rounded-[1.5rem] p-5 min-w-[110px] flex-shrink-0 cursor-pointer hover:bg-indigo-700
                            transition-all shadow-lg shadow-indigo-200">
                            <div className="text-3xl font-black text-white mb-1">{activeActivities.length}</div>
                            <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Aktif</div>
                        </div>
                        <div onClick={()=> navigateTo('activities', null, 'UPCOMING')} className="snap-start bg-white
                            border border-slate-200 rounded-[1.5rem] p-5 min-w-[110px] flex-shrink-0 cursor-pointer
                            hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="text-3xl font-black text-slate-800 mb-1">{upcomingActivities.length}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mendatang
                            </div>
                        </div>
                        <div onClick={()=> navigateTo('experience')} className="snap-start bg-white border
                            border-slate-200 rounded-[1.5rem] p-5 min-w-[110px] flex-shrink-0 cursor-pointer
                            hover:border-emerald-300 hover:shadow-md transition-all">
                            <div className="text-3xl font-black text-slate-800 mb-1">{completedCount}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai
                            </div>
                        </div>
                    </div>
                </div>

                <section className="px-6 md:px-0">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tugas Hari Ini</h2>
                    </div>
                    {todayTasks.length > 0 ? (
                    <div
                        className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
                        {todayTasks.map((task, idx) => {
                        const activity = activities.find(a => a.id === task.activityId);
                        return (
                        <div key={task.id} className={`group flex items-start p-5 hover:bg-slate-50 transition-colors
                            relative ${idx !==todayTasks.length - 1 ? 'border-b border-slate-50' : '' }`}>
                            <button onClick={()=> onToggleTask(task.id)} className="mt-0.5 mr-4 flex-shrink-0
                                text-slate-300 hover:text-indigo-500 transition-colors">
                                <Circle size={24} />
                            </button>
                            <div className="flex-1 min-w-0 pr-14">
                                <p className="text-base font-bold text-slate-800 truncate leading-snug">{task.title}</p>
                                <p
                                    className="text-xs font-semibold text-slate-400 mt-1 truncate tracking-wide uppercase">
                                    {task.activityId === 'kerja' ? 'KERJA' : task.activityId === 'kuliah' ? 'KULIAH' : (activity?.title || 'Umum')}</p>
                            </div>
                            <div
                                className="absolute right-5 top-5 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=> onEditTask(task)} className="p-2 text-slate-400
                                    hover:text-indigo-600 rounded-xl hover:bg-slate-100">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={()=> onDeleteTask(task.id)} className="p-2 text-slate-400
                                    hover:text-rose-600 rounded-xl hover:bg-slate-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        )
                        })}
                    </div>
                    ) : (
                    <div className="text-center p-10 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4 border border-emerald-100">
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-base font-bold text-slate-700">Semua tugas hari ini selesai!</p>
                        <p className="text-sm font-medium text-slate-500 mt-1">Selamat menikmati waktu luangmu.</p>
                    </div>
                    )}
                </section>

                <section className="px-6 md:px-0 mt-8">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Tugas Mendatang</h2>
                    </div>
                    {upcomingTasks.length > 0 ? (
                    <div
                        className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        {upcomingTasks.map((task, idx) => {
                        const activity = activities.find(a => a.id === task.activityId);
                        return (
                        <div key={task.id} className={`group flex items-start p-4 hover:bg-slate-50 transition-colors
                            relative ${idx !== upcomingTasks.length - 1 ? 'border-b border-slate-50' : '' }`}>
                            <button onClick={()=> onToggleTask(task.id)} className="mt-0.5 mr-4 flex-shrink-0
                                text-slate-300 hover:text-indigo-500 transition-colors">
                                <Circle size={20} />
                            </button>
                            <div className="flex-1 min-w-0 pr-14">
                                <p className="text-sm font-bold text-slate-800 truncate leading-snug">{task.title}</p>
                                <p
                                    className="text-[11px] font-semibold text-slate-400 mt-1 truncate tracking-wide uppercase">
                                    TENGGAT: {formatDate(task.deadline, false)} • {task.activityId === 'kerja' ? 'KERJA' : task.activityId === 'kuliah' ? 'KULIAH' : (activity?.title || 'Umum')}</p>
                            </div>
                            <div
                                className="absolute right-4 top-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=> onEditTask(task)} className="p-1.5 text-slate-400
                                    hover:text-indigo-600 rounded-lg hover:bg-slate-100">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={()=> onDeleteTask(task.id)} className="p-1.5 text-slate-400
                                    hover:text-rose-600 rounded-lg hover:bg-slate-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        )
                        })}
                    </div>
                    ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                        <p className="text-sm font-medium text-slate-500">Tidak ada tugas mendatang.</p>
                    </div>
                    )}
                </section>
            </div>

            <div className="md:col-span-7 space-y-10 px-6 md:px-0">
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kegiatan Saat Ini</h2>
                        <button onClick={()=> navigateTo('activities', null, 'NOW')} className="text-sm font-bold
                            text-indigo-600 hover:text-indigo-700 flex items-center">Lihat Semua
                            <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeActivities.length > 0 ? activeActivities.slice(0, 4).map(activity => (
                        <div key={activity.id} onClick={()=> navigateTo('detail', activity.id)} className="bg-white p-6
                            rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 cursor-pointer
                            hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col justify-between group
                            active:scale-[0.98]">
                            <div className="flex justify-between items-start mb-6">
                                <StatusBadge status={activity.status} />
                                <div
                                    className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 line-clamp-2">
                                    {activity.title}</h3>
                                <p className="text-sm font-bold text-slate-500">{activity.role}</p>
                            </div>
                        </div>
                        )) : (
                        <div
                            className="col-span-full text-center p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Tidak ada kegiatan aktif saat ini.</p>
                        </div>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Rencana Mendatang</h2>
                    <div className="space-y-4">
                        {upcomingActivities.length > 0 ? upcomingActivities.slice(0, 3).map(activity => (
                        <div key={activity.id} onClick={()=> navigateTo('detail', activity.id)} className="bg-white p-6
                            rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 cursor-pointer
                            hover:shadow-2xl transition-all active:scale-[0.98] group">
                            <div className="flex justify-between items-start mb-3">
                                <h3
                                    className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {activity.title}</h3>
                                <StatusBadge status={activity.regStatus} type="reg" />
                            </div>
                            <p className="text-sm font-bold text-slate-500">{activity.type} • {activity.org}</p>
                        </div>
                        )) : (
                        <div className="text-center p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Belum ada rencana mendatang yang dicatat.
                            </p>
                        </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    </div>
    );
    };

    const ActivityList = ({ activities, navigateTo, initialTab = 'NOW' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = [
    { id: 'UPCOMING', label: 'Mendatang' },
    { id: 'NOW', label: 'Sedang Aktif' },
    { id: 'DONE', label: 'Selesai / Riwayat' }
    ];

    const filteredActivities = activities.filter(a => {
    let matchesTab = false;
    if (activeTab === 'UPCOMING') matchesTab = a.status === 'UPCOMING';
    if (activeTab === 'NOW') matchesTab = a.status === 'NOW';
    if (activeTab === 'DONE') matchesTab = a.status === 'DONE' || a.status === 'HISTORY';

    const searchTarget = `${a.title} ${a.org} ${a.tags.join(' ')} ${a.role}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
    });

    return (
    <div className="pb-24 pt-8 px-6 md:p-10 animate-in fade-in min-h-screen bg-slate-50/50 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Kegiatan</h1>

        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
            </div>
            <input type="text"
                className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-shadow font-medium"
                placeholder="Cari nama, organisasi, tag..." value={searchQuery} onChange={(e)=>
            setSearchQuery(e.target.value)}
            />
        </div>

        <div className="flex p-1 bg-slate-200/60 rounded-xl mb-6">
            {tabs.map(tab => (
            <button key={tab.id} onClick={()=> setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all
                duration-200 ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 scale-[0.98]'}`}
                >
                {tab.label}
            </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.length > 0 ? filteredActivities.map(activity => (
            <div key={activity.id} onClick={()=> navigateTo('detail', activity.id)} className="bg-white p-5 rounded-2xl
                shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all
                active:scale-[0.98] flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight pr-2 line-clamp-1">
                            {activity.title}</h3>
                        <StatusBadge status={activeTab==='UPCOMING' ? activity.regStatus : activity.status} />
                    </div>
                    <p className="text-sm font-semibold text-indigo-600 mb-3">{activity.role} <span
                            className="text-slate-400 font-medium ml-1">di {activity.org}</span></p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                    {activity.tags.map(tag => (
                    <span key={tag}
                        className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-500 tracking-wide uppercase">
                        {tag}
                    </span>
                    ))}
                </div>
            </div>
            )) : (
            <div className="col-span-full text-center py-16 px-4 bg-white rounded-3xl border border-slate-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <Briefcase size={24} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">Kegiatan tidak ditemukan</h3>
                <p className="text-sm text-slate-500">Coba ubah pencarianmu atau tambah kegiatan baru.</p>
            </div>
            )}
        </div>
    </div>
    );
    };

    const ActivityDetail = ({ activityId, activities, tasks, onToggleTask, onUpdateActivity, onNavigateBack, onAddTask,
    onAddMultipleTasks, onEditActivity, onDeleteActivity, onEditTask, onDeleteTask, onToast }) => {
    const activity = activities.find(a => a.id === activityId);
    const activityTasks = tasks.filter(t => t.activityId === activityId);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    if (!activity) return <div className="p-6 text-center text-slate-500 mt-10">Kegiatan tidak ditemukan</div>;

    const handleStatusChange = (actionType) => {
    let updates = {};
    if (actionType === 'MOVE_NOW') {
    updates = { status: 'NOW', startDate: today.toISOString().split('T')[0] };
    } else if (actionType === 'MARK_DONE') {
    updates = { status: 'DONE', completedDate: today.toISOString().split('T')[0] };
    } else if (actionType === 'REJECT') {
    updates = { regStatus: 'REJECTED', status: 'HISTORY' };
    } else if (actionType === 'CANCEL') {
    updates = { regStatus: 'CANCELLED', status: 'HISTORY' };
    } else if (actionType === 'PASS') {
    updates = { regStatus: 'PASSED' };
    } else if (actionType === 'DELETE') {
    onDeleteActivity(activity.id);
    onNavigateBack();
    return;
    }

    onUpdateActivity(activity.id, updates);
    setShowConfirm(false);
    };

    const triggerConfirm = (action) => {
    setConfirmAction(action);
    setShowConfirm(true);
    };

    return (
    <div
        className="pb-24 bg-white min-h-screen animate-in fade-in relative z-20 md:rounded-l-3xl md:shadow-xl border-l border-slate-100">
        <div
            className="sticky top-0 bg-white/90 backdrop-blur-md z-30 px-4 py-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center">
                <button onClick={onNavigateBack}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="ml-2 font-bold text-slate-900 truncate">Detail</h2>
            </div>
            <div className="flex items-center space-x-1">
                <button onClick={()=> onEditActivity(activity)} className="p-2 text-slate-400 hover:text-indigo-600
                    hover:bg-indigo-50 rounded-full transition-colors">
                    <Edit2 size={20} />
                </button>
                <button onClick={()=> triggerConfirm('DELETE')} className="p-2 text-slate-400 hover:text-rose-600
                    hover:bg-rose-50 rounded-full transition-colors">
                    <Trash2 size={20} />
                </button>
            </div>
        </div>

        <div className="px-6 pt-6 max-w-3xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <StatusBadge status={activity.status} />
                    {activity.status === 'UPCOMING' &&
                    <StatusBadge status={activity.regStatus} />}
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{activity.title}
                </h1>
                <p className="text-lg text-indigo-600 font-bold">{activity.role} <span
                        className="text-slate-400 font-medium ml-1">di {activity.org}</span></p>
            </div>

            {activity.regStatus === 'REJECTED' && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8 flex items-start space-x-3">
                <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="text-sm text-rose-800 font-bold mb-1">Belum berhasil kali ini.</p>
                    <p className="text-xs text-rose-600 font-medium leading-relaxed">Tapi itu bukan akhir. Tetap
                        semangat dan jangan lupa istirahat. Kalau mencoba lagi, semoga persiapannya bisa lebih baik! 💪
                    </p>
                </div>
            </div>
            )}

            <div className="mb-8 space-y-3">
                {activity.status === 'UPCOMING' && activity.regStatus === 'PASSED' && (
                <button onClick={()=> triggerConfirm('MOVE_NOW')} className="w-full py-4 bg-indigo-600 text-white
                    rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]
                    transition-all">
                    Mulai Kegiatan (Pindah ke SEKARANG)
                </button>
                )}

                {activity.status === 'NOW' && (
                <button onClick={()=> triggerConfirm('MARK_DONE')} className="w-full py-4 bg-emerald-600 text-white
                    rounded-xl font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98]
                    transition-all flex items-center justify-center">
                    <CheckCircle size={18} className="mr-2" /> Tandai Selesai
                </button>
                )}

                {activity.status === 'UPCOMING' && ['PLANNED', 'APPLIED'].includes(activity.regStatus) && (
                <div className="grid grid-cols-2 gap-3">
                    {activity.regStatus === 'PLANNED' && (
                    <>
                        <button onClick={()=> onUpdateActivity(activity.id, { regStatus: 'APPLIED' })} className="py-3
                            bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100
                            hover:bg-indigo-100 transition-colors">
                            Tandai Dilamar
                        </button>
                        <button onClick={()=> triggerConfirm('CANCEL')} className="py-3 bg-slate-50 text-slate-600
                            rounded-xl font-bold border border-slate-200 hover:bg-slate-100 transition-colors">
                            Batalkan Rencana
                        </button>
                    </>
                    )}
                    {activity.regStatus === 'APPLIED' && (
                    <>
                        <button onClick={()=> triggerConfirm('PASS')} className="py-3 bg-emerald-50 text-emerald-700
                            rounded-xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                            Diterima!
                        </button>
                        <button onClick={()=> triggerConfirm('REJECT')} className="py-3 bg-rose-50 text-rose-700
                            rounded-xl font-bold border border-rose-100 hover:bg-rose-100 transition-colors">
                            Ditolak
                        </button>
                    </>
                    )}
                </div>
                )}
            </div>

            <div className="space-y-8">
                <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Lini Masa</h3>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Calendar size={20} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-800 font-semibold">
                                {activity.startDate ? formatDate(activity.startDate) : 'Belum Ditentukan'}
                                {activity.endDate ? ` - ${formatDate(activity.endDate)}` : (activity.startDate ? ' - Sekarang' : '')}
                            </p>
                            {activity.completedDate && (
                            <p className="text-xs text-emerald-600 font-bold mt-1">Diselesaikan pada
                                {formatDate(activity.completedDate)}</p>
                            )}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail & Tanggung
                            Jawab</h3>
                    </div>

                    {activity.description && (
                    <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{activity.description}</p>
                    )}

                    {activity.responsibilities && activity.responsibilities.length > 0 && (
                    <ul className="space-y-2 mb-4">
                        {activity.responsibilities.map((resp, i) => (
                        <li key={i} className="text-sm font-medium text-slate-700 flex items-start">
                            <span className="text-indigo-400 mr-2 mt-1 text-[10px]">■</span>
                            {resp}
                        </li>
                        ))}
                    </ul>
                    )}

                    {(!activity.description && (!activity.responsibilities || activity.responsibilities.length === 0))
                    && (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center">
                        <button onClick={() => onEditActivity(activity)} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm inline-flex items-center">
                            + Tambah Detail & Tanggung Jawab
                        </button>
                    </div>
                    )}
                </section>

                {['NOW', 'UPCOMING'].includes(activity.status) && (
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Tugas</h3>
                        <button onClick={()=> onAddTask(activity.id)} className="text-xs font-bold text-slate-700
                            bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors shadow-sm">Tambah
                            Tugas</button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {activityTasks.length > 0 ? activityTasks.map((task, idx) => (
                        <div key={task.id} className={`group flex items-start p-4 hover:bg-slate-50 transition-colors
                            relative ${idx !==activityTasks.length - 1 ? 'border-b border-slate-100' : '' }`}>
                            <button onClick={()=> onToggleTask(task.id)} className={`mt-0.5 mr-3 flex-shrink-0
                                transition-colors ${task.isCompleted ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-500'}`}>
                                {task.isCompleted ?
                                <CheckCircle size={20} /> :
                                <Circle size={20} />}
                            </button>
                            <div className={`transition-all pr-12 ${task.isCompleted ? 'opacity-50 line-through' : ''
                                }`}>
                                <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wide">
                                    Tenggat: {formatDate(task.deadline, false)}</p>
                            </div>
                            <div
                                className="absolute right-4 top-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=> onEditTask(task)} className="p-1.5 text-slate-400
                                    hover:text-indigo-600 rounded-lg hover:bg-slate-100">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={()=> onDeleteTask(task.id)} className="p-1.5 text-slate-400
                                    hover:text-rose-600 rounded-lg hover:bg-slate-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        )) : (
                        <div className="p-6 text-center">
                            <p className="text-sm font-medium text-slate-500">Belum ada tugas yang ditambahkan.</p>
                        </div>
                        )}
                    </div>
                </section>
                )}

                {activity.tags && activity.tags.length > 0 && (
                <section>
                    <div className="flex flex-wrap gap-2">
                        {activity.tags.map(tag => (
                        <span key={tag}
                            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                            {tag}
                        </span>
                        ))}
                    </div>
                </section>
                )}
            </div>
        </div>

        <ConfirmModal isOpen={showConfirm} title={ confirmAction==='DELETE' ? 'Hapus kegiatan ini?' :
            confirmAction==='MARK_DONE' ? 'Selesaikan kegiatan ini?' : confirmAction==='MOVE_NOW'
            ? 'Mulai kegiatan ini?' : confirmAction==='REJECT' ? 'Tandai sebagai Ditolak?' : confirmAction==='CANCEL'
            ? 'Batalkan rencana ini?' : confirmAction==='PASS' ? 'Tandai sebagai Diterima?' : 'Konfirmasi' } message={
            confirmAction==='DELETE'
            ? 'Apakah kamu yakin ingin menghapus kegiatan ini? Tindakan ini tidak dapat dibatalkan.' :
            confirmAction==='MARK_DONE'
            ? 'Ini akan memindahkan kegiatan ke SELESAI dan mencatat hari ini sebagai tanggal penyelesaian. Ini akan ditambahkan ke Riwayat Pengalamanmu untuk CV/Portofolio.'
            : confirmAction==='MOVE_NOW'
            ? 'Selamat! Ini akan secara resmi memulai kegiatan dan memindahkannya ke daftar SEKARANG.' :
            confirmAction==='REJECT' ? 'Kegiatan ini akan dipindahkan ke arsip Riwayat. Tetap semangat!' :
            confirmAction==='CANCEL' ? 'Kegiatan ini akan diarsipkan sebagai dibatalkan.'
            : 'Apakah kamu yakin ingin melanjutkan?' } confirmText={confirmAction==='REJECT' || confirmAction==='CANCEL'
            ? 'Ya, Arsipkan' : confirmAction==='DELETE' ? 'Ya, Hapus' : 'Ya, Lanjutkan' }
            isDestructive={confirmAction==='REJECT' || confirmAction==='CANCEL' || confirmAction==='DELETE' }
            onConfirm={()=> handleStatusChange(confirmAction)}
            onCancel={() => setShowConfirm(false)}
            />
    </div>
    );
    };

    const ExperienceView = ({ activities }) => {
    const completedActivities = activities
    .filter(a => a.status === 'DONE' || (a.status === 'HISTORY' && !['REJECTED', 'CANCELLED'].includes(a.regStatus)))
    .sort((a, b) => {
    const dateA = new Date(a.completedDate || a.endDate || a.startDate || 0);
    const dateB = new Date(b.completedDate || b.endDate || b.startDate || 0);
    return dateB - dateA;
    });

    return (
    <div className="pb-24 pt-10 px-6 md:p-10 animate-in fade-in bg-slate-50 min-h-screen max-w-4xl mx-auto">
        <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayatku</h1>
            <p className="text-slate-500 text-sm font-medium mt-2">Arsip pribadi untuk pengalaman yang telah selesai,
                siap digunakan untuk CV atau Portofolio.</p>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-3 space-y-10 pb-8">
            {completedActivities.map((activity) => {
            const displayDate = activity.completedDate || activity.endDate || activity.startDate;

            return (
            <div key={activity.id} className="relative pl-8">
                <div
                    className="absolute w-4 h-4 bg-slate-400 rounded-full -left-[9px] top-1 border-4 border-slate-50 shadow-sm">
                </div>

                <div
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex flex-col mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                            {formatDate(displayDate)}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{activity.title}</h3>
                        <p className="text-sm font-semibold text-indigo-600">{activity.role} <span
                                className="text-slate-500 font-medium">di {activity.org}</span></p>
                    </div>

                    {activity.description && (
                    <p className="text-sm text-slate-600 font-medium mb-4 leading-relaxed">{activity.description}</p>
                    )}

                    {activity.responsibilities && activity.responsibilities.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sorotan Utama
                        </h4>
                        <ul className="space-y-1.5">
                            {activity.responsibilities.map((resp, i) => (
                            <li key={i} className="text-sm text-slate-700 font-medium flex items-start">
                                <span className="text-slate-300 mr-2 mt-0.5 text-xs">■</span>
                                {resp}
                            </li>
                            ))}
                        </ul>
                    </div>
                    )}
                </div>
            </div>
            )
            })}

            {completedActivities.length === 0 && (
            <div className="pl-8 text-slate-500 text-sm font-medium py-10">
                Belum ada pengalaman yang selesai. Teruslah belajar dan berkembang!
            </div>
            )}
        </div>
    </div>
    );
    };

    const ActivityFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
    title: '', type: 'Acara', org: '', role: '', isUpcoming: false, description: '', responsibilities: ''
    });

    useEffect(() => {
    if (isOpen) {
    if (initialData) {
    setFormData({
    title: initialData.title || '',
    type: initialData.type || 'Acara',
    org: initialData.org || '',
    role: initialData.role || '',
    isUpcoming: initialData.status === 'UPCOMING',
    description: initialData.description || '',
    responsibilities: Array.isArray(initialData.responsibilities) ? initialData.responsibilities.join(', ') : (initialData.responsibilities || '')
    });
    } else {
    // Reset form ke nilai awal (pastikan isUpcoming default ke false)
    setFormData({title: '', type: 'Acara', org: '', role: '', isUpcoming: false, description: '', responsibilities: ''});
    }
    }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
    e.preventDefault();
    const activityData = {
    id: isEditing ? initialData.id : generateId(),
    title: formData.title,
    org: formData.org,
    type: formData.type,
    role: formData.role,
    status: isEditing ? (formData.isUpcoming ? 'UPCOMING' : 'NOW') : (formData.isUpcoming ? 'UPCOMING' : 'NOW'),
    regStatus: isEditing ? initialData.regStatus : (formData.isUpcoming ? 'PLANNED' : null),
    startDate: isEditing ? initialData.startDate : (formData.isUpcoming ? null : today.toISOString().split('T')[0]),
    endDate: isEditing ? initialData.endDate : null,
    completedDate: isEditing ? initialData.completedDate : null,
    description: formData.description || '',
    responsibilities: typeof formData.responsibilities === 'string' ? formData.responsibilities.split(/[\n,]+/).map(r=>r.trim()).filter(Boolean) : formData.responsibilities || [],
    tags: isEditing ? initialData.tags : [`#${formData.type.replace(/\s+/g, '')}`],
    notes: isEditing ? initialData.notes : ''
    };
    onSubmit(activityData, isEditing);
    onClose();
    };

    return (
    <div
        className="fixed inset-0 bg-slate-900/40 z-[90] flex flex-col justify-end sm:justify-center sm:p-4 backdrop-blur-sm animate-in fade-in">
        <div
            className="bg-white w-full sm:max-w-md sm:mx-auto rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">{isEditing ? 'Edit Kegiatan' : 'Kegiatan Baru'}</h2>
                <button onClick={onClose}
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Nama
                        Kegiatan</label>
                    <input required type="text" placeholder="mis. Nusantara Fest"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                        value={formData.title} onChange={e=> setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Organisasi</label>
                        <input type="text" placeholder="mis. Google"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                            value={formData.org} onChange={e=> setFormData({...formData, org: e.target.value})}
                        />
                    </div>
                    <div>
                        <label
                            className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Peran/Posisi</label>
                        <input type="text" placeholder="mis. Relawan"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                            value={formData.role} onChange={e=> setFormData({...formData, role: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label
                        className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Jenis</label>
                    <select
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none"
                        value={formData.type} onChange={e=> setFormData({...formData, type: e.target.value})}
                        >
                        {['Organisasi', 'Acara', 'Relawan', 'Kepanitiaan', 'Proyek', 'Kompetisi', 'Pekerjaan', 'Magang',
                        'Pekerjaan Lepas', 'Kegiatan Kampus'].map(t => (
                        <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Deskripsi Singkat</label>
                    <textarea placeholder="mis. Membantu mengembangkan aplikasi..." rows="2"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                        value={formData.description} onChange={e=> setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>
                
                <div>
                    <label
                        className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Tanggung Jawab (Pisahkan dengan koma atau baris baru)</label>
                    <textarea placeholder="mis. Desain UI, Rapat Mingguan, Membuat Laporan" rows="3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                        value={formData.responsibilities} onChange={e=> setFormData({...formData, responsibilities: e.target.value})}
                    ></textarea>
                </div>

                {!isEditing && (
                <div className="pt-2">
                    <label className={`group flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer
                        transition-all duration-200 ease-in-out ${formData.isUpcoming
                        ? 'bg-indigo-50 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50' }`}>
                        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                            <input type="checkbox" className="sr-only" checked={formData.isUpcoming} onChange={e=>
                            setFormData({...formData, isUpcoming: e.target.checked})}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-300 ease-in-out
                                ${formData.isUpcoming ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-slate-400' }`}>
                            </div>
                            <div className={`absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-sm
                                transition-transform duration-300 ease-in-out ${formData.isUpcoming ? 'translate-x-5'
                                : 'translate-x-0' }`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold transition-colors duration-200 ${formData.isUpcoming
                                ? 'text-indigo-700' : 'text-slate-800' }`}>Simpan ke Mendatang</span>
                            <span className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Saya berencana
                                untuk melamar atau bergabung dengan kegiatan ini.</span>
                        </div>
                    </label>
                </div>
                )}

                <button type="submit"
                    className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
                </button>
            </form>
        </div>
    </div>
    );
    };

    const TaskFormModal = ({ isOpen, onClose, onSubmit, initialData, defaultActivityId, activities }) => {
    const isEditing = !!initialData;
    const [title, setTitle] = useState('');
    const [activityId, setActivityId] = useState('');
    const [deadline, setDeadline] = useState(today.toISOString().split('T')[0]);

    useEffect(() => {
    if (isOpen) {
    if (initialData) {
    setTitle(initialData.title || '');
    setActivityId(initialData.activityId || '');
    setDeadline(initialData.deadline || today.toISOString().split('T')[0]);
    } else {
    setActivityId(defaultActivityId || '');
    setTitle('');
    setDeadline(today.toISOString().split('T')[0]);
    }
    }
    }, [isOpen, initialData, defaultActivityId]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
    id: isEditing ? initialData.id : generateId(),
    title,
    activityId: activityId || null,
    deadline,
    isCompleted: isEditing ? initialData.isCompleted : false
    }, isEditing);
    onClose();
    };

    const activeOrUpcomingActivities = activities.filter(a => ['NOW', 'UPCOMING'].includes(a.status));

    return (
    <div
        className="fixed inset-0 bg-slate-900/40 z-[90] flex flex-col justify-end sm:justify-center sm:p-4 backdrop-blur-sm animate-in fade-in">
        <div
            className="bg-white w-full sm:max-w-md sm:mx-auto rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">{isEditing ? 'Edit Tugas' : 'Tugas Baru'}</h2>
                <button onClick={onClose}
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Tugas</label>
                    <input required type="text" placeholder="Apa yang perlu dikerjakan?"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                        value={title} onChange={e=> setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label
                        className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Kegiatan
                        Terkait (Opsional)</label>
                    <select
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium appearance-none"
                        value={activityId} onChange={e=> setActivityId(e.target.value)}
                        >
                        <option value="">-- Tugas Umum --</option>
                        <option value="kerja">Kerja</option>
                        <option value="kuliah">Kuliah</option>
                        {activeOrUpcomingActivities.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Tenggat
                        Waktu</label>
                    <input required type="date"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                        value={deadline} onChange={e=> setDeadline(e.target.value)}
                    />
                </div>
                <button type="submit"
                    className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Tugas'}
                </button>
            </form>
        </div>
    </div>
    );
    };

    export default function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [initialActivityTab, setInitialActivityTab] = useState('NOW');

    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskModalDefaultActivityId, setTaskModalDefaultActivityId] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [activities, setActivities] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [showDailyReminder, setShowDailyReminder] = useState(false);
    const [hasCheckedReminder, setHasCheckedReminder] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
                let avatarUrl = firebaseUser.photoURL;

                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.fullName) fullName = userData.fullName;
                        if (userData.avatarUrl) avatarUrl = userData.avatarUrl;
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    fullName,
                    avatarUrl
                });
                setIsAuthenticated(true);
                
                const fetchedActivities = await supabaseFetchActivities();
                setActivities(fetchedActivities);
                const fetchedTasks = await supabaseFetchTasks();
                setTasks(fetchedTasks);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setActivities([]);
                setTasks([]);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
    if (isAuthenticated && !hasCheckedReminder) {
    const todayTasks = tasks.filter(t => isToday(t.deadline) && !t.isCompleted);
    const todayEvents = activities.filter(a => a.status === 'NOW' && (isToday(a.startDate) || isToday(a.endDate)));

    if (todayTasks.length > 0 || todayEvents.length > 0) {
    setShowDailyReminder(true);
    }
    setHasCheckedReminder(true);
    }
    }, [isAuthenticated, tasks, activities, hasCheckedReminder]);

    const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
    };

    const handleExportCV = () => {
    const completedActivities = activities
    .filter(a => a.status === 'DONE' || (a.status === 'HISTORY' && !['REJECTED', 'CANCELLED'].includes(a.regStatus)))
    .sort((a, b) => new Date(b.completedDate || 0) - new Date(a.completedDate || 0));

    let markdown = "# Pengalaman Profesional\n\n";
    if (completedActivities.length === 0) {
    markdown += "*Belum ada pengalaman yang selesai.*\n";
    } else {
    completedActivities.forEach(act => {
    const endDate = act.completedDate || act.endDate || act.startDate;
    markdown += `### ${act.role} — ${act.org}\n`;
    markdown += `**${act.title}** | *${formatDate(act.startDate, true)} – ${endDate ? formatDate(endDate, true) :
    'Sekarang'}*\n\n`;
    if (act.description) markdown += `${act.description}\n\n`;
    if (act.responsibilities && act.responsibilities.length > 0) {
    act.responsibilities.forEach(r => markdown += `- ${r}\n`);
    markdown += "\n";
    }
    });
    }

    navigator.clipboard.writeText(markdown).then(() => {
    showToast("CV disalin ke papan klip! (Format Markdown)");
    setIsSettingsOpen(false);
    });
    };

    const navigateTo = (view, id = null, tab = 'NOW') => {
    setCurrentView(view);
    if (id) setSelectedActivityId(id);
    if (view === 'activities') setInitialActivityTab(tab);
    window.scrollTo(0, 0);
    };

    const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    supabaseUpdateTask(taskId, { isCompleted: !task.isCompleted });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    const handleSaveActivity = (activityData, isEditing) => {
    if (isEditing) {
    supabaseUpdateActivity(activityData.id, activityData);
    setActivities(activities.map(a => a.id === activityData.id ? activityData : a));
    } else {
    supabaseInsertActivity(activityData);
    setActivities([activityData, ...activities]);
    navigateTo('activities', null, activityData.status);
    }
    setEditingActivity(null);
    };

    const handleSaveTask = (taskData, isEditing) => {
    if (isEditing) {
    supabaseUpdateTask(taskData.id, taskData);
    setTasks(tasks.map(t => t.id === taskData.id ? taskData : t));
    } else {
    supabaseInsertTask(taskData);
    setTasks([...tasks, taskData]);
    }
    setEditingTask(null);
    };

    const handleSaveMultipleTasks = (newTasks) => {
    newTasks.forEach(t => supabaseInsertTask(t));
    setTasks([...tasks, ...newTasks]);
    showToast(`Berhasil menambahkan ${newTasks.length} tugas!`);
    };

    const updateActivityField = (id, updates) => {
    supabaseUpdateActivity(id, updates);
    setActivities(activities.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const executeDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'activity') {
    supabaseDeleteActivity(deleteTarget.id);
    setActivities(activities.filter(a => a.id !== deleteTarget.id));
    setTasks(tasks.filter(t => t.activityId !== deleteTarget.id));
    } else if (deleteTarget.type === 'task') {
    supabaseDeleteTask(deleteTarget.id);
    setTasks(tasks.filter(t => t.id !== deleteTarget.id));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    };

    const confirmDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
    };

    const openEditActivity = (activity) => {
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
    };

    const openEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
    };

    if (!isAuthenticated) {
    return <LoginGate onLogin={(userData)=> { setUser(userData); setIsAuthenticated(true); }} />;
        }

        return (
        <div
            className="w-full max-w-md md:max-w-6xl mx-auto bg-slate-50/50 min-h-screen relative shadow-2xl overflow-hidden font-sans border-x border-slate-100 flex flex-col md:flex-row">
            {toastMessage && (
            <div
                className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
                <div
                    className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center space-x-3 border border-slate-700">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            </div>
            )}

            <SettingsPanel isOpen={isSettingsOpen} onClose={()=> setIsSettingsOpen(false)}
                onLogout={() => {
                supabaseLogout();
                setIsAuthenticated(false);
                setUser(null);
                setHasCheckedReminder(false);
                setIsSettingsOpen(false);
                }}
                onExportCV={handleExportCV}
                user={user}
                onUpdateUser={setUser}
                onToast={showToast}
                />

                <DailyReminderModal isOpen={showDailyReminder} onClose={()=> setShowDailyReminder(false)}
                    todayTasks={tasks.filter(t => isToday(t.deadline) && !t.isCompleted)}
                    todayEvents={activities.filter(a => a.status === 'NOW' && (isToday(a.startDate) ||
                    isToday(a.endDate)))}
                    />

                    <aside
                        className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-8 z-50 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center space-x-3 mb-10 cursor-pointer" onClick={()=>
                            navigateTo('dashboard')}>
                            <div
                                className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-6 shadow-sm">
                                <Briefcase size={20} className="text-white transform -rotate-6" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ANYSPACE</h1>
                        </div>

                        <nav className="flex-1 space-y-3">
                            {[
                            { id: 'dashboard', icon: Home, label: 'Beranda' },
                            { id: 'activities', icon: List, label: 'Kegiatan' },
                            { id: 'experience', icon: HistoryIcon, label: 'Riwayat' }
                            ].map(item => {
                            const isActive = currentView === item.id || (item.id === 'activities' && currentView ===
                            'detail');
                            const Icon = item.icon;
                            return (
                            <button key={item.id} onClick={()=> navigateTo(item.id)} className={`w-full flex
                                items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${isActive ?
                                'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                                <Icon size={22} className={isActive ? "text-white" : "" } />
                                <span>{item.label}</span>
                            </button>
                            )
                            })}
                        </nav>
                    </aside>

                    <main
                        className="flex-1 h-screen overflow-y-auto hide-scrollbar relative pb-24 md:pb-0 bg-slate-50/30">
                        {currentView === 'dashboard' && <Dashboard activities={activities} tasks={tasks}
                            onToggleTask={toggleTask} navigateTo={navigateTo} onOpenSettings={()=>
                            setIsSettingsOpen(true)} user={user} onEditTask={openEditTask} onDeleteTask={(id) =>
                            confirmDelete('task', id)} />}
                            {currentView === 'activities' &&
                            <ActivityList activities={activities} navigateTo={navigateTo}
                                initialTab={initialActivityTab} />}
                            {currentView === 'detail' && <ActivityDetail activityId={selectedActivityId}
                                activities={activities} tasks={tasks} onToggleTask={toggleTask}
                                onUpdateActivity={updateActivityField} onNavigateBack={()=> navigateTo('activities',
                                null, initialActivityTab)} onAddTask={(id) => { setTaskModalDefaultActivityId(id);
                                setEditingTask(null); setIsTaskModalOpen(true); }}
                                onAddMultipleTasks={handleSaveMultipleTasks} onEditActivity={openEditActivity}
                                onDeleteActivity={(id) => confirmDelete('activity', id)} onEditTask={openEditTask}
                                onDeleteTask={(id) => confirmDelete('task', id)} onToast={showToast} />}
                                {currentView === 'experience' &&
                                <ExperienceView activities={activities} />}
                    </main>

                    {['dashboard', 'activities'].includes(currentView) && (
                    <div
                        className="fixed bottom-28 right-6 md:bottom-10 md:right-10 flex flex-col items-end space-y-4 z-40">
                        {currentView === 'dashboard' && (
                        <button onClick={()=> { setEditingTask(null); setTaskModalDefaultActivityId(null);
                            setIsTaskModalOpen(true); }} className="w-14 h-14 bg-white text-indigo-600 rounded-2xl
                            shadow-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50
                            hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-bottom-2">
                            <CheckCircle size={28} />
                        </button>
                        )}
                        <button onClick={()=> { setEditingActivity(null); setIsActivityModalOpen(true); }}
                            className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-300
                            flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95
                            transition-all">
                            <Plus size={32} />
                        </button>
                    </div>
                    )}

                    <nav
                        className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center pb-safe z-40 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
                        {[
                        { id: 'dashboard', icon: Home, label: 'Beranda' },
                        { id: 'activities', icon: List, label: 'Kegiatan' },
                        { id: 'experience', icon: HistoryIcon, label: 'Riwayat' }
                        ].map(item => {
                        const isActive = currentView === item.id || (item.id === 'activities' && currentView ===
                        'detail');
                        const Icon = item.icon;
                        return (
                        <button key={item.id} onClick={()=> navigateTo(item.id)} className={`flex flex-col items-center
                            justify-center w-16 p-2 rounded-xl transition-all duration-300 ${isActive ?
                            'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            <div className={`transition-transform duration-300 ${isActive ? 'transform -translate-y-1'
                                : '' }`}>
                                <Icon size={24} className={isActive ? "drop-shadow-sm" : "" } />
                            </div>
                            <span className={`text-[10px] font-bold mt-1 tracking-wide transition-all duration-300
                                absolute bottom-2 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                }`}>{item.label}</span>
                        </button>
                        )
                        })}
                    </nav>

                    <ActivityFormModal isOpen={isActivityModalOpen} onClose={()=> { setIsActivityModalOpen(false);
                        setEditingActivity(null); }} onSubmit={handleSaveActivity} initialData={editingActivity} />
                        <TaskFormModal isOpen={isTaskModalOpen} onClose={()=> { setIsTaskModalOpen(false);
                            setEditingTask(null); }} onSubmit={handleSaveTask} initialData={editingTask}
                            defaultActivityId={taskModalDefaultActivityId} activities={activities} />

                            <ConfirmModal isOpen={showDeleteConfirm} title="Apakah kamu yakin?"
                                message="Tindakan ini tidak dapat dibatalkan. Apakah kamu yakin ingin menghapus item ini secara permanen?"
                                confirmText="Ya, Hapus" isDestructive={true} onConfirm={executeDelete} onCancel={()=> {
                                setShowDeleteConfirm(false); setDeleteTarget(null); }}
                                />
        </div>
        );
        }