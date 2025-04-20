Sistem Pendaftaran Kad Pengenalan Jabatan Imigresen Malaysia Negeri Sarawak
Gambaran Keseluruhan
Sistem ini direka khusus untuk Jabatan Imigresen Malaysia Negeri Sarawak bagi menguruskan pendaftaran, kemaskini, dan pelaporan kehilangan kad pengenalan kakitangan. Sistem ini menyediakan antara muka pengguna yang mesra untuk pentadbir menguruskan data, mencetak kad, dan menjejaki status kad pengenalan. Ciri utama termasuk:

Pendaftaran Baru: Mendaftar kakitangan dengan maklumat peribadi dan gambar.
Kemaskini Maklumat: Membolehkan pentadbir mengemas kini maklumat kakitangan yang sedia ada.
Laporan Kehilangan: Melaporkan kad yang hilang dan menjejaki statusnya.
Tetapan Sistem: Mengunggah templat kad dan menyesuaikan teks belakang kad.
Pratonton dan Cetak: Membolehkan pratonton dan cetakan kad pengenalan dalam format PDF.

Sistem ini dibina menggunakan teknologi web dengan HTML, Tailwind CSS, dan JavaScript, serta berintegrasi dengan Google Apps Script untuk fungsi sisi pelayan.
Keperluan
Perisian

Pelayar moden (Google Chrome, Firefox, Safari, dsb.)
Sambungan internet untuk berinteraksi dengan Google Apps Script
Akaun Google untuk menggunakan Google Apps Script (sisi pelayan)

Perkakasan

Komputer dengan resolusi skrin minimum 1024x768
Pencetak (untuk mencetak kad pengenalan)

Kebergantungan

Tailwind CSS: Digunakan melalui CDN (https://cdn.tailwindcss.com)
Font Awesome: Ikon digunakan melalui CDN (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css)

Pemasangan

Sediakan Projek Google Apps Script:

Buka Google Apps Script.
Cipta projek baru dan salin kod sisi pelayan (tidak disediakan dalam README ini, sila rujuk dokumentasi atau pentadbir sistem).
Terbitkan projek sebagai aplikasi web dengan tetapan "Siapa yang mempunyai akses: Sesiapa sahaja" dan "Melaksanakan aplikasi sebagai: Saya".


Hos Fail HTML:

Salin kandungan fail Index.html (disediakan secara berasingan) ke dalam projek Google Apps Script atau hos pada pelayan web anda.
Jika menggunakan Google Apps Script, pastikan fail Index.html dimuat naik sebagai fail dalam projek dan dihoskan melalui aplikasi web yang diterbitkan.


Konfigurasi:

Pastikan URL Google Apps Script yang diterbitkan dimasukkan dalam kod Index.html untuk komunikasi dengan sisi pelayan.
Uji sistem dengan melayari URL aplikasi web yang diterbitkan.



Cara Penggunaan
1. Log Masuk

Buka halaman utama sistem melalui pelayar.
Masukkan No. Kad Pengenalan dan Kata Laluan pentadbir.
Klik Log Masuk untuk mengakses sistem.

2. Pendaftaran Baru (Tab "Daftar")

Masukkan maklumat kakitangan seperti Nama, No. Kad Pengenalan, No. Telefon, Unit/Bahagian, dll.
Muat naik gambar (format JPEG/PNG, maksimum 2MB) dengan latar belakang putih.
Klik Simpan Pendaftaran untuk menyimpan data dan menjana kad pengenalan.
Sistem akan menjana PDF untuk bahagian depan dan belakang kad, dan membawa anda ke tab "Preview".

3. Kemaskini Maklumat (Tab "Kemaskini")

Masukkan ID Kad atau No. Kad Pengenalan untuk mencari rekod.
Klik Cari untuk memaparkan maklumat kakitangan.
Kemas kini maklumat yang diperlukan dan klik Simpan Perubahan.

4. Laporan Kehilangan (Tab "Kehilangan")

Cari kakitangan menggunakan ID Kad atau No. Kad Pengenalan.
Klik Laporkan Hilang untuk menandakan kad sebagai hilang.
Senarai kakitangan yang didaftar juga dipaparkan untuk rujukan.

5. Tetapan Sistem (Tab "Tetapan")

Unggah Template Baru: Muat naik gambar templat untuk bahagian depan dan belakang kad (maksimum 5MB, JPEG/PNG).
Ubah Teks Belakang ID Card: Masukkan teks baru untuk bahagian belakang kad dan simpan.

6. Pratonton dan Cetak (Tab "Preview")

Pratonton kad pengenalan yang dijana.
Klik Muat Turun Depan atau Muat Turun Belakang untuk memuat turun PDF.
Klik Cetak Depan atau Cetak Belakang untuk mencetak kad.

7. Log Keluar

Klik Log Keluar di bahagian navigasi untuk kembali ke halaman log masuk.

Ciri Tambahan

Kesan Skrol Footer: Footer muncul dengan animasi apabila pengguna skrol ke bawah melebihi 50% ketinggian halaman.
Validasi Input: Sistem memastikan format No. Kad Pengenalan (xxxxxx-xx-xxxx) dan No. Telefon (10-11 digit) adalah sah.
Antara Muka Responsif: Sesuai untuk peranti dengan pelbagai saiz skrin.

Had dan Catatan

Sistem memerlukan sambungan internet untuk berfungsi kerana ia bergantung pada Google Apps Script.
Pastikan pelayar anda menyokong JavaScript dan membenarkan pop-up untuk fungsi cetak.
Saiz fail gambar untuk pendaftaran (maksimum 2MB) dan templat (maksimum 5MB) perlu dipatuhi.

Sokongan
Untuk sebarang isu atau pertanyaan, sila hubungi pentadbir sistem Jabatan Imigresen Malaysia Negeri Sarawak.
Hak Cipta © 2025 Jabatan Imigresen Malaysia Negeri Sarawak. Hak Cipta Terpelihara.
Disediakan oleh: PI KP2 (TBK1) Mohammad Azzer bin Taip
