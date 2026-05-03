// api/submit.js - Berjalan di Server Vercel
export default async function handler(req, res) {
  // 1. Cek metode request, hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 2. Ambil URL Rahasia dari Environment Variable Vercel
  // Nanti kita setting ini di dashboard Vercel.
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    console.error("Error: GOOGLE_SCRIPT_URL belum disetting di Vercel.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // 3. Teruskan data dari frontend ke Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      // Kita gunakan 'no-cors' agar Apps Script menerima request
      // meskipun kita tidak bisa membaca respon detailnya di mode ini.
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body), // Kirim data (nama, pesan)
    });

    // Karena 'no-cors', kita asumsikan jika fetch berhasil dieksekusi, maka data terkirim.
    // Google Script akan menangani error internalnya sendiri.
    return res.status(200).json({ success: true, message: "Forwarded to Google Sheet" });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ error: 'Failed to connect to database service.' });
  }
}