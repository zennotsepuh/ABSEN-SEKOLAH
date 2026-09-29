const nodemailer = require('nodemailer');

// Simulasi penyimpanan (reset tiap cold start — untuk produksi pakai Supabase/Firebase)
let dataAbsen = [];

// Fungsi bantu: kirim email
async function kirimEmail(data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;
                border:1px solid #e0e0e0;border-radius:12px;">
      <h2 style="color:#667eea;text-align:center;">📋 Absensi Baru Masuk</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;background:#f5f5f5;"><b>Nama</b></td>
            <td style="padding:8px;">${data.nama}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;"><b>Kelas</b></td>
            <td style="padding:8px;">${data.kelas}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;"><b>Status</b></td>
            <td style="padding:8px;">${data.status}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;"><b>Keterangan</b></td>
            <td style="padding:8px;">${data.keterangan}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;"><b>Waktu</b></td>
            <td style="padding:8px;">${data.waktu}</td></tr>
      </table>
      <p style="text-align:center;color:#999;font-size:12px;margin-top:20px;">
        Sistem Absensi Sekolah
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Sistem Absensi" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_GURU,
    subject: `📋 Absensi: ${data.nama} - ${data.kelas}`,
    html: htmlBody
  });
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Ambil rekap
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: dataAbsen });
  }

  // POST: Kirim absen
  if (req.method === 'POST') {
    try {
      const { nama, kelas, status, keterangan } = req.body || {};

      // Validasi
      if (!nama || !kelas || !status) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap!'
        });
      }

      const waktu = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta'
      });
      const tanggal = new Date().toDateString();

      // Cek dobel absen
      const sudahAbsen = dataAbsen.find(
        d => d.nama.toLowerCase() === nama.toLowerCase() &&
             d.tanggal === tanggal
      );

      if (sudahAbsen) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah absen hari ini!'
        });
      }

      const absenBaru = {
        nama,
        kelas,
        status,
        keterangan: keterangan || '-',
        waktu,
        tanggal
      };

      dataAbsen.push(absenBaru);

      // Kirim email
      await kirimEmail(absenBaru);

      return res.status(200).json({
        success: true,
        message: 'Absen berhasil! Email terkirim ke guru.'
      });

    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim absen: ' + err.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};
