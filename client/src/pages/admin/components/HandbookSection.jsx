import React from 'react';

const HandbookSection = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-3 mb-12">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Panduan Operasional Staff</h2>
          <p className="text-[10px] text-[#FF0033] font-bold uppercase tracking-[0.3em] inline-block border border-[#FF0033]/20 bg-[#FF0033]/5 px-4 py-1.5 rounded-full">Prosedur Standar METANARU Admin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#121214] border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#FF0033]/20 text-[#FF0033] flex items-center justify-center text-sm">01</span>
                  CARA INPUT ORDER OTS
                </h3>
                <div className="space-y-6 relative z-10 text-xs text-white/60 leading-relaxed">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-bold text-white mb-2 uppercase text-[10px]">Langkah-langkah:</p>
                      <ul className="list-disc ml-4 space-y-2">
                        <li>Masuk ke Tab <b>Dashboard</b>.</li>
                        <li>Isi <b>Nama Panggilan</b> dan <b>Kontak</b> fans (opsional).</li>
                        <li>Klik pada tombol <b>Member</b> untuk menambah jumlah (Klik kanan untuk mengurangi).</li>
                        <li>Pilih <b>Payment Method</b> (Cash / QR).</li>
                        <li>Klik <b>Simpan Pesanan</b> setelah pembayaran diterima.</li>
                        <li className="text-[#FF0033] font-bold">Jika salah input, gunakan tombol 📝 (Pensil) di tabel riwayat untuk merubah data.</li>
                      </ul>
                  </div>
                </div>
            </div>

            <div className="bg-[#121214] border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">02</span>
                  FUNGSI STATUS PESANAN
                </h3>
                <div className="space-y-4">
                  {[
                      { status: 'UNCEK (Pending)', desc: 'Pesanan online baru masuk, bukti bayar perlu diverifikasi di menu Pesanan.' },
                      { status: 'CHEKE (Paid)', desc: 'Pembayaran sudah dikonfirmasi. Staff bisa mulai memproses pesanan / antrian.' },
                      { status: 'DONE (Selesai)', desc: 'Barang/Polaroid sudah diserahkan ke fans. Data akan masuk ke rekap final.' }
                  ].map((item, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-1 uppercase text-[10px]">{item.status}</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed">{item.desc}</p>
                      </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#121214] border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center text-sm">03</span>
                  EKSPORT DATA & LAPORAN
                </h3>
                <div className="space-y-4">
                  <p className="text-xs text-white/40 leading-relaxed">Menu <b>Ekspor Data</b> digunakan untuk mengunduh laporan penjualan dalam format <b>Excel</b> atau <b>PDF</b>. Nama file hasil ekspor kini otomatis menyertakan Nama Event agar lebih mudah dicari.</p>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                      <p className="text-[10px] text-white/40 leading-relaxed"><span className="text-white font-bold">PDF:</span> Cocok untuk laporan cetak / bukti rekap harian ke manager.</p>
                      <p className="text-[10px] text-white/40 leading-relaxed"><span className="text-white font-bold">EXCEL:</span> Digunakan jika ingin mengolah data angka atau pivot table.</p>
                  </div>
                </div>
            </div>

            <div className="bg-[#121214] border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm">04</span>
                  EVENT & MANAJEMEN PESANAN
                </h3>
                <div className="space-y-4 relative z-10 text-xs text-white/60 leading-relaxed">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <ul className="list-disc ml-4 space-y-2">
                        <li><b>Kategori Event:</b> Event terbagi menjadi <b>NORMAL</b> (Standar) dan <b>SPESIAL</b> (Tema khusus).</li>
                        <li><b>Filter Event:</b> Daftar pesanan bisa difilter berdasarkan event tertentu. Pilih event di dropdown sebelah fitur pencarian pada tab Pesanan.</li>
                        <li><b>PO & OTS Terpisah:</b> Tabel pesanan telah dibagi dua bagian: OTS (pesanan langsung di booth) dan PO (pre-order) untuk mempermudah pengecekan.</li>
                        <li><b>Catatan PO:</b> Kolom Catatan PO ditambahkan di tabel PO untuk melihat pesan khusus dari pembeli.</li>
                        <li className="text-[#FF0033] font-bold"><b>Auto-Delete:</b> Event yang sudah berlalu akan terhapus otomatis setelah 67 hari oleh sistem.</li>
                        <li className="text-[#FF0033] font-bold"><b>Export Sebelum Delete:</b> Selalu lakukan Export Excel/PDF sebelum menghapus event agar data penting tidak hilang.</li>
                      </ul>
                  </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1D] to-[#121214] border border-white/10 p-8 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center text-sm">05</span>
                  KONTAK DEVELOPER
                </h3>
                <div className="space-y-4">
                  <div className="group">
                      <p className="text-[10px] text-white/40 uppercase mb-1 flex items-center justify-between">
                        Web Developer / IT Support
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      </p>
                      <p className="text-sm font-bold text-white group-hover:text-[#FF0033] transition-colors">085765907580 (@ikifer)</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-[9px] text-red-500 italic leading-relaxed">Hubungi jika terjadi kendala sistem serius (Web lambat, eror simpan, atau database corrupt).</p>
                  </div>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default HandbookSection;
