# Bütçe Takibi

Türkçe arayüze sahip, yerel depolama kullanan kişisel bütçe takip uygulaması. React ve Vite ile hazırlanmıştır.

## Gereksinimler

- Node.js 18 veya üzeri
- npm

## Kurulum ve çalıştırma

Proje klasöründe terminal açın ve aşağıdaki komutları çalıştırın:

```bash
npm install
npm run dev
```

Vite'ın gösterdiği yerel adresi (genellikle `http://localhost:5173`) tarayıcıda açın. Üretim derlemesi için `npm run build`, derlemeyi yerel olarak görüntülemek için `npm run preview` komutlarını kullanın.

## Özellikler

- Gelir ve gider ekleme, düzenleme ve onaylı silme.
- Toplam bakiye, aylık gelir/gider ve tasarruf oranı özeti; önceki ayla karşılaştırma.
- İşlem türü, kategori, ay, gün ve metin aramasına göre filtreleme.
- Uygulanan filtrelere göre işlem geçmişini UTF-8 CSV olarak dışa aktarma.
- Altı aylık gelir/gider grafiği, kategori dağılımı ve zaman içindeki bakiye grafiği.
- İşlemleri tarayıcının `localStorage` alanında saklama.
- İlk kullanımda düzenleme/silme kapalı örnek işlemler; ilk gerçek kayıt eklendiğinde örnekler kalıcı depoya yazılmaz.
- Örnek işlemleri de onayla tek tek kaldırma; gizlenen örnek kimlikleri ayrı bir LocalStorage anahtarında saklanır.
- Kişiselleştirilebilir hesap adı, işlem/toast bildirimleri ve silme onayı.
- Ayarlardan seçilebilen koyu/açık tema; görünüm tercihi tarayıcıda saklanır.
- Sabit Türk Lirası (₺) gösterimi.
- Masaüstü, tablet ve mobil ekranlara uyumlu; mobilde açılır navigasyon.

## Proje yapısı

- `src/components/`: Sidebar, üst başlık, özet kartları, grafikler, işlem listesi ve işlem formu.
- `src/pages/Dashboard.jsx`: Sayfa düzeni ve ana uygulama akışı.
- `src/hooks/useTransactions.js`: İşlem state'i ve tarayıcı depolama işlemleri.
- `src/utils/calculations.js`: Para/tarih biçimlendirme, önceki ay karşılaştırmaları, grafik ve filtre yardımcıları.
- `src/index.css`: Uygulama stilleri ve responsive kurallar.

İşlemler `budgetflow.transactions.v1`, gizlenen örnek işlemler `budgetflow.samples.dismissed.v1`, görünen hesap adı `budgetflow.profile.v1` anahtarında saklanır. Veriler uygulamanın çalıştığı tarayıcı ve cihazda tutulur; başka cihazlarla eşitlenmez.
