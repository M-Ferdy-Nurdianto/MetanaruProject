import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { fetchMembers, API_URL } from '../../api';
import { members as members_const } from '../../constants';
import { getMemberImageSrc, getMemberFallbackImage } from '../../utils/memberImages';
import { supabase } from '../../supabase';

// Extracted Components
import Sidebar from './components/Sidebar';
import MobileSidebar from './components/MobileSidebar';
import HandbookSection from './components/HandbookSection';
import DashboardSection from './components/DashboardSection';
import OrdersSection from './components/OrdersSection';
import CmsSection from './components/CmsSection';
import ExportSection from './components/ExportSection';
import SettingsSection from './components/SettingsSection';
import EventModal from './components/EventModal';
import OrderEditModal from './components/OrderEditModal';
import ConfirmModal from './components/ConfirmModal';
import OrderDetailsModal from './components/OrderDetailsModal';
import PrivacyModal from './components/PrivacyModal';
import AdminToasts from './components/AdminToasts';
import Loading from '../../components/Loading';

const ADMIN_API = API_URL;
const TAB_LABELS = {
  dashboard: 'Dashboard',
  orders: 'Arsip Pesanan',
  cms: 'Otsu Post',
  export: 'Ekspor Data',
  settings: 'Kontrol Event',
  handbook: 'Panduan Staff'
};

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'dashboard');
  const [exportingId, setExportingId] = useState(null);
  const [exportType, setExportType] = useState(null); // 'excel' or 'pdf'
  const [modalTab, setModalTab] = useState('info'); // 'info' or 'lineup'
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Auth Check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  const activeTabLabel = TAB_LABELS[activeTab] || 'Dashboard';

  if (!isAuthenticated) return null;

  // Persistence for activeTab
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const [editingOTS, setEditingOTS] = useState(null); // Order object being edited
  const [showEditOTSModal, setShowEditOTSModal] = useState(false);

  // -------------------------------------------------------------------------
  // EXPORT HANDLER
  // -------------------------------------------------------------------------
  const handleExport = async (eventId, type) => {
      setExportingId(eventId);
      setExportType(type);
      
      try {
         const response = await fetch(`${API_URL}/orders/export/${type}/${eventId}`);
         if (!response.ok) throw new Error('Export failed');
         
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const eventObj = events.find(e => String(e.id) === String(eventId));
         const nameForFile = eventObj ? eventObj.name.replace(/\s+/g, '_') : 'All';
         const a = document.createElement('a');
         a.href = url;
         a.download = `METANARU_Report_${nameForFile}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
         document.body.appendChild(a);
         a.click();
         a.remove();
         window.URL.revokeObjectURL(url);
         
         showToast(`Laporan ${type.toUpperCase()} berhasil diunduh!`, 'success');
      } catch (error) {
         console.error('Export error:', error);
         showToast('Gagal mengunduh laporan.', 'error');
      } finally {
         setExportingId(null);
         setExportType(null);
      }
   };

  const handleLogout = () => {
    showToast("Sampai jumpa, Admin!");
    setTimeout(() => {
      localStorage.removeItem('isAdminAuthenticated');
      window.location.href = '/';
    }, 1000);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 0px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      @keyframes toast-in {
        from { transform: translateX(100%) scale(0.9); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
      
      @keyframes toast-out {
        from { transform: translateX(0) scale(1); opacity: 1; }
        to { transform: translateX(100%) scale(0.9); opacity: 0; }
      }

      .animate-toast-in {
        animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .animate-toast-out {
        animation: toast-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .toast-glass {
        background: rgba(18, 18, 20, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSavingOTS, setIsSavingOTS] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [isSavingGlobalSettings, setIsSavingGlobalSettings] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isUpdatingOTS, setIsUpdatingOTS] = useState(false);
  
  const [otsForm, setOTSForm] = useState({
    nickname: '',
    contact: '',
    selectedMembers: {},
    payment_method: 'cash',
    cheki_type: 'member', // 'member' or 'group'
    event_id: null
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    po_deadline: '',
    status: 'ongoing',
    type: 'standard', // 'standard' or 'special'
    location: '',
    time: '',
    lineup: ['GROUP'],
    theme: '',
    available_members: ['GROUP'],
    special_solo_price: 30000,
    special_group_price: 35000,
    group_enabled: true
  });

  const [filter, setFilter] = useState(() => {
    const saved = localStorage.getItem('admin_filter');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { status: 'all', event: 'all', search: '' };
      }
    }
    return { status: 'all', event: 'all', search: '' };
  });

  const [eventModal, setEventModal] = useState({
    show: false,
    mode: 'add', // 'add' or 'edit'
    data: null
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProofOnly, setShowProofOnly] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [globalSettings, setGlobalSettings] = useState({
    prices: {
      regular_cheki_solo: 30000,
      regular_cheki_group: 35000
    }
  });

  const formRef = useRef(null);
  const orderIdsRef = useRef(new Set());
  const initialSyncDoneRef = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);
    
    // Set exit animation
    setTimeout(() => {
      setToasts((prev) => prev.map(t => t.id === id ? { ...t, isExiting: true } : t));
    }, 2600);
    
    // Remove from state
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, evRes, setRes, memData] = await Promise.all([
            fetch(`${ADMIN_API}/orders`),
            fetch(`${ADMIN_API}/orders/events`),
            fetch(`${ADMIN_API}/orders/settings`),
        fetchMembers()
      ]);
      
      const ordData = await ordRes.json();
      const evData = await evRes.json();
      const setData = await setRes.json();
      
      setOrders(Array.isArray(ordData) ? ordData : []);
      setEvents(Array.isArray(evData) ? evData : []);
      if (setData && setData.prices) {
        setGlobalSettings(setData);
        // Sinkronkan juga eventForm agar tidak memakai default 30rb/35rb jika data di DB berbeda
        setEventForm(prev => ({
          ...prev,
          special_solo_price: setData.prices.regular_cheki_solo || setData.prices.solo || setData.prices.member || 30000,
          special_group_price: setData.prices.regular_cheki_group || setData.prices.group || 35000
        }));
      }
      
      // Fallback for members & Sort (Main first, NOT SIGNAL last)
      const finalMembers = (memData && memData.length > 0) ? memData : members_const;
      const sortedMembers = [...finalMembers].sort((a, b) => {
        if (a.name === 'NOT SIGNAL' && b.name !== 'NOT SIGNAL') return 1;
        if (a.name !== 'NOT SIGNAL' && b.name === 'NOT SIGNAL') return -1;
        return a.id - b.id;
      });
      setMembersList(sortedMembers);
      
      if (evData.length > 0) {
        // Default to the latest ongoing event
        const ongoingEvents = evData.filter(ev => ev.status === 'ongoing');
        const defaultEventId = ongoingEvents.length > 0 
          ? ongoingEvents[ongoingEvents.length - 1].id 
          : evData[evData.length - 1].id;

        // Check if current filter event exists in evData
        const filterEventExists = filter.event === 'all' || evData.some(ev => String(ev.id) === String(filter.event));
        
        const finalEventId = filterEventExists && filter.event !== 'all' ? filter.event : defaultEventId;

        if (!otsForm.event_id || !filterEventExists) {
          setOTSForm(prev => ({ ...prev, event_id: finalEventId }));
        }

        // Only overwrite filter if it was 'all' or the event no longer exists
        if (filter.event === 'all' || !filterEventExists) {
           setFilter(prev => ({ ...prev, event: finalEventId }));
        } else {
           // Ensure otsForm is in sync with the persistent filter
           setOTSForm(prev => ({ ...prev, event_id: filter.event }));
        }
      }
    } catch (err) {
      console.error("Fetch data failed:", err);
      const errorMessage = err.response?.data?.error || err.message || "Gagal memuat data dari server";
      showToast(`🚨 ERROR: ${errorMessage}`, "error");
      // Try to get more info from the response if possible
      if (err instanceof Response) {
        try {
          const body = await err.text();
          console.error("Error response body:", body);
          showToast(`Server Error: ${body.substring(0, 50)}...`, "error");
        } catch (e) {}
      } else {
        showToast("Koneksi gagal atau data tidak valid", "error");
      }
    } finally {
      setLoading(false);
      initialSyncDoneRef.current = true;
    }
  };

  const refreshOrders = useCallback(async ({ notifyNew = true } = {}) => {
    try {
      const res = await fetch(`${ADMIN_API}/orders`);
      if (!res.ok) return;
      const data = await res.json();

      const prevIds = orderIdsRef.current || new Set();
      const newOrders = data.filter((o) => !prevIds.has(o.id));

      if (notifyNew && initialSyncDoneRef.current && newOrders.length > 0) {
        const poCount = newOrders.filter(o => o.mode !== 'ots').length;
        const otsCount = newOrders.filter(o => o.mode === 'ots').length;
        
        if (poCount > 0 && otsCount > 0) {
          showToast(`${poCount} PO baru & ${otsCount} OTS baru!`, 'success');
        } else if (poCount > 0) {
          showToast(`${poCount} Pesanan Online (PO) Baru!`, 'success');
        } else if (otsCount > 0) {
          showToast(`${otsCount} Pesanan Booth (OTS) Baru!`, 'success');
        }
      }

      orderIdsRef.current = new Set(data.map((o) => o.id));
      setOrders(data);
    } catch (err) {
      console.error('Refresh orders failed:', err);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, []);

  // Persist filter changes
  useEffect(() => {
    localStorage.setItem('admin_filter', JSON.stringify(filter));
  }, [filter]);

  useEffect(() => {
    orderIdsRef.current = new Set(orders.map((o) => o.id));
  }, [orders]);

  useEffect(() => {
    // Real-time listener for orders table
    const channel = supabase
      .channel('admin-orders-live')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, async (payload) => {
        console.log('Real-time order change detected:', payload.eventType);
        await refreshOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshOrders]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      refreshOrders({ notifyNew: true });
    }, 30000);

    return () => clearInterval(id);
  }, [refreshOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);
    try {
         await fetch(`${ADMIN_API}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      const statusLabel = newStatus === 'pending' ? 'Belum dicek' : newStatus === 'paid' ? 'Sudah bayar' : 'Selesai';
      const ref = orders.find((o) => o.id === orderId)?.public_code || orderId;
      showToast(`Pesanan ${ref} berhasil diubah ke ${statusLabel}`);
    } catch (err) {
      showToast("Gagal memperbarui status", "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Helper for OTS Lineup Validation
  const currentEvent = useMemo(() => {
    if (!Array.isArray(events)) return null;
    return events.find(e => String(e.id) === String(filter.event));
  }, [events, filter.event]);

  const selectedOTSEvent = useMemo(() => {
    if (!Array.isArray(events)) return null;
    return events.find(e => String(e.id) === String(otsForm.event_id));
  }, [events, otsForm.event_id]);

  const otsLineup = useMemo(() => {
    if (!selectedOTSEvent) return [];
    const avail = Array.isArray(selectedOTSEvent.available_members) ? selectedOTSEvent.available_members : [];
    const lineup = Array.isArray(selectedOTSEvent.lineup) ? selectedOTSEvent.lineup : [];
    return [...new Set([...avail, ...lineup])].map(n => n?.toUpperCase());
  }, [selectedOTSEvent]);

  const editLineup = useMemo(() => {
    if (!editingOTS?.event_id) return [];
    const editEvent = events.find(e => String(e.id) === String(editingOTS.event_id));
    if (!editEvent) return [];
    const avail = Array.isArray(editEvent.available_members) ? editEvent.available_members : [];
    const lineup = Array.isArray(editEvent.lineup) ? editEvent.lineup : [];
    return [...new Set([...avail, ...lineup])].map(n => n?.toUpperCase());
  }, [events, editingOTS?.event_id]);

  const isMemberInLineup = (nickname) => {
    if (!selectedOTSEvent) return true;
    if (otsLineup.length === 0) return true; // Safety: if no lineup defined, allow all
    const nick = (nickname || '').toUpperCase();
    return otsLineup.some(ln => ln === nick || ln.startsWith(nick) || nick.startsWith(ln));
  };

  const createOTSOrder = async () => {
    if (!otsForm.nickname || Object.keys(otsForm.selectedMembers).length === 0) {
      showToast("Harap isi nama panggilan & pilih member!", "error");
      return;
    }

    const items = Object.entries(otsForm.selectedMembers).map(([name, qty]) => ({
      member_id: name,
      qty: qty
    }));

    const newOrder = {
      ...otsForm,
      items,
      mode: 'ots',
      status: 'paid' // OTS is always paid immediately
    };

    setIsSavingOTS(true);
    try {
         const res = await fetch(`${ADMIN_API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (res.ok) {
        showToast("Pesanan Booth Berhasil Dibuat!");
        setOTSForm(prev => ({
          ...prev,
          nickname: '',
          contact: '',
          selectedMembers: {}, 
          payment_method: 'cash'
        }));
        fetchData();
      }
    } catch (err) {
      showToast("Gagal membuat pesanan booth", "error");
    } finally {
      setIsSavingOTS(false);
    }
  };

  const toggleMember = (name) => {
    setOTSForm(prev => ({
      ...prev,
      selectedMembers: {
        ...prev.selectedMembers,
        [name]: (prev.selectedMembers[name] || 0) + 1
      }
    }));
  };

  const decrementMember = (e, name) => {
    e.preventDefault();
    setOTSForm(prev => {
      const newSelected = { ...prev.selectedMembers };
      if (newSelected[name] > 1) {
        newSelected[name] -= 1;
      } else {
        delete newSelected[name];
      }
      return { ...prev, selectedMembers: newSelected };
    });
  };

  const resetSelection = () => {
    setOTSForm(prev => ({ ...prev, selectedMembers: {} }));
  };

  const updateGlobalSettings = async () => {
    setIsSavingGlobalSettings(true);
    try {
      const response = await fetch(`${ADMIN_API}/orders/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: globalSettings.prices })
      });
      // Simulasi delay sedikit untuk memunculkan animasi loading
      await new Promise(resolve => setTimeout(resolve, 600));
      if (response.ok) {
        showToast("Harga standar berhasil diperbarui.", "success");
      } else {
        showToast("Gagal memperbarui harga (Respons Server).", "error");
      }
    } catch (err) {
      showToast("Gagal memperbarui harga (Koneksi Error).", "error");
    } finally {
      setIsSavingGlobalSettings(false);
    }
  };

  const handleEventSubmit = async () => {
    if (!eventForm.name || !eventForm.date) return;
    setIsSavingEvent(true);
    try {
      const url = eventModal.mode === 'add' 
            ? `${ADMIN_API}/orders/events` 
            : `${ADMIN_API}/orders/events/${eventModal.data.id}`;
      
      const method = eventModal.mode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        showToast(`Event berhasil ${eventModal.mode === 'add' ? 'dibuat' : 'diperbarui'}!`);
        fetchData();
        setEventModal({ show: false, mode: 'add', data: null });
        setEventForm({ 
          name: '', date: '', po_deadline: '', status: 'ongoing', 
          type: 'standard', location: '', time: '', lineup: ['GROUP'],
          theme: '', available_members: ['GROUP'], 
          special_solo_price: 30000, special_group_price: 35000, group_enabled: true
        });
      }
    } catch (err) {
      showToast("Gagal memproses data event", "error");
    } finally {
      setIsSavingEvent(false);
    }
  };

  const openEventModal = (mode = 'add', data = null) => {
    setEventModal({ show: true, mode, data });
    setModalTab('info');
    if (data) {
      setEventForm({
        name: data.name,
        date: data.event_date || '',
        po_deadline: data.po_deadline || '',
        status: data.status,
        type: data.type === 'regular' ? 'standard' : 'special',
        location: data.location || '',
        time: data.event_time || '',
        lineup: data.lineup || ['GROUP'],
        theme: data.theme || '',
        available_members: data.available_members || ['GROUP'],
        special_solo_price: data.special_prices?.solo || 30000,
        special_group_price: data.special_prices?.group || 35000,
        group_enabled: true
      });
      // Scroll to form
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
       setEventForm({ 
          name: '', date: '', po_deadline: '', status: 'ongoing', 
          type: 'standard', location: '', time: '', lineup: ['GROUP'],
          theme: '', available_members: ['GROUP'], 
          special_solo_price: 30000, special_group_price: 35000, group_enabled: true
       });
    }
  };

  const deleteEvent = async (id) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Event',
      message: 'PERINGATAN: Menghapus event akan menghapus semua data pesanan terkait secara permanen. Sistem akan OTOMATIS mengunduh laporan Excel & PDF sebagai cadangan sebelum menghapus data.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setDeletingId(id);
        try {
          // 1. Trigger Auto-Downloads
          showToast("Menyiapkan laporan cadangan...");
          
          // Excel
          window.open(`${ADMIN_API}/orders/export/excel/${id}`, '_blank');
          
          // PDF (with slight delay to prevent pop-up blocking)
          setTimeout(() => {
            window.open(`${ADMIN_API}/orders/export/pdf/${id}`, '_blank');
          }, 800);

          // 2. Small delay to ensure browser initiates downloads
          await new Promise(resolve => setTimeout(resolve, 2500));

          // 3. Delete from DB
          const res = await fetch(`${ADMIN_API}/orders/events/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast("Event berhasil dihapus secara permanen.");
            showToast("Data cadangan (Excel & PDF) telah diunduh.", "info");
            fetchData();
          } else {
            showToast("Gagal menghapus event", "error");
          }
        } catch (err) {
          showToast("Terjadi kesalahan sistem", "error");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const deleteOrder = async (id) => {
    const order = orders.find(o => o.id === id);
    const refName = order?.nickname || order?.public_code || id;
    
    setConfirmModal({
      show: true,
      title: 'Hapus Pesanan',
      message: `Apakah Anda yakin ingin menghapus pesanan atas nama "${refName}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setDeletingId(id);
        try {
          const res = await fetch(`${ADMIN_API}/orders/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast("Pesanan berhasil dihapus.");
            fetchData();
          } else {
            const data = await res.json();
            showToast(data.error || "Gagal menghapus pesanan", "error");
          }
        } catch (err) {
          showToast("Terjadi kesalahan sistem", "error");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleEditOTSSubmit = async (e) => {
    e.preventDefault();
    if (!editingOTS) return;
    
    setIsUpdatingOTS(true);
    try {
      const res = await fetch(`${ADMIN_API}/orders/${editingOTS.id}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: editingOTS.nickname,
          contact: editingOTS.contact,
          items: editingOTS.items,
          payment_method: editingOTS.payment_method,
          note: editingOTS.note,
          event_id: editingOTS.event_id
        })
      });

      if (res.ok) {
        showToast("Data pesanan berhasil diperbarui!");
        setShowEditOTSModal(false);
        setEditingOTS(null);
        fetchData();
      } else {
        showToast("Gagal memperbarui pesanan", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setIsUpdatingOTS(false);
    }
  };

  // Merge all orders into one unified list for the archive
  const allMergedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
  const otsOrders = orders.filter(o => o.mode === 'ots');
  const onlineOrders = orders.filter(o => o.mode !== 'ots');

  const filterList = (list) => list.filter(order => {
    const matchesStatus = filter.status === 'all' || order.status === filter.status;
    const matchesEvent = filter.event === 'all' || (order.event_id && order.event_id == filter.event);

    const matchesSearch = !filter.search ||
      order.nickname?.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.id.toString().includes(filter.search) ||
      (order.public_code && order.public_code.toLowerCase().includes(filter.search.toLowerCase()));
    return matchesStatus && matchesEvent && matchesSearch;
  });

  if (loading) return <Loading />;

  return (
    <div className="h-[100dvh] admin-metal text-white flex relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 metal-grid" />
      <div className="pointer-events-none absolute inset-0 metal-noise" />
      <div className="pointer-events-none absolute -top-24 left-0 right-0 h-72 metal-sheen" />
      
      {/* Mobile Menu Button - Responsive */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-6 right-6 z-[200] w-12 h-12 rounded-full flex items-center justify-center border border-white/20 bg-gradient-to-br from-[#FF0033] via-[#C80029] to-[#6B0015] shadow-[0_0_30px_rgba(255,0,51,0.55)] active:scale-90 transition-all"
      >
        <Menu size={24} />
      </button>

      <MobileSidebar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-56 min-w-0 p-3 sm:p-4 md:p-6 lg:pl-10 lg:pr-10 lg:pt-8 lg:pb-12 relative z-10 overflow-y-auto custom-scrollbar h-full">
        <div className="mb-6 sm:mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="metal-kicker">Metanaru Admin Metal Core</p>
              <h1 className="metal-title text-2xl sm:text-3xl md:text-4xl leading-none">
                {activeTabLabel}
              </h1>
            </div>
            <div className="metal-chip">
              <span>Active Module</span>
              <span>{activeTabLabel}</span>
            </div>
          </div>
          <div className="metal-divider" />
        </div>
        {activeTab === 'dashboard' && (
          <DashboardSection
            filter={filter}
            setFilter={setFilter}
            events={events}
            orders={orders}
            otsOrders={otsOrders}
            onlineOrders={onlineOrders}
            setOTSForm={setOTSForm}
            otsForm={otsForm}
            membersList={membersList}
            isMemberInLineup={isMemberInLineup}
            toggleMember={toggleMember}
            decrementMember={decrementMember}
            resetSelection={resetSelection}
            createOTSOrder={createOTSOrder}
            isSavingOTS={isSavingOTS}
            updateStatus={updateStatus}
            setEditingOTS={setEditingOTS}
            setShowEditOTSModal={setShowEditOTSModal}
            deleteOrder={deleteOrder}
            deletingId={deletingId}
            setSelectedOrder={setSelectedOrder}
            setShowProofOnly={setShowProofOnly}
            setActiveTab={setActiveTab}
            filterList={filterList}
            otsLineup={otsLineup}
          />
        )}
        
        {activeTab === 'orders' && (
          <OrdersSection
            filter={filter}
            setFilter={setFilter}
            events={events}
            allMergedOrders={allMergedOrders}
            onlineOrders={onlineOrders}
            updateStatus={updateStatus}
            setEditingOTS={setEditingOTS}
            setShowEditOTSModal={setShowEditOTSModal}
            deleteOrder={deleteOrder}
            deletingId={deletingId}
            filterList={filterList}
          />
        )}

        {activeTab === 'cms' && (
          <CmsSection
            membersList={membersList}
            getMemberImageSrc={getMemberImageSrc}
            getMemberFallbackImage={getMemberFallbackImage}
            showToast={showToast}
            setConfirmModal={setConfirmModal}
          />
        )}

        {activeTab === 'export' && (
          <ExportSection
            filter={filter}
            setFilter={setFilter}
            events={events}
            exportingId={exportingId}
            exportType={exportType}
            handleExport={handleExport}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsSection
            formRef={formRef}
            eventForm={eventForm}
            setEventForm={setEventForm}
            eventModal={eventModal}
            setEventModal={setEventModal}
            membersList={membersList}
            globalSettings={globalSettings}
            setGlobalSettings={setGlobalSettings}
            updateGlobalSettings={updateGlobalSettings}
            isSavingGlobalSettings={isSavingGlobalSettings}
            handleEventSubmit={handleEventSubmit}
            isSavingEvent={isSavingEvent}
            events={events}
            handleExport={handleExport}
            exportingId={exportingId}
            exportType={exportType}
            openEventModal={openEventModal}
            deleteEvent={deleteEvent}
            deletingId={deletingId}
          />
        )}

        {activeTab === "handbook" && <HandbookSection />}
      </main>

      {/* Modals */}

      <OrderEditModal 
        showEditOTSModal={showEditOTSModal}
        setShowEditOTSModal={setShowEditOTSModal}
        editingOTS={editingOTS}
        setEditingOTS={setEditingOTS}
        handleEditOTSSubmit={handleEditOTSSubmit}
        isUpdatingOTS={isUpdatingOTS}
        membersList={membersList}
        eventLineup={editLineup}
      />

      <EventModal 
        eventModal={eventModal}
        setEventModal={setEventModal}
        modalTab={modalTab}
        setModalTab={setModalTab}
        eventForm={eventForm}
        setEventForm={setEventForm}
        membersList={membersList}
        handleEventSubmit={handleEventSubmit}
        isSavingEvent={isSavingEvent}
        globalSettings={globalSettings}
      />

      <ConfirmModal 
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />

      <OrderDetailsModal 
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        showProofOnly={showProofOnly}
        setShowProofOnly={setShowProofOnly}
        statusUpdatingId={statusUpdatingId}
        updateStatus={updateStatus}
      />

      <PrivacyModal 
        showPrivacyModal={showPrivacyModal}
        setShowPrivacyModal={setShowPrivacyModal}
      />

      <AdminToasts toasts={toasts} />
    </div>
  );
};

export default Admin;
