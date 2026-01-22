# Deployment Integration Interface

Bu belge, Claude Code veya diğer AI asistanlarının ürettiği sitelerin sunucuya nasıl aktarılacağını tanımlar.

## Çıktı Dizini

Tüm siteler `/root/generated_sites/{domain}/` altında toplanır.

## Manifest Yapısı

Her site klasöründe `manifest.json` dosyası **zorunludur**:

```json
{
  "version": "1.0",
  "company": {
    "id": "uuid",
    "name": "Firma Adı"
  },
  "domain": {
    "primary": "ornek.com",
    "alternates": ["www.ornek.com"]
  },
  "status": "pending",
  "aapanel": {
    "webname": "{\"domain\":\"ornek.com\"}",
    "path": "/www/wwwroot/ornek.com",
    "type": "PHP",
    "version": "00",
    "port": "80",
    "ps": "Firma Adı",
    "ftp": "false",
    "sql": "false",
    "codeing": "utf8"
  },
  "dns": {
    "domain": "ornek.com",
    "act": "add"
  }
}
```

## Status Değerleri

| Status | Açıklama |
|--------|----------|
| `pending` | Deploy bekliyor |
| `deployed` | Başarıyla yayında |
| `failed` | Deploy başarısız |

## İş Akışı

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI/Claude     │     │ generated_sites/ │     │  site_manager   │
│   Code          │ ──► │ {domain}/        │ ──► │  (cron/manual)  │
│   (site üretir) │     │ manifest.json    │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │    aaPanel      │
                                                 │  (site deploy)  │
                                                 └─────────────────┘
```

1. **AI/Claude Code** siteyi HTML/CSS/JS olarak üretir
2. `SiteExporter.createManifest()` ile manifest.json oluşturulur
3. Site dosyaları `/root/generated_sites/{domain}/` altına kopyalanır
4. Sunucudaki `site_manager_integration.py` periyodik olarak çalışır
5. Script, `pending` durumundaki siteleri bulur ve aaPanel'e deploy eder
6. Deploy sonrası status `deployed` veya `failed` olarak güncellenir

## Kullanım

### TypeScript (AI Tarafı)

```typescript
import { SiteExporter } from '@/lib/deploy/exporter';

await SiteExporter.createManifest({
  domain: 'ornek.com',
  companyName: 'Örnek Firma',
  companyId: 'uuid-xxx',
  outputDir: '/root/generated_sites'
});
```

### Python (Sunucu Tarafı)

```bash
# Manuel çalıştırma
python3 /root/scripts/site_manager_integration.py

# Cron job (her 5 dakikada bir)
*/5 * * * * /usr/bin/python3 /root/scripts/site_manager_integration.py >> /var/log/site_manager.log 2>&1
```

## Dosya Yapısı

```
/root/generated_sites/
├── ornek.com/
│   ├── manifest.json    # Zorunlu
│   ├── index.html
│   ├── styles.css
│   └── assets/
│       └── ...
└── baska-site.com/
    └── ...
```
