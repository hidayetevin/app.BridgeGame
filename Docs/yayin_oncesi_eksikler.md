# Bridge Master - Yayın Öncesi Eksikler Listesi

Bu doküman, "**Bridge Master**" (`com.evnlabs.bridgemaster`) oyununun Google Play Store (veya App Store) üzerinde yayına alınabilecek düzeye (Ready for Production) gelmesi için tamamlanması gereken kritik ve orta seviye eksikleri listeler.

## 1. Monetizasyon & Reklamlar (AdMob)
*   **[YAPILDI] Gerçek Reklam Kimlikleri:** `AdManager` ve `AndroidManifest.xml` içerisindeki tüm Google AdMob Test ID'leri kaldırılarak, üretim ortamına (Production) uygun olan gerçek App, Banner, Interstitial ve Rewarded kimlikleriyle başarıyla değiştirildi.
*   **[KONTROL] Banner Güvenli Alanı:** Banner reklam ekranın alt/üst neresinde duracaksa, oyun butonları (`Başlat`, `Geri Al` vd.) reklama "yanlışlıkla tıklanmayacak (Accidental Click)" kadar uzak bir "Padding" veya güvenli çerçeve içinde kalmalıdır. Aksi halde AdMob kısıtlama verebilir.

## 2. Oynanış ve Seviyeler (Gameplay & Level Design)
*   **[KRİTİK] 1. Level İçin Görsel Eğitim (Tutorial):** Hipercasual oyuncular uzun yazıları okumazlar. İlk seviye "Eğitim Köprüsü"nde oyuncuya nereye basması ve ardından nereye doğru sürüklemesi gerektiğini gösteren "Hareketli bir El İkonu (Hand Pointer Animation)" veya kılavuz bir hayalet üçgen çizgi (truss system reference) gösterilmelidir.
*   **[EKSİK] Hata / Yenilgi Geri Bildirimi:** Araba düştüğünde ya da köprü kırıldığında oyuncuya basit kısa metinler çıkarılmalıdır (Örn: "Çok Zayıf Bir Yapı", "Daha Fazla Destek Gerek" vs.).
*   **[GÖZDEN GEÇİR] Bütçe / Zorluk Dengesi:** 51 adet levelin bütçe ve uzunlukları (zorluk eğrisi) sürekli test edilmeli, imkansız leveller düzeltilmelidir.

## 3. Kullanıcı Deneyimi ve Arayüz (UX/UI)
*   **[KRİTİK] Ses Efektleri ve Müzik (SFX):** Oyunda `AudioManager` eksikliği var.
    *   Sürekli çalan hafif / meditatif bir Hypercasual arka plan müziği.
    *   Düğüm noktası koyarken "Tık" sesi.
    *   Köprü gerilirken tahta/çelik "Tak" veya "Gıcırdama" sesleri.
    *   Köprü çökünce kırılma/düşme sesi.
    *   Araba motoru ve lastik sesi (oynatılınca).
    *   Bütçeden para azalırken metalik coin/para efekti.
*   **[EKSİK] Araç Marketi (Car Shop):** Menüde "Market" var. Fakat kazanılan "Yıldızlar (Stars)" kullanılarak farklı arabaların kilitlerinin açıldığı, oyuncuyu elde tutmaya yarayan o tatmin edici alışveriş/kamera ekranının bağlanması gerek.
*   **[EKSİK] Özel Kiriş Silme (Delete Mode):** "Geri Al (Undo)" her şeyi sırayla siliyor. Ancak kullanıcının hatalı çektiği tek bir kiriş/odun varsa o kirişin üzerine tıklayıp silebildiği bir silgi/çöp kutusu aracına ihtiyaç olabilir.

## 4. Teknik Performans & Optimizasyon
*   **[GÖZDEN GEÇİR] Cannon.js Fizik "Tunneling":** Arabanın veya köprünün fiziği çok hızlanıp ince zeminleri/yolları delip altından geçmeye (Tunneling bug) meyil etmemesi için, araba fizikleri ve materyal yoğunluklarına / Cannon iteration değerlerine sürekli göz kulak olunmalıdır. (Şu an stabilize edilmiş durumda, ancak yeni seviyeler eklenirken dikkat edilmeli).
*   **[KONTROL] Mobil Cihaz FPS:** Eski nesil Android cihazlarda kasma olmaması için arka plandaki dinamik dalgalı su efektinin vb. testleri yapılmalıdır.

## 5. Google Play Özellikleri
*   **[EKSİK] Splash Screen (Açılış Ekranı):** Siyah/beyaz boş ekran yerine, logomuzun ve oyun adının yer aldığı statik veya animasyonlu kaliteli bir Android açılış ekranı (Splash Screen) tasarlanmalı.
*   **[EKSİK] App Icon (Uygulama İkonu):** Capacitor'ın varsayılan ikonu yerine, oyunu anlatan (Köprünün üstünde mavi araba vb.) şık bir kare/oval ikon hazırlanmalı (örn: `capacitor-assets` kullanılarak her çözünürlüğe basılacak).
*   **[EKSİK] App Store / Play Store Görselleri:** Satış sayfası için şık mockup frame çerçevelerine yerleştirilmiş ekran görüntüleri (Aesthetic Screenshots).
