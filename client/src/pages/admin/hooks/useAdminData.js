import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMembers, API_URL } from '../../../api';
import { members as members_const } from '../../../constants';
import { supabase } from '../../../supabase';

const ADMIN_API = API_URL;

export const useAdminData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'dashboard');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [exportingId, setExportingId] = useState(null);
  const [exportType, setExportType] = useState(null);
  const [modalTab, setModalTab] = useState('info');
  const [editingOTS, setEditingOTS] = useState(null);
  const [showEditOTSModal, setShowEditOTSModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSavingOTS, setIsSavingOTS] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [isSavingGlobalSettings, setIsSavingGlobalSettings] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isUpdatingOTS, setIsUpdatingOTS] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProofOnly, setShowProofOnly] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [otsForm, setOTSForm] = useState({
    nickname: '',
    contact: '',
    selectedMembers: {},
    payment_method: 'cash',
    cheki_type: 'member',
    event_id: null
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    po_deadline: '',
    status: 'ongoing',
    type: 'standard',
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
      try { return JSON.parse(saved); } catch (e) { return { status: 'all', event: 'all', search: '' }; }
    }
    return { status: 'all', event: 'all', search: '' };
  });

  const [eventModal, setEventModal] = useState({
    show: false,
    mode: 'add',
    data: null
  });

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [globalSettings, setGlobalSettings] = useState({
    prices: {
      regular_cheki_solo: 30000,
      regular_cheki_group: 35000
    }
  });

  const orderIdsRef = useRef(new Set());
  const initialSyncDoneRef = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map(t => t.id === id ? { ...t, isExiting: true } : t));
    }, 2600);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
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
        setEventForm(prev => ({
          ...prev,
          special_solo_price: setData.prices.regular_cheki_solo || setData.prices.solo || setData.prices.member || 30000,
          special_group_price: setData.prices.regular_cheki_group || setData.prices.group || 35000
        }));
      }
      
      const finalMembers = (memData && memData.length > 0) ? memData : members_const;
      const sortedMembers = [...finalMembers].sort((a, b) => {
        if (a.name === 'NOT SIGNAL' && b.name !== 'NOT SIGNAL') return 1;
        if (a.name !== 'NOT SIGNAL' && b.name === 'NOT SIGNAL') return -1;
        return a.id - b.id;
      });
      setMembersList(sortedMembers);
      
      if (evData.length > 0) {
        const ongoingEvents = evData.filter(ev => ev.status === 'ongoing');
        const defaultEventId = ongoingEvents.length > 0 ? ongoingEvents[ongoingEvents.length - 1].id : evData[evData.length - 1].id;
        const filterEventExists = filter.event === 'all' || evData.some(ev => String(ev.id) === String(filter.event));
        const finalEventId = filterEventExists && filter.event !== 'all' ? filter.event : defaultEventId;

        if (!otsForm.event_id || !filterEventExists) {
          setOTSForm(prev => ({ ...prev, event_id: finalEventId }));
        }
        if (filter.event === 'all' || !filterEventExists) {
          setFilter(prev => ({ ...prev, event: finalEventId }));
        } else {
          setOTSForm(prev => ({ ...prev, event_id: filter.event }));
        }
      }
    } catch (err) {
      console.error("Fetch data failed:", err);
      showToast(`🚨 ERROR: ${err.message || "Gagal memuat data"}`, "error");
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
        if (poCount > 0 && otsCount > 0) showToast(`${poCount} PO baru & ${otsCount} OTS baru!`);
        else if (poCount > 0) showToast(`${poCount} Pesanan Online (PO) Baru!`);
        else if (otsCount > 0) showToast(`${otsCount} Pesanan Booth (OTS) Baru!`);
      }
      orderIdsRef.current = new Set(data.map((o) => o.id));
      setOrders(data);
    } catch (err) { console.error('Refresh orders failed:', err); }
  }, [showToast]);

  return {
    activeTab, setActiveTab,
    loading, setLoading,
    orders, setOrders,
    events, setEvents,
    membersList, setMembersList,
    toasts, setToasts,
    exportingId, setExportingId,
    exportType, setExportType,
    modalTab, setModalTab,
    editingOTS, setEditingOTS,
    showEditOTSModal, setShowEditOTSModal,
    mobileMenuOpen, setMobileMenuOpen,
    isSavingOTS, setIsSavingOTS,
    isSavingEvent, setIsSavingEvent,
    statusUpdatingId, setStatusUpdatingId,
    isSavingGlobalSettings, setIsSavingGlobalSettings,
    deletingId, setDeletingId,
    isUpdatingOTS, setIsUpdatingOTS,
    selectedOrder, setSelectedOrder,
    showProofOnly, setShowProofOnly,
    showPrivacyModal, setShowPrivacyModal,
    otsForm, setOTSForm,
    eventForm, setEventForm,
    filter, setFilter,
    eventModal, setEventModal,
    confirmModal, setConfirmModal,
    globalSettings, setGlobalSettings,
    showToast,
    fetchData,
    refreshOrders
  };
};
