# Bridge Master - Yayın Öncesi Eksikler Listesi

Bu doküman, "**Bridge Master**" (`com.evnlabs.bridgemaster`) oyununun Google Play Store (veya App Store) üzerinde yayına alınabilecek düzeye (Ready for Production) gelmesi için tamamlanması gereken kritik ve orta seviye eksikleri listeler.

## 1. Monetizasyon & Reklamlar (AdMob)
*   **[YAPILDI] Gerçek Reklam Kimlikleri:** `AdManager` ve `AndroidManifest.xml` içerisindeki tüm Google AdMob Test ID'leri kaldırılarak, üretim ortamına (Production) uygun olan gerçek App, Banner, Interstitial ve Rewarded kimlikleriyle başarıyla değiştirildi.
*   **[YAPILDI] Banner Güvenli Alanı:** Banner reklamın butonlarla çakışmaması için oyun içi arayüze 60px'lik bir "Safe Area" (alt Padding) eklendi.

## 2. Oynanış ve Seviyeler (Gameplay & Level Design)
*   **[YAPILDI] 1. Level İçin Görsel Eğitim (Tutorial):** İlk seviye olan "Eğitim Köprüsü"ne özel, eğer hiç kiriş çizilmemişse beliren parmak (`👆`) animasyonlu bir **TutorialGuide** bileşeni oluşturuldu. Kılavuz, oyuncuya başlangıç noktasından bitiş noktasına basılı tutarak sürüklemesi gerektiğini gösterir.
*   **[YAPILDI] Hata / Yenilgi Geri Bildirimi:** Oyun kaybedildiğinde (kaybetme nedenini tutan `failReason` State'i eklendi), Yenilgi Modal'ında "Araç Suya Düştü!", "Araç Köprüyü Kırdı!" veya "Süre Doldu!" şeklinde özelleştirilmiş, net dönütler yazılıyor.
*   **[YAPILDI] Bütçe / Zorluk Dengesi:** 51 adet levelin bütçe ve uzunlukları test edildi, zorluk eğrisi dengelendi.

## 3. Kullanıcı Deneyimi ve Arayüz (UX/UI)
*   **[YAPILDI] Ses Efektleri ve Müzik (SFX):** `AudioManager` entegre edildi.
    *   Hypercasual arka plan müziği altyapısı kuruldu.
    *   Düğüm noktası koyarken "Tık" sesi.
    *   Köprü gerilirken / kırılırken ses efektleri eklendi.
    *   Kazanma ve kaybetme durumlarına özel sesler.
    *   Bütçeden para azalırken / satın alma yaparken coin efekti eklendi.
    *   Arka plana geçince ve reklam sırasında müzik duraklatılıyor.
    *   Ayarlar ve pause menüsünden müzik/ses efekti açma-kapama.
*   **[YAPILDI] Ses Dosyaları:** `public/sounds/` klasörüne tüm gerekli `.mp3` dosyaları eklendi.
*   **[YAPILDI] Araç Marketi (Car Shop):** Market arayüzü "Premium" (glassmorphism) tasarıma kavuşturuldu, 3D izleme ekranı ve ses efektleri bağlandı.
*   **[YAPILDI] Özel Kiriş Silme (Delete Mode):** İnşa modunda kirişlerin üzerine tıklayarak tek tek silinebilmesi (Kiriş seç-sil) özelliği eklendi.

## 4. Teknik Performans & Optimizasyon
*   **[YAPILDI] Cannon.js Fizik "Tunneling":** Arabanın veya köprünün fiziği test edildi, mevcut seviyeler için stabilize edildi.
*   **[YAPILDI] Mobil Cihaz FPS:** Eski nesil Android cihazlarda testler yapıldı.

## 5. Google Play Özellikleri
*   **[YAPILDI] Splash Screen (Açılış Ekranı):** Android açılış ekranı tasarlandı ve eklendi.
*   **[YAPILDI] App Icon (Uygulama İkonu):** Özel ikon hazırlandı ve `capacitor-assets` ile tüm çözünürlüklere basıldı.
*   **[YAPILDI] App Store / Play Store Görselleri:** Satış sayfası için mockup çerçeveli ekran görüntüleri hazırlandı.
