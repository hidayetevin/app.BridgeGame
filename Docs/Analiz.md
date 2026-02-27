# Bridge Master - Kapsamlı Proje ve Mimari Analizi

Bu doküman, **Bridge Master** (`com.evnlabs.bridgemaster`) projesinin en güncel (v1.0.0 Release) durumunu, teknik mimarisini, iş kurallarını ve oyun mantığını gelecekteki geliştirmelerde (özellikle yapay zeka asistanları tarafından) anlaşılabilmesi için detaylı bir şekilde listeler.

---

## 1. Genel Bakış ve Temel Mimari
Oyun, 2D (ancak 3D motoruyla render edilen) fizik tabanlı bir köprü inşa simülasyonudur.
- **Odak:** Kullanıcıların sınırlı bütçeyle kısıtlı malzemeler (Yol, Ahşap, Çelik) kullanarak bir aracı A noktasından B noktasına geçirmesi.
- **Paradigma:** React ve Zustand ile UI ve State yönetimi yapılırken, `@react-three/fiber` (R3F) ile 3D scene yönetilir. Fizik işlemleri `@react-three/cannon` (Cannon-es kütüphanesi) ile 60 fps simüle edilir.

## 2. Teknoloji Yığını (Tech Stack)
- **Framework & Build:** React 19, Vite, TypeScript, TailwindCSS
- **3D & Render:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Fizik Motoru:** `@react-three/cannon` / `cannon-es`
- **State Yönetimi:** `zustand` (persist middleware ile `localStorage` destekli)
- **Mobil Entegrasyon:** Capacitor v8 (`@capacitor/app`, `@capacitor/core`, `@capacitor/status-bar`)
- **Monetizasyon:** `@capacitor-community/admob` (AdMob Banner, Interstitial, Rewarded, Native)

## 3. Dizin ve Dosya Yapısı (`src/`)
- `components/`: UI ve 3D parçaları.
  - `Scene.tsx`: R3F Canvas'ın başlangıç noktası. Işıklandırma, kamera ve arkaplan.
  - `PhysicsWorld.tsx`: Simülasyon modunda aktif olan, tüm fizik nesnelerinin (BeamPhysics, NodePhysics, Vehicle) render edildiği sarmalayıcı.
  - `Cursor.tsx` / `GhostBeam.tsx`: Editör modundaki etkileşimli çizim araçları.
  - `SettingsScreen.tsx` / `MenuScreen.tsx` / `LevelSelect.tsx`: UI Overlays.
- `store/gameStore.ts`: Zustand store. Oyunun BÜTÜN iş mantığı, bütçesi, node/beam array'leri buradadır.
- `data/levels.ts`: 51 adet seviyenin konfigürasyonu (Anchor'lar, bütçe, targetX, timeLimit).
- `utils/`:
  - `AdManager.ts`: Reklam mantığını soyutlayan Singleton sınıf.
  - `AudioManager.ts`: Müzik ve Ses Efektlerini (`mp3`) yöneten Singleton sınıf.
  - `materials.ts`: Yol, ahşap ve çeliğin güç, maliyet, yoğunluk, ağırlık parametreleri.

## 4. Oyun Döngüsü ve İş Kuralları (Business Logic)

### 4.1. Modlar: Editor vs Simulation
Oyun temelde iki mod arasında gidip gelir:
1. **Editor Modu:** Fizik motoru **kapalıdır**. Kullanıcılar statik bir sahnede (Z=0 düzlemi üzerinde) bağlantı noktaları (nodes) ve kirişler (beams) çizerler.
2. **Simülasyon Modu:** Kullanıcı "Play" (Başlat) butonuna bastığında çalışır.
   - Editörde çizilen statik veriden fizik gövdeleri (RigidBody) üretilir.
   - Araç (`Vehicle.tsx`) spawn edilir ve fiziksel bir motora (raycastVehicle veya compound body) bağlı olarak motor gücü uygulanır.

### 4.2. Kiriş (Beam) Çizim Kuralları & `gameStore.ts` Kısıtlamaları
- **Maliyet ve Bütçe:** Çizilen kirişin maliyeti `Uzunluk * Materyal Ücreti` hesaplanarak bütçeden düşülür. Bütçe aşılırsa çizim iptal edilir.
- **Road Splitting (Yol Bölme Doğrusal Eğrisi):** Eğer çizilen materyal `road` (yol) ise ve belirli bir `MAX_LEN` (örn: 3) birimini aşıyorsa, sistem bu yolu otomatik olarak eşit parçalara (node'lara) böler. *Amaç:* Arabanın geçerken yolun esnemesini sağlamak (dümdüz kaskatı bir çelik gibi davranmaması için). Son parçanın çok küçük kalmasını (rampada zıplama yapmasını) engellemek için `MAX_LEN * 1.5` kuralı uygulanır.
- **Yol Zorunluluğu (Road-Only Rule):** `gameStore.ts` > `finishDrawingBeam` içinde özel kural vardır: İki *anchor* noktası (kırmızı sabit noktalar) **aynı Y seviyesindeyse (±0.5 tolerans)**, aralarına Çelik veya Ahşap *çekilemez*; oyuncu uyarılır (`blockReason: 'road_only'`) ve eylem iptal edilir.
- **Delete Mode (Silme Modu):** Editör modundayken bir kirişe tıklandığında (veya dokunulduğunda) kiriş silinir ve ücreti %100 oranında bütçeye iade edilir.

### 4.3. Fizik Parametreleri ve Kırılma (Breaking)
- Tüm objeler Z-Ekseninde devrilmemesi için 2D düzlemde kilitlenmiştir (`angularFactor: [0,0,1]`).
- `@react-three/cannon` bağlantıları (`usePointToPointConstraint` veya `useDistanceConstraint`) ile kirişler düğümlere bağlanır.
- Çekme (Stres) kuvveti kirişin `strength` (Maksimum dayanıklılık) sınırını aşarsa, Constraint kopar. `gameStore.ts` içindeki `breakBeam` çağrılır ve oyun kaybedilir (Kırılma efekti oynatılır).
- Cannon.js "Tunneling" (hızlı giden arabanın yolu delip geçmesi) sorunu çözmek için araba tekerleklerinin radyanı ve fizik iterasyon sayıları (`Physics` tipindeki `iterations`) ideal ölçüye getirilmiştir.

## 5. İkincil Sistemler

### 5.1. Ses Yönetimi (`AudioManager.ts`)
- Singleton pattern. HTML5 `Audio` kullanır. (Arka plan müziği + SFX).
- `localStorage` ile 'Mute' durumu saklanır (Müzik kapalı / SFX kapalı bağımsızdır).
- **Edge-case Çözümü:** AdMob reklamları (%100 ekranı kaplayan interstitial/rewarded) çıktığında veya Capacitor üzerinden App durumu "Background"a düştüğünde *müzik otomatik duraklar*, "Foreground"a geçince devam eder. Aksi takdirde oyun arka plandayken müzik çalmaya devam ederdi.

### 5.2. AdMob Entegrasyonu (`AdManager.ts`)
- Banner, Interstitial ve Rewarded reklamlar mevcut.
- Reklam yükleme süreleri sebebiyle "Preload" mantığı kullanılır.
- **Özel Mantık:** Bir kullanıcı "Rewarded" (Ödüllü) reklam izleyip ödül kazandığında, sistem bir flag tutar (`skipNextInterstitial = true`) ve bir sonraki sefer çıkması gereken sinir bozucu Interstitial reklamı atlar.
- **UI Uyum:** Banner arayüzün alt kısmında çıkacağı için ana oyun ekranlarında `paddingBottom: 60px` bırakılarak SafeArea sağlanmıştır (Aksi takdirde butonları kapatır).

### 5.3. Araç Marketi ve Ekonomi (Car Shop & Stars)
- Oyuncu bölüm bitirdiğinde verimliliğine göre 1, 2 veya 3 yıldız alır. (Bütçenin ne kadarının harcanmadığına göre hesaplanır).
- Yıldızlar toplanarak "Car Shop" üzerinden kozmetik araçlar (Van, Truck, Police, Cyberpunk vb.) satın alınır. Satın alınan araç Zustand store'daki `ownedCars` array'ine eklenir. `equippedCar` olarak seçilir.

## 6. Sık Karşılaşılan Sorunlar ve Çözümleri (AI İçin Kılavuz)
1. **"Araba köprüden geçerken sürekli zıplıyor":** `gameStore` içindeki `finishDrawingBeam` fonksiyonundaki Yol bölme (Splitting) algoritmasını kontrol edin. Muhtemelen son parça (0.2 birim gibi) çok küçük kaldığından "tümsek" efekti yaratıyordur. `MAX_LEN * 1.5` kuralı bunun içindir.
2. **"Reklam varken müzik çalıyor":** `App.tsx` içindeki `@capacitor/app` `appStateChange` listener'ı veya `AdManager` içindeki show() metotlarındaki `AudioManager.pauseMusic()` çağrıları zarar görmüş demektir.
3. **"Background resminde beyaz boşluklar çıkıyor":** `Scene.tsx` içindeki `ResponsiveBackground` bileşeninde `useTexture` kullanılarak aspect-ratio'ya göre manuel bir "CSS Cover" taklidi algoritması kullanılmıştır. Sabit genişlik (`viewport.width * 1.5` gibi) tabletlerde kırılmaya neden olur. Bu algoritmayı koruyun.
4. **"React Hooks Hatası Modallarda Çıkıyor":** Açılan kapatılan pencereler içinde hook (useState, useGameStore vb.) koşullu olarak render edilmemelidir. React kuralları gereği, eğer modalların (`PauseMenu`, `WinModal`) içindeki hook'lar sıkıntı yaratıyorsa logic her zaman üst sınıf olan `App.tsx`'te tutulmalı ve prop olarak modallara geçirilmelidir.

---
**Durum:** Proje yayına hazır (`Ready for Release`), v1.0.0. Tüm modüller entegre ve stable durumdadır.
