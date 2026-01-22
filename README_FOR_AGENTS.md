# Agent ve Geliştirici Rehberi (Kullanım Kılavuzu)

Hangi dosyanın hangi ortamda ve ne amaçla kullanılacağını belirten ana dizindir.

## 🏠 Home (Lokal / Kendi Cihazınız)
Kodlama, test ve planlama işlemlerinin yapıldığı yer. Aşağıdaki dosyalar **kodlama yapacak agent'a** verilmelidir.

*   **`AGENTS_TODO.md`** (🏠 Home): Kodlama yapacak agent için teknik görev listesi (Güvenlik, Test, Refactoring).
*   **`UI_UX_IMPROVEMENTS.md`** (🏠 Home): Arayüz iyileştirmeleri ve kullanıcı deneyimi önerileri.
*   **`LAYOUT_ALIGNMENT.md`** (🏠 Home): Tasarım ve yerleşim standartları (Grid, Spacing).

---

## ☁️ Server (Sunucu / Canlı Ortam)
SSH ile bağlanıp komut çalıştırılan yer. Aşağıdaki dosya **Gemini CLI veya DevOps agent'ına** verilmelidir.

*   **`SERVER_SECURITY.md`** (☁️ Server): Sunucu kurulumu, güvenlik ayarları ve Nginx konfigürasyonu.

---

## 🔄 Hybrid (Süreç Yönetimi)
Her iki ortamı da ilgilendiren iş akışı.

*   **`WORKFLOW_GUIDE.md`** (🏠 + ☁️): Geliştirme döngüsü, Deploy süreci ve Git kullanımı.
