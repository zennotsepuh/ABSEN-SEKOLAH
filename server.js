require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Konfigurasi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Simulasi database (nanti bisa ganti Supabase/Firebase)
const dataAbsen = [];

// Endpoint absen
app.post('/absen', async (req, res) => {
  const { nama, kelas, status, keterangan } = req.body;

  // Validasi
  if (!nama || !kelas || !status) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap!' });
  }

  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  // Cek dobel absen hari ini
  const sudahAbsen = dataAbsen.find(
    d => d.nama.toLowerCase() === nama.toLowerCase() && 
         d.tanggal === new Date().toDateString()
  );
  if (sudahAbsen) {
    return res.status(400).json({ success: false, message: 'Anda sudah absen hari ini!' });
  }

  // Simpan data
  const absenBaru = {
    nama, kelas, status,
    keterangan: keterangan || '-',
    waktu,
    tanggal: new Date().toDateString()
  };
  dataAbsen.push(absenBaru);

  // Kirim email
  try {
    await transporter.sendMail({
      from: `"Sistem Absensi" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_GURU,
      subject: `📋 Absensi Baru: ${nama} - ${kelas}`,
      html: `
        <h2>Absensi Baru Masuk</h2>
        <table style="border-collapse:collapse;">
          <tr><td><b>Nama</b></td><td>: ${nama}</td></tr>
          <tr><td><b>Kelas</b></td><td>: ${kelas}</td></tr>
          <tr><td><b>Status</b></td><td>: ${status}</td></tr>
          <tr><td><b>Keterangan</b></td><td>: ${keterangan || '-'}</td></tr>
          <tr><td><b>Waktu</b></td><td>: ${waktu}</td></tr>
        </table>
        <p><i>Sistem Absensi Sekolah</i></p>
      `
    });

    res.json({ success: true, message: 'Absen berhasil! Email terkirim ke guru.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal kirim email.' });
  }
});

// Endpoint rekap
app.get('/rekap', (req, res) => {
  res.json(dataAbsen);
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${process.env.PORT}`);
});
