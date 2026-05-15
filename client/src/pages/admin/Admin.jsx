import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { getMemberImageSrc, getMemberFallbackImage } from '../../utils/memberImages';
import { supabase } from '../../supabase';
import './Admin.css';

// Hooks
import { useAdminData } from './hooks/useAdminData';
import { useAdminActions } from './hooks/useAdminActions';

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
import MerchSection from './components/MerchSection';
import Loading from '../../components/Loading';

const TAB_LABELS = {
  dashboard: 'Dashboard',
  orders: 'Arsip Pesanan',
  merch: 'Merchandise',
  cms: 'Otsu Post',
  export: 'Ekspor Data',
  settings: 'Kontrol Event',
  handbook: 'Panduan Staff'
};

const Admin = () => {
  const navigate = useNavigate();
  const data = useAdminData();
  const actions = useAdminActions({ ...data });

  const {
    activeTab, setActiveTab, loading, orders, events, membersList, toasts,
    exportingId, setExportingId, exportType, setExportType, modalTab, setModalTab,
    editingOTS, setEditingOTS, showEditOTSModal, setShowEditOTSModal,
    mobileMenuOpen, setMobileMenuOpen, isSavingOTS, isSavingEvent,
    statusUpdatingId, isSavingGlobalSettings, deletingId, isUpdatingOTS,
    selectedOrder, setSelectedOrder, showProofOnly, setShowProofOnly,
    showPrivacyModal, setShowPrivacyModal, otsForm, setOTSForm,
    eventForm, setEventForm, filter, setFilter, eventModal, setEventModal,
    confirmModal, setConfirmModal, globalSettings, setGlobalSettings, showToast, fetchData, refreshOrders
  } = data;

  const {
    updateStatus, createOTSOrder, deleteOrder, handleEventSubmit,
    deleteEvent, handleExport, updateGlobalSettings, handleEditOTSSubmit
  } = actions;

  // Auth Check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) navigate('/login');
  }, [navigate]);

  // Persistence for activeTab & filter
  useEffect(() => { localStorage.setItem('adminActiveTab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('admin_filter', JSON.stringify(filter)); }, [filter]);

  // Real-time listener
  useEffect(() => {
    const channel = supabase.channel('admin-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refreshOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refreshOrders]);

  // Polling fallback
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refreshOrders({ notifyNew: true });
    }, 30000);
    return () => clearInterval(id);
  }, [refreshOrders]);

  // Initialize
  useEffect(() => { fetchData(); }, []);

  // Helpers
  const handleLogout = () => {
    showToast("Sampai jumpa, Admin!");
    setTimeout(() => {
      localStorage.removeItem('isAdminAuthenticated');
      window.location.href = '/';
    }, 1000);
  };

  const currentEvent = useMemo(() => events.find(e => String(e.id) === String(filter.event)), [events, filter.event]);
  const selectedOTSEvent = useMemo(() => events.find(e => String(e.id) === String(otsForm.event_id)), [events, otsForm.event_id]);
  
  const otsLineup = useMemo(() => {
    if (!selectedOTSEvent) return [];
    const avail = selectedOTSEvent.available_members || [];
    const lineup = selectedOTSEvent.lineup || [];
    return [...new Set([...avail, ...lineup])].map(n => n?.toUpperCase());
  }, [selectedOTSEvent]);

  const editLineup = useMemo(() => {
    const editEvent = events.find(e => String(e.id) === String(editingOTS?.event_id));
    if (!editEvent) return [];
    const avail = editEvent.available_members || [];
    const lineup = editEvent.lineup || [];
    return [...new Set([...avail, ...lineup])].map(n => n?.toUpperCase());
  }, [events, editingOTS?.event_id]);

  const isMemberInLineup = (nickname) => {
    if (!selectedOTSEvent || otsLineup.length === 0) return true;
    const nick = (nickname || '').toUpperCase();
    return otsLineup.some(ln => ln === nick || ln.startsWith(nick) || nick.startsWith(ln));
  };

  const toggleMember = (name) => {
    setOTSForm(prev => ({
      ...prev, selectedMembers: { ...prev.selectedMembers, [name]: (prev.selectedMembers[name] || 0) + 1 }
    }));
  };

  const decrementMember = (e, name) => {
    e.preventDefault();
    setOTSForm(prev => {
      const newSelected = { ...prev.selectedMembers };
      if (newSelected[name] > 1) newSelected[name] -= 1;
      else delete newSelected[name];
      return { ...prev, selectedMembers: newSelected };
    });
  };

  const openEventModal = (mode = 'add', data = null) => {
    setEventModal({ show: true, mode, data });
    setModalTab('info');
    if (data) {
      setEventForm({
        name: data.name, date: data.event_date || '', po_deadline: data.po_deadline || '',
        status: data.status, type: data.type === 'regular' ? 'standard' : 'special',
        location: data.location || '', time: data.event_time || '', lineup: data.lineup || ['GROUP'],
        theme: data.theme || '', available_members: data.available_members || ['GROUP'],
        special_solo_price: data.special_prices?.solo || 30000,
        special_group_price: data.special_prices?.group || 35000, group_enabled: true
      });
    } else {
      setEventForm({ 
        name: '', date: '', po_deadline: '', status: 'ongoing', type: 'standard', 
        location: '', time: '', lineup: ['GROUP'], theme: '', available_members: ['GROUP'], 
        special_solo_price: 30000, special_group_price: 35000, group_enabled: true
      });
    }
  };

  const filterList = (list) => list.filter(order => {
    const matchesStatus = filter.status === 'all' || order.status === filter.status;
    const matchesEvent = filter.event === 'all' || (order.event_id && order.event_id == filter.event);
    const matchesSearch = !filter.search || order.nickname?.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.id.toString().includes(filter.search) || (order.public_code && order.public_code.toLowerCase().includes(filter.search.toLowerCase()));
    return matchesStatus && matchesEvent && matchesSearch;
  });

  const activeTabLabel = TAB_LABELS[activeTab] || 'Dashboard';
  const allMergedOrders = [...orders].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const otsOrders = orders.filter(o => o.mode === 'ots');
  const onlineOrders = orders.filter(o => o.mode !== 'ots');

  if (loading) return <Loading />;
  if (localStorage.getItem('isAdminAuthenticated') !== 'true') return null;

  return (
    <div className="h-[100dvh] admin-metal text-white flex relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 metal-grid" />
      <div className="pointer-events-none absolute inset-0 metal-noise" />
      <div className="pointer-events-none absolute -top-24 left-0 right-0 h-72 metal-sheen" />
      
      <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden fixed top-6 right-6 z-[200] w-12 h-12 rounded-full flex items-center justify-center border border-white/20 bg-gradient-to-br from-[#FF0033] via-[#C80029] to-[#6B0015] shadow-[0_0_30px_rgba(255,0,51,0.55)]">
        <Menu size={24} />
      </button>

      <MobileSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setMobileMenuOpen={setMobileMenuOpen} handleLogout={handleLogout} />

      <main className="flex-1 lg:ml-5 min-w-0 p-4 lg:p-8 lg:pl-8 relative z-10 overflow-y-auto custom-scrollbar h-full">
        <div className="mb-6 sm:mb-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="metal-kicker">Metanaru Admin Metal Core</p>
              <h1 className="metal-title text-2xl sm:text-3xl md:text-4xl leading-none">{activeTabLabel}</h1>
            </div>
            <div className="metal-chip"><span>Active Module</span><span>{activeTabLabel}</span></div>
          </div>
          <div className="metal-divider" />
        </div>

        {activeTab === 'dashboard' && (
          <DashboardSection filter={filter} setFilter={setFilter} events={events} orders={orders} otsOrders={otsOrders} onlineOrders={onlineOrders}
            setOTSForm={setOTSForm} otsForm={otsForm} membersList={membersList} isMemberInLineup={isMemberInLineup} toggleMember={toggleMember}
            decrementMember={decrementMember} resetSelection={() => setOTSForm(prev => ({ ...prev, selectedMembers: {} }))}
            createOTSOrder={createOTSOrder} isSavingOTS={isSavingOTS} updateStatus={updateStatus} setEditingOTS={setEditingOTS}
            setShowEditOTSModal={setShowEditOTSModal} deleteOrder={deleteOrder} deletingId={deletingId} setSelectedOrder={setSelectedOrder}
            setShowProofOnly={setShowProofOnly} setActiveTab={setActiveTab} filterList={filterList} otsLineup={otsLineup}
          />
        )}
        
        {activeTab === 'orders' && (
          <OrdersSection filter={filter} setFilter={setFilter} events={events} allMergedOrders={allMergedOrders} onlineOrders={onlineOrders}
            updateStatus={updateStatus} setEditingOTS={setEditingOTS} setShowEditOTSModal={setShowEditOTSModal} deleteOrder={deleteOrder}
            deletingId={deletingId} filterList={filterList}
          />
        )}

        {activeTab === 'cms' && (
          <CmsSection membersList={membersList} getMemberImageSrc={getMemberImageSrc} getMemberFallbackImage={getMemberFallbackImage}
            showToast={showToast} setConfirmModal={setConfirmModal}
          />
        )}

        {activeTab === 'export' && (
          <ExportSection filter={filter} setFilter={setFilter} events={events} exportingId={exportingId} exportType={exportType}
            handleExport={(id, type) => handleExport(id, type, setExportingId, setExportType)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsSection eventForm={eventForm} setEventForm={setEventForm} eventModal={eventModal} setEventModal={setEventModal}
            membersList={membersList} globalSettings={globalSettings} setGlobalSettings={setGlobalSettings}
            updateGlobalSettings={() => updateGlobalSettings(globalSettings)} isSavingGlobalSettings={isSavingGlobalSettings}
            handleEventSubmit={() => handleEventSubmit(eventForm, eventModal)} isSavingEvent={isSavingEvent} events={events}
            handleExport={(id, type) => handleExport(id, type, setExportingId, setExportType)} exportingId={exportingId}
            exportType={exportType} openEventModal={openEventModal} deleteEvent={deleteEvent} deletingId={deletingId}
          />
        )}

        {activeTab === 'merch' && (
          <MerchSection showToast={showToast} />
        )}

        {activeTab === "handbook" && <HandbookSection />}
      </main>

      <OrderEditModal showEditOTSModal={showEditOTSModal} setShowEditOTSModal={setShowEditOTSModal} editingOTS={editingOTS}
        setEditingOTS={setEditingOTS} handleEditOTSSubmit={(e) => { e.preventDefault(); handleEditOTSSubmit(editingOTS, setEditingOTS, setShowEditOTSModal); }}
        isUpdatingOTS={isUpdatingOTS} membersList={membersList} eventLineup={editLineup}
      />

      <EventModal eventModal={eventModal} setEventModal={setEventModal} modalTab={modalTab} setModalTab={setModalTab}
        eventForm={eventForm} setEventForm={setEventForm} membersList={membersList}
        handleEventSubmit={() => handleEventSubmit(eventForm, eventModal)} isSavingEvent={isSavingEvent} globalSettings={globalSettings}
      />

      <ConfirmModal confirmModal={confirmModal} setConfirmModal={setConfirmModal} />
      <OrderDetailsModal selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} showProofOnly={showProofOnly}
        setShowProofOnly={setShowProofOnly} statusUpdatingId={statusUpdatingId} updateStatus={updateStatus}
      />
      <PrivacyModal showPrivacyModal={showPrivacyModal} setShowPrivacyModal={setShowPrivacyModal} />
      <AdminToasts toasts={toasts} />
    </div>
  );
};

export default Admin;
