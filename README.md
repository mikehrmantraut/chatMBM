# ChatMBM - AI Sohbet Uygulaması

Modern web tabanlı AI sohbet uygulaması. OpenRouter API kullanarak çeşitli dil modelleriyle etkileşim kurun.

## 🚀 Özellikler

- 🤖 **Çoklu AI Model Desteği** - OpenRouter üzerinden çeşitli ücretsiz ve ücretli modellere erişim
- 💬 **Gerçek Zamanlı Sohbet** - Akıcı mesajlaşma deneyimi
- 📚 **Sohbet Geçmişi** - Konuşmalarınızı kaydedin ve yönetin
- 🔧 **Model Seçimi** - İstediğiniz AI modelini seçin
- 📊 **OpenTelemetry İzleme** - Performans ve kullanım analizi
- 🎨 **Modern UI/UX** - Responsive ve kullanıcı dostu arayüz

## 🛠️ Teknolojiler

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **API**: OpenRouter Gateway
- **İzleme**: OpenTelemetry + Jaeger
- **Icons**: Lucide React

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- OpenRouter API anahtarı
- Docker (OpenTelemetry için)

## 🚀 Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd chatmbm
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment değişkenlerini ayarlayın**
   ```bash
   cp env.example .env
   ```
   
   `.env` dosyasını düzenleyip OpenRouter API anahtarınızı ekleyin:
   ```
   VITE_OPENROUTER_API_KEY=your_api_key_here
   VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
   VITE_OTEL_SERVICE_NAME=chatmbm
   ```

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 🔧 OpenTelemetry Kurulumu

Yerel geliştirme için Jaeger ile OpenTelemetry kullanmak istiyorsanız:

1. **Docker Compose ile servisleri başlatın**
   ```bash
   docker-compose up -d
   ```

2. **Jaeger UI'ya erişin**
   ```
   http://localhost:16686
   ```

3. **OpenTelemetry Collector UI'ya erişin**
   ```
   http://localhost:8888
   ```

### Telemetri Özellikleri

- **Trace'ler**: API çağrıları, kullanıcı etkileşimleri
- **Span'lar**: Mesaj gönderme, model seçimi, hata yönetimi
- **Metrikler**: Token kullanımı, yanıt süreleri
- **Event'ler**: Kullanıcı aksiyonları, sistem olayları

## 📝 Kullanım

1. **Model Seçimi**: Ayarlar sekmesinden istediğiniz AI modelini seçin
2. **Sohbet Başlatın**: Sohbet sekmesinde mesaj yazmaya başlayın
3. **Geçmişi Görüntüleyin**: Tüm konuşmalarınızı geçmiş sekmesinde bulabilirsiniz

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [OpenRouter](https://openrouter.ai/) - AI model erişimi için
- [OpenTelemetry](https://opentelemetry.io/) - Observability için
- [React](https://reactjs.org/) - UI framework için
