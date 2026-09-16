# Semua tentang dia ☀️

Website berisi 15 slot foto, lebih dari 150 kalimat bahasa Indonesia, langit cerah, burung, kupu-kupu, bunga melayang, dan butir cahaya. Semua aset tersimpan lokal.

## Buka di VS Code

1. Ekstrak ZIP terlebih dahulu jika kamu memakai versi ZIP.
2. Di VS Code, pilih **File → Open Folder**, lalu pilih folder **langit-ceria** ini.
3. Klik kanan **dist/index.html** di VS Code → **Open with Live Server**. Ekstensi Live Server diperlukan untuk pilihan ini. Untuk JPG/PNG/JPEG, klik dua kali file dari File Explorer juga bisa; **HEIC/HEIF memerlukan Live Server atau server HTTP**.

## Taruh foto di mana?

Masukkan foto ke folder **dist/assets/foto/**. Gunakan nomor **01 sampai 15**, dengan ekstensi asli. Format boleh campur, misalnya `01.jpg`, `02.PNG`, `03.heic`, dan `04.JPEG`. Halaman mencari formatnya otomatis tanpa perlu mengedit config setiap ganti format. Slot yang belum diisi menampilkan nomor; tidak perlu membuat atau menimpa gambar placeholder.

Simpan **satu foto per nomor**. Kalau mengganti `02.jpg` dengan `02.png`, pindahkan foto `02.jpg` lama keluar dari folder foto agar tidak tetap terpilih. Pencarian memprioritaskan JPG, JPEG, PNG, WEBP, AVIF, GIF, HEIC, lalu HEIF. Huruf kecil, besar, dan huruf awal besar umum dikenali; kalau memakai variasi lain, tulis nama lengkap yang persis di `src`.

```text
langit-ceria/
├── dist/
│   ├── index.html
│   ├── config.js          ← ubah tulisan, nama foto, dan musik
│   ├── style.css          ← warna, ukuran, dan tampilan
│   ├── script.js          ← animasi dan tombol
│   ├── photo-loader.js    ← pencarian format dan pembaca HEIC
│   └── assets/
│       ├── foto/
│       │   ├── 01.jpg     ← foto pertama kamu
│       │   ├── 02.jpg
│       │   ├── 03.jpg
│       │   ├── 04.jpg
│       │   ├── 05.jpg
│       │   ├── 06.jpg
│       │   ├── 07.jpg
│       │   ├── 08.jpg
│       │   ├── 09.png
│       │   ├── 10.jpg
│       │   ├── 11.heic
│       │   ├── 12.jpeg
│       │   ├── 13.jpg
│       │   ├── 14.png
│       │   └── 15.jpg
│       ├── images/sky-garden.jpg
│       └── musik/         ← musik opsional
└── README.md
```

Aktifkan **View → Show → File name extensions** di File Explorer supaya tidak keliru membuat `01.jpg.jpg`.

Nama bernomor tidak membutuhkan ekstensi di `src`. Jika ingin nama lain, ubah `src` yang sesuai di **dist/config.js**, misalnya:

```js
{ src: 'assets/foto/liburan', caption: 'hari paling seru', position: '50% 50%' }
```

Jangan mengganti ekstensi `.png` atau `.heic` menjadi `.jpg`. Pertahankan format asli.

### Khusus HEIC / HEIF

- Buka halaman lewat **Open with Live Server** di VS Code. Alamat browser harus diawali `http://` atau `https://`, bukan `file://`.
- Pembaca HEIC sudah dibundel di `dist/assets/vendor/`. Foto dikonversi ke JPG sementara **di browser** untuk ditampilkan. File asli tetap utuh dan tidak dikirim ke layanan konversi.
- Foto HEIC besar bisa perlu beberapa saat. Hanya gambar utama dalam file HEIC/Live Photo yang ditampilkan; video Live Photo tidak dimainkan.
- Kalau file HEIC tertentu rusak atau tidak didukung pembaca, foto lain tetap tampil. Ekspor file tersebut ke JPG/PNG sebagai alternatif.

- `caption`: tulisan di bawah foto.
- `position`: posisi potongan foto. Coba `50% 25%` untuk menampilkan bagian atas foto lebih banyak.
- Ada 15 slot foto. Bisa menambah/menghapus baris foto di config bila dibutuhkan.
- Setelah mengganti foto, muat ulang browser. Jika gambar lama masih muncul, gunakan **Ctrl + F5**.

## Ganti tulisan

Edit **dist/config.js**. `headline` dan `highlight` adalah judul; `phrases` berisi kalimat bahasa Indonesia yang melayang; `footer` adalah tulisan di bawah. Kalimat diacak saat halaman dibuka dan berganti setelah keluar dari layar, tanpa kalimat yang sama pada dua foto sekaligus jika pilihan kalimat mencukupi. Semua teks bisa diganti. `natureAnimation: false` menonaktifkan dekorasi burung, kupu-kupu, bunga, dan cahaya.

`animationDuration: 56` mengatur tempo foto. Angka lebih besar membuat gerak lebih pelan, misalnya `62`; angka lebih kecil membuatnya lebih cepat.

## Tambahkan musik (opsional)

1. Taruh file musik milikmu di **dist/assets/musik/lagu.mp3**.
2. Di **dist/config.js**, ubah `music: ''` menjadi `music: 'assets/musik/lagu.mp3'`.
3. Buka ulang halaman. Musik dicoba otomatis setelah pembuka selesai. Jika browser memblokir suara otomatis, sentuh/klik halaman atau tekan Enter/Spasi untuk memulai musik. Tombol nada tetap bisa dipakai untuk memutar dan menjeda.

Jika ingin musik hanya dimulai lewat tombol, tambahkan `musicAutoplay: false` di config. Setelah musik dijeda lewat tombol, menyentuh halaman tidak akan menyalakannya kembali.

Tidak ada lagu bawaan. Tombol musik muncul saat alamat file musik sudah diisi.

## Interaksi

- Susunan foto diacak saat halaman dibuka: urutan, ukuran, kemiringan, jarak, dan posisi sedikit bervariasi. **Semua foto mulai di luar batas bawah galeri, lalu masuk bergantian dan naik perlahan.** Perjalanan dimulai setelah pembuka selesai dan gambar siap. Jarak antarblok dihitung berdasarkan foto dan kalimat terpanjang supaya tetap rapi. Susunan tidak diacak ulang saat layar diputar; teks berganti saat blok selesai melewati layar.
- Klik/sentuh foto untuk melihat ukuran besar. Tutup dengan tombol ×, klik area luar, atau Escape.
- Tombol jeda di kanan atas menghentikan gerakan foto, tulisan, burung, kupu-kupu, bunga, dan cahaya.
- Pengaturan perangkat untuk mengurangi animasi dihormati; gerakan bisa diaktifkan dengan tombol putar.

Proyek ini dibuat lokal dan belum dipublikasikan. Folder foto berisi foto yang kamu pasang sendiri.
