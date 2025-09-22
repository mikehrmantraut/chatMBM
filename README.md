# ChatMBM

Web tabanlı bir sohbet uygulaması geliştirdim. OpenRouter üzerinden farklı dil modellerine bağlanarak mesajlaşmayı sağlıyor. Uygulama React + TypeScript ile yazıldı, Vite ile derleniyor ve ön yüzde OpenTelemetry ile izleme (tracing) yapıyorum. Yerelde Jaeger ile trace’leri görüntüleyebiliyorum.

## Ne işe yarıyor?

– Farklı AI modellerinden (OpenRouter) cevap alarak sohbet etmemi sağlıyor.
– Sohbet oturumları ve geçmişini yönetiyorum.
– İstek/yanıt süreleri ve hatalar için tarayıcı tarafında trace topluyorum (OpenTelemetry) ve Jaeger ile inceliyorum.

## Teknik seçimler ve gerekçeler

– React 18 + TypeScript + Vite: Hızlı geliştirme döngüsü, güçlü tip güvenliği ve modern build zinciri için tercih ettim.
– Tailwind CSS: Bileşen bazlı, hızlı ve tutarlı stil oluşturmak için kullanıyorum.
– OpenRouter API: Tek bir arayüz üzerinden çok sayıda model sağlayıcısına erişebildiğim için basit ve esnek.
– OpenTelemetry (Web SDK) + OTLP/HTTP: Tarayıcıdan Collector’a standart OTLP/HTTP ile export ediyorum; Vite ortam değişkenleriyle uç noktayı kolayca yönetiyorum.
– Jaeger (all-in-one): Yerel ortamda hızlı kurulum ve görselleştirme için ideal. Collector’dan Jaeger’a gRPC ile aktarıyorum.
– CORS ve header politikası: Üçüncü parti origin’lere W3C trace header’larını göndermemek için `propagateTraceHeaderCorsUrls: []` kullanıyorum; bu sayede preflight/CORS sorunlarından kaçınıyorum. Collector tarafında `otel-collector-config.yaml` içinde OTLP HTTP için CORS açık.

## Gereksinimler

– Node.js 18+
– npm
– OpenRouter API anahtarı
– Docker (Jaeger ve OpenTelemetry Collector için)

## Kurulum ve çalıştırma (yerel)

1) Depoyu klonla
```
git clone <repository-url>
cd chatmbm
```

2) Bağımlılıkları yükle
```
npm install
```

3) Ortam değişkenlerini ayarla
```
copy env.example .env        # Windows PowerShell / CMD
# cp env.example .env        # macOS/Linux
```
`.env` dosyasını düzenleyip anahtarı ekliyorum:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
VITE_OTEL_SERVICE_NAME=chatmbm
```

4) Telemetri servislerini başlat (opsiyonel ama önerilir)
```
docker compose up -d
# veya
docker-compose up -d
```
– `otel-collector` 4317 (gRPC) ve 4318 (HTTP) portlarında OTLP alır.
– `jaeger` arayüzü 16686 portundadır.

5) Geliştirme sunucusunu çalıştır
```
npm run dev
```
Tarayıcıdan `http://localhost:3000` adresine giriyorum.

## Jaeger arayüzü ve trace görüntüleme

– Jaeger UI: `http://localhost:16686`
– Sol üstten Service alanında servis adını seçiyorum: `chatmbm` (veya `.env` içinde verdiğim `VITE_OTEL_SERVICE_NAME`).
– Trace’leri listeledikten sonra zaman aralığına göre filtreleyip detaylara giriyorum.
– Uygulama içinde özellikle `openrouter.request` gibi operasyon adlarıyla istekleri görebilirim. HTTP method, URL, durum kodu ve hata durumunda istisna bilgileri span üzerinde işlenir.

Veri akışı: Tarayıcı → OTLP/HTTP (`http://localhost:4318/v1/traces`) → OpenTelemetry Collector → Jaeger (gRPC 4317)

Notlar:
– Collector yapılandırması `otel-collector-config.yaml` dosyasındadır. CORS `http` alıcısında açık durumdadır.
– Trace header’ları üçüncü taraf domain’lere enjekte edilmez; sadece tarayıcı tarafında span’lar oluşturulur ve Collector’a gönderilir.

## Komutlar

– Geliştirme: `npm run dev`
– Üretim derlemesi: `npm run build`
– Ön izleme: `npm run preview`

## Lisans

Bu proje MIT lisansı ile lisanslıdır. Ayrıntılar için `LICENSE` dosyasına bakıyorum.
