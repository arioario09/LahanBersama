# Panduan Pengaturan LahanBersama

Dokumen ini berisi langkah-langkah untuk menjalankan aplikasi LahanBersama di komputer lokal Anda, serta panduan integrasi untuk Firebase dan Midtrans.

---

## 1. Menjalankan di Lokal (Local Setup)

### Prasyarat
- **Node.js** (versi 18 ke atas)
- **Firebase Account** (untuk database dan autentikasi)

### Langkah-langkah:
1. **Unduh Kode Sumber**:
   Download file ZIP proyek ini dari AI Studio atau lakukan `git clone` jika sudah di-ekspor ke GitHub.
   
2. **Install Dependensi**:
   Buka terminal di folder proyek dan jalankan:
   ```bash
   npm install
   ```

3. **Konfigurasi Firebase**:
   - Buat file `.env` di root folder.
   - Masukkan konfigurasi Firebase Anda (lihat bagian Integrasi Firebase di bawah).

4. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 2. Integrasi Firebase

### Langkah-langkah di Console Firebase:
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Buat proyek baru dengan nama **LahanBersama**.
3. **Authentication**: 
   - Aktifkan Google Sign-In di tab "Sign-in method".
4. **Firestore Database**:
   - Buat database baru dalam "Production Mode".
   - Pilih lokasi server yang dekat (misal: `asia-southeast1` untuk Jakarta/Singapore).
5. **Project Settings**:
   - Tambahkan aplikasi web baru.
   - Salin objek `firebaseConfig` yang diberikan.

### Update Kode Proyek:
- Buka file `src/lib/firebase.ts` (atau tempat inisialisasi firebase).
- Pastikan menggunakan variabel lingkungan atau ganti config di `src/firebase-applet-config.json` (jika ada) dengan config dari console Anda.

### Security Rules:
Salin aturan keamanan berikut ke tab **Firestore > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
*(Catatan: Sebaiknya perketat aturan ini sebelum rilis produksi).*

---

## 3. Integrasi Midtrans (Sistem Pembayaran)

Proyek ini saat ini menggunakan **simulasi client-side** untuk alur pembayaran. Untuk menghubungkannya dengan Midtrans sungguhan:

### Langkah-langkah Integrasi:
1. **Daftar Akun Midtrans**:
   - Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com/) (Gunakan mode Sandbox untuk testing).
2. **Dapatkan Client Key & Server Key**:
   - Pergi ke **Settings > Access Keys**.

3. **Integrasi Snap JS (Client Side)**:
   - Tambahkan script Midtrans di `index.html`:
     ```html
     <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>
     ```
   - Di komponen `PaymentFlow.tsx`, panggil `window.snap.pay(token)` untuk memunculkan popup pembayaran.

4. **Backend Proxy (Penting)**:
   - Untuk mendapatkan `transaction_token`, Anda perlu membuat request dari backend (Node.js) ke API Midtrans menggunakan **Server Key**.
   - **Jangan pernah meletakkan Server Key di sisi Client (React)**.
   - Gunakan library `midtrans-client`:
     ```javascript
     const midtransClient = require('midtrans-client');
     let snap = new midtransClient.Snap({
         isProduction : false,
         serverKey : 'YOUR_SERVER_KEY',
         clientKey : 'YOUR_CLIENT_KEY'
     });
     ```

5. **Notification / Webhook**:
   - Setup URL di dashboard Midtrans agar mengirim notifikasi ke server Anda setelah pembayaran sukses, untuk mengupdate balance user di Firestore secara aman.

---

## 4. PWA (Mobile App)
Aplikasi ini sudah dilengkapi `manifest.json`. Untuk meng-install di HP:
1. Buka aplikasi via Chrome (Android) atau Safari (iOS).
2. Pilih menu **"Add to Home Screen"** atau **"Tambahkan ke Layar Utama"**.
3. Aplikasi akan muncul di menu HP seperti aplikasi native.
