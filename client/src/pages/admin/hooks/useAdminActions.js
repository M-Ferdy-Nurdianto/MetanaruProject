import { useCallback } from 'react';
import { API_URL } from '../../../api';

const ADMIN_API = API_URL;

export const useAdminActions = ({
  setOrders,
  setEvents,
  showToast,
  fetchData,
  orders,
  events,
  setConfirmModal,
  setDeletingId,
  setStatusUpdatingId,
  setIsSavingGlobalSettings,
  setIsSavingEvent,
  setIsSavingOTS,
  setIsUpdatingOTS,
  setEditingOTS,
  setShowEditOTSModal,
  setEventModal,
  setEventForm,
  otsForm,
  setOTSForm,
  globalSettings
}) => {

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

  const createOTSOrder = async () => {
    if (!otsForm.nickname || Object.keys(otsForm.selectedMembers).length === 0) {
      showToast("Harap isi nama panggilan & pilih member!", "error");
      return;
    }
    const items = Object.entries(otsForm.selectedMembers).map(([name, qty]) => ({
      member_id: name,
      qty: qty
    }));
    const newOrder = { ...otsForm, items, mode: 'ots', status: 'paid' };
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
          ...prev, nickname: '', contact: '', selectedMembers: {}, payment_method: 'cash'
        }));
        fetchData();
      }
    } catch (err) {
      showToast("Gagal membuat pesanan booth", "error");
    } finally {
      setIsSavingOTS(false);
    }
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
          const res = await fetch(`${ADMIN_API}/orders/${id}`, { method: 'DELETE' });
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

  const handleEventSubmit = async (eventForm, eventModal) => {
    if (!eventForm.name || !eventForm.date) return;
    setIsSavingEvent(true);
    try {
      const url = eventModal.mode === 'add' ? `${ADMIN_API}/orders/events` : `${ADMIN_API}/orders/events/${eventModal.data.id}`;
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
          name: '', date: '', po_deadline: '', status: 'ongoing', type: 'standard', 
          location: '', time: '', lineup: ['GROUP'], theme: '', available_members: ['GROUP'], 
          special_solo_price: 30000, special_group_price: 35000, group_enabled: true
        });
      }
    } catch (err) {
      showToast("Gagal memproses data event", "error");
    } finally {
      setIsSavingEvent(false);
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
          showToast("Menyiapkan laporan cadangan...");
          window.open(`${ADMIN_API}/orders/export/excel/${id}`, '_blank');
          setTimeout(() => { window.open(`${ADMIN_API}/orders/export/pdf/${id}`, '_blank'); }, 800);
          await new Promise(resolve => setTimeout(resolve, 2500));
          const res = await fetch(`${ADMIN_API}/orders/events/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast("Event berhasil dihapus secara permanen.");
            fetchData();
          }
        } catch (err) { showToast("Terjadi kesalahan sistem", "error"); }
        finally { setDeletingId(null); }
      }
    });
  };

  const handleExport = async (eventId, type, setExportingId, setExportType) => {
    setExportingId(eventId);
    setExportType(type);
    try {
      const response = await fetch(`${ADMIN_API}/orders/export/${type}/${eventId}`);
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

  const updateGlobalSettings = async (globalSettings) => {
    setIsSavingGlobalSettings(true);
    try {
      const response = await fetch(`${ADMIN_API}/orders/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: globalSettings.prices })
      });
      await new Promise(resolve => setTimeout(resolve, 600));
      if (response.ok) showToast("Harga standar berhasil diperbarui.", "success");
      else showToast("Gagal memperbarui harga.", "error");
    } catch (err) { showToast("Gagal memperbarui harga.", "error"); }
    finally { setIsSavingGlobalSettings(false); }
  };

  const handleEditOTSSubmit = async (editingOTS, setEditingOTS, setShowEditOTSModal) => {
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
      } else showToast("Gagal memperbarui pesanan", "error");
    } catch (err) { showToast("Terjadi kesalahan sistem", "error"); }
    finally { setIsUpdatingOTS(false); }
  };

  return {
    updateStatus,
    createOTSOrder,
    deleteOrder,
    handleEventSubmit,
    deleteEvent,
    handleExport,
    updateGlobalSettings,
    handleEditOTSSubmit
  };
};
