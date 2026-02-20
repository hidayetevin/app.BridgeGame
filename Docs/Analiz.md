# Bridge Constructor - Teknik ve Oyun Analizi

Bu döküman, **Bridge Constructor** projesinin mevcut durumunu, teknik mimarisini ve oyun mekaniklerini detaylı bir şekilde açıklamaktadır.

## 1. Genel Bakış
Proje, kullanıcıların fizik tabanlı bir dünyada köprüler inşa ettiği ve bir aracın bu köprüden güvenli bir şekilde geçmesini sağlamaya çalıştığı bir simülasyon oyunudur. **React**, **Three.js** ve **Physics (Cannon.js)** temelleri üzerine kurulmuştur.

## 2. Teknik Yığın (Tech Stack)
- **Framework:** React 19 (Vite ile)
- **3D Render:** [React Three Fiber (R3F)](https://github.com/pmndrs/react-three-fiber)
- **Fizik Motoru:** [@react-three/cannon](https://github.com/pmndrs/use-cannon) (Cannon-es tabanlı)
- **State Yönetimi:** [Zustand](https://github.com/pmndrs/zustand)
- **Programlama Dili:** TypeScript
- **Styling:** Tailwind CSS
- **Mobil Entegrasyon:** Capacitor (Android/iOS çıktıları için hazır)

## 3. Mimari Yapı

### 3.1. State Yönetimi (`src/store/gameStore.ts`)
Zustand kullanılarak merkezi bir store oluşturulmuştur. Tüm oyun mantığı burada döner:
- **Node/Beam Verileri:** Köprü noktaları ve onları bağlayan kirişler.
- **Oyun Modu:** `editor` (inşa) ve `simulation` (test) modları arası geçiş.
- **Bütçe Sistemi:** Her malzemenin birim maliyeti vardır. İnşa sırasında bütçeden düşülür, silindiğinde iade edilir.
- **Timer:** Simülasyon sırasında çalışan geri sayım.
- **Physics Registry:** Fizik gövdelerinin (`ref` ve `api`) takibi.

### 3.2. Fizik Sistemi
Fizik dünyası `PhysicsWorld.tsx` içinde tanımlanır.
- **Constraints (Kısıtlayıcılar):** Kirişler (Beams), iki Node arasına `usePointToPointConstraint` ile bağlanır.
- **Beam Breaking (Kırılma):** Her kirişin bir dayanıklılık (`strength`) ve esneklik (`stiffness`) değeri vardır. İki uç noktasının arasındaki mesafe, orijinal uzunluktan çok saparsa kiriş "kırılır" (bir uçtaki bağlantısı kopar).
- **Road Splitting (Yol Bölme):** Uzun yol parçaları (Road) otomatik olarak maksimum 3 birimlik parçalara bölünür. Bu, uzun yolların "demir çubuk" gibi kaskatı kalmasını engeller ve gerçekçi bir esneme sağlar.

### 3.3. Bileşenler (`src/components/`)
- **Scene:** Işıklandırma, gökyüzü ve mod geçişlerini yöneten ana 3D sahne.
- **Vehicle:** Aracın fiziksel gövdesi, tekerlek kontrolleri ve kazanma/kaybetme tetikleyicileri.
- **NodeComponent / BeamComponent:** Editör modundaki görselleştirme.
- **NodePhysics / BeamPhysics:** Simülasyon modundaki fiziksel etkileşimler.

## 4. Oyun Mekanikleri

### 4.1. Malzemeler
| Malzeme | Görsel | Özellikler |
| :--- | :--- | :--- |
| **Road** | 🛣️ | Aracın üzerinde gidebildiği tek yüzeydir. Otomatik bölünme özelliğine sahiptir. |
| **Wood** | 🪵 | Ucuz ve hafif, ancak dayanıksızdır. |
| **Steel** | 🏗️ | Pahalı ve ağır, ancak çok güçlüdür. |

### 4.2. Kazanma ve Kaybetme Koşulları
- **Kazanç:** Araç seviyenin bitiş noktasına ulaştığında.
- **Kayıp:** 
    - Aracın suya (belli bir Y seviyesinin altına) düşmesi.
    - Simülasyon süresinin (`timeLimit`) dolması.

### 4.3. Editör ve Grid Sistemi
- Kullanıcılar ekrana tıklayarak Node oluşturur ve sürükleyerek Beam (Kiriş) çekerler.
- Grid sistemi (opsiyonel ama kodda destekli) hassas hizalama sağlar.
- `GhostBeam` özelliği ile inşa edilmeden önce maliyet ve uzunluk görselleştirilir.

## 5. Veri Yapısı

### Seviye Tanımları (`src/data/levels.ts`)
Her seviye şunları içerir:
- `id`, `name`: Tanımlayıcılar.
- `anchors`: Sabitlenen, hareket etmeyen başlangıç noktaları (örn: uçurumun kenarları).
- `budget`: Maksimum harcama limiti.
- `timeLimit`: Simülasyonun kaç saniye içinde tamamlanması gerektiği.
- `targetX`: Aracın ulaşması gereken hedef koordinat.

## 6. Teknik Notlar ve Püf Noktaları
1. **Z-Ekseni Kilidi:** Oyun 2D mantığında çalıştığı için tüm fizik gövdeleri `angularFactor: [0, 0, 1]` ile Z ekseninde dönmeye, `position` olarak ise Z=0 düzlemine kilitlenmiştir.
2. **Stress Visuals:** Kirişler üzerindeki stres, uç noktaların birbirinden uzaklaşma miktarıyla ölçülür. (Bazı versiyonlarda renk değişimi mevcuttur).
3. **Texture Tiling:** Yol dokusu (texture), yolun uzunluğuna göre `RepeatWrapping` ile tekrar eder, böylece görüntü bozulmaz.

---
*Bu döküman proje geliştirildikçe güncellenmelidir.*
