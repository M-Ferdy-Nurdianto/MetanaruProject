// api/checkout.js
export default async function handler(req, res) {
  // Hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // URL Google Script dari Environment Variable Vercel
  const GOOGLE_URL = process.env.GOOGLE_SHEET_URL;

  if (!GOOGLE_URL) {
    return res.status(500).json({ error: 'Server Config Error: Missing Google URL' });
  }

  try {
    // Teruskan seluruh body (termasuk gambar base64) ke Google Script
    const response = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Ambil respon text dari Google Script
    const data = await response.text();
    
    // Kembalikan sukses ke frontend
    return res.status(200).json({ status: "success", googleResponse: data });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ error: 'Failed to connect to Database' });
  }
}