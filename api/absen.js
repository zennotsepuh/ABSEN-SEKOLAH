const nodemailer = require('nodemailer');

let dataAbsen = [];

async function kirimEmail(data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Sistem Absensi" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_GURU,
    subject: `Absensi: ${data.nama} - ${data.kelas}`,
    html: `
      <h2>Absensi Baru</h2>
      <p><b>Nama:</b> ${data.nama}</p>
      <p><b>Kelas:</b> ${data.kelas}</p>
      <p><b>Status:</b> ${data.status}</p>
      <p><b>Keterangan:</b> ${data.keterangan}</p>
      <p><b>Waktu:</b> ${data.waktu}</p>
    `
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ success: true, data: dataAbsen });
  }

  if (req.method === 'POST') {
    try {
      const { nama, kelas, status, keterangan } = req.body || {};
      if (!nama || !kelas || !status) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap!' });
      }
      const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const absenBaru = { nama, kelas, status, keterangan: keterangan || '-', waktu, tanggal: new Date().toDateString() };
      dataAbsen.push(absenBaru);
      await kirimEmail(absenBaru);
      return res.status(200).json({ success: true, message: 'Absen berhasil! Email terkirim.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal: ' + err.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};
