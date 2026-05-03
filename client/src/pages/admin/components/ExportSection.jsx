import React from 'react';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import METANARUSelect from './METANARUSelect';
import { eventOptionBadge } from '../utils';

const ExportSection = ({
  filter,
  setFilter,
  events,
  exportingId,
  exportType,
  handleExport
}) => (
  <div className="max-w-4xl space-y-8">
    <div className="border-l-4 border-white pb-2 pl-4">
      <h2 className="text-2xl font-bold uppercase mb-1">Ekspor Laporan</h2>
      <p className="text-xs text-white/40 uppercase tracking-widest">Buat laporan resmi</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Excel Card */}
      <div className="bg-[#121214] border border-white/10 p-6 rounded-xl hover:bg-white/5 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
          <FileSpreadsheet size={20} />
        </div>
        <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Laporan Excel</h3>
        <p className="text-xs text-white/30 mb-6">Ekspor data lengkap ke format Excel (.xlsx)</p>

        <div className="space-y-4">
          <METANARUSelect 
            value={filter.event}
            onChange={val => setFilter(prev => ({...prev, event: val}))}
            placeholder="Pilih Event"
            className="w-full"
            options={[
              { value: 'all', label: 'Semua Event' },
              ...events.map((ev) => {
                const { badge, badgeKind } = eventOptionBadge(ev);
                return { value: ev.id, label: ev.name, badge, badgeKind };
              })
            ]}
          />
          <button 
            disabled={exportingId === filter.event && exportType === 'excel'}
            onClick={() => handleExport(filter.event, 'excel')}
            className={`w-full py-3 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${exportingId === filter.event && exportType === 'excel' ? 'bg-green-800 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'}`}
          >
            {exportingId === filter.event && exportType === 'excel' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} 
            {exportingId === filter.event && exportType === 'excel' ? 'Mengunduh...' : 'Unduh Excel'}
          </button>
        </div>
      </div>

      {/* PDF Card */}
      <div className="bg-[#121214] border border-white/10 p-6 rounded-xl hover:bg-white/5 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <FileText size={20} />
        </div>
        <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Dokumen PDF</h3>
        <p className="text-xs text-white/30 mb-6">Ringkasan pesanan siap cetak (.pdf)</p>

        <div className="space-y-4">
          <METANARUSelect 
            value={filter.event}
            onChange={val => setFilter(prev => ({...prev, event: val}))}
            placeholder="Pilih Event"
            className="w-full"
            options={[
              { value: 'all', label: 'Semua Event' },
              ...events.map((ev) => {
                const { badge, badgeKind } = eventOptionBadge(ev);
                return { value: ev.id, label: ev.name, badge, badgeKind };
              })
            ]}
          />
          <button 
            disabled={exportingId === filter.event && exportType === 'pdf'}
            onClick={() => handleExport(filter.event, 'pdf')}
            className={`w-full py-3 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${exportingId === filter.event && exportType === 'pdf' ? 'bg-red-800 cursor-not-allowed opacity-50' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}
          >
            {exportingId === filter.event && exportType === 'pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            {exportingId === filter.event && exportType === 'pdf' ? 'Mengunduh...' : 'Unduh PDF'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ExportSection;
