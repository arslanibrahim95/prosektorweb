# NAP Optimization

> Name, Address, Phone consistency for local SEO.

---

## 1. What is NAP?

**NAP** = Name, Address, Phone

The foundational elements of local SEO. Consistency across all platforms is critical for:
- Search engine trust
- Citation building
- Local ranking signals

---

## 2. NAP Format Standards

### Business Name
```
✅ Correct: ABC Dental Clinic
❌ Wrong: ABC Dental Clinic - Best Dentist in Istanbul
❌ Wrong: abc dental clinic
❌ Wrong: ABC DENTAL CLINIC
```

**Rules:**
- Use exact legal business name
- No keyword stuffing
- Consistent capitalization
- No location suffixes (unless part of legal name)

### Address
```
✅ Correct:
Bağdat Caddesi No: 123
Kadıköy, Istanbul 34710
Turkey

❌ Wrong:
Bagdat Cad. 123
Kadikoy Istanbul
```

**Rules:**
- Use official postal format
- Include postal code
- Consistent abbreviations (or none)
- Include suite/floor if applicable

### Phone Number
```
✅ Correct: +90 216 555 1234
✅ Correct: (0216) 555 12 34
❌ Wrong: 02165551234
❌ Wrong: 216-555-1234
```

**Rules:**
- Choose one format
- Include country code for international
- Use local format for local audiences
- Trackable numbers OK if consistent

---

## 3. NAP Audit Process

### Step 1: Document Master NAP
Create a master document with exact NAP:

```
MASTER NAP
==========
Name: ABC İş Sağlığı ve Güvenliği Ltd. Şti.
Address: Atatürk Bulvarı No: 45/3, Çankaya, Ankara 06680, Turkey
Phone: +90 312 555 1234
Website: https://abc-osgb.com.tr
```

### Step 2: Audit Current Citations
Check NAP on:
- [ ] Website (header, footer, contact page)
- [ ] Google Business Profile
- [ ] Social media profiles
- [ ] Directory listings
- [ ] Review sites
- [ ] Industry directories

### Step 3: Document Discrepancies
| Platform | Name | Address | Phone | Status |
|----------|------|---------|-------|--------|
| Website | ✅ | ✅ | ✅ | OK |
| Google | ✅ | ❌ | ✅ | Fix Address |
| Yelp | ❌ | ❌ | ✅ | Fix Name, Address |

### Step 4: Fix Issues
Prioritize by platform importance:
1. Google Business Profile
2. Website
3. Major directories
4. Social media
5. Minor citations

---

## 4. Website NAP Implementation

### Header/Footer
```html
<footer>
  <div itemscope itemtype="https://schema.org/LocalBusiness">
    <span itemprop="name">ABC İş Sağlığı</span>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
      <span itemprop="streetAddress">Atatürk Bulvarı No: 45/3</span>
      <span itemprop="addressLocality">Çankaya</span>,
      <span itemprop="addressRegion">Ankara</span>
      <span itemprop="postalCode">06680</span>
    </div>
    <span itemprop="telephone">+90 312 555 1234</span>
  </div>
</footer>
```

### Contact Page
- Embed Google Map
- Include all NAP elements
- Add structured data
- Provide directions

---

## 5. Multi-Location Businesses

### URL Structure
```
example.com/lokasyonlar/istanbul/
example.com/lokasyonlar/ankara/
example.com/lokasyonlar/izmir/
```

### Per-Location Requirements
- Unique NAP for each location
- Separate Google Business Profile
- Location-specific schema
- Local content for each

---

## 6. Common NAP Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Different business names | Confuses search engines | Standardize |
| Old address still live | Duplicate listings | Update everywhere |
| Multiple phone numbers | Dilutes signals | Use primary number |
| Inconsistent abbreviations | Reduces trust | Standardize format |
| Missing postal code | Incomplete data | Add to all |

---

## 7. NAP Monitoring

### Regular Checks
- Monthly: Major platforms
- Quarterly: All citations
- Annually: Full audit

### Tools
- Manual checks
- Citation tracking services
- Google Alerts for business name

---

## 8. Schema Implementation

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ABC İş Sağlığı ve Güvenliği",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Atatürk Bulvarı No: 45/3",
    "addressLocality": "Çankaya",
    "addressRegion": "Ankara",
    "postalCode": "06680",
    "addressCountry": "TR"
  },
  "telephone": "+90-312-555-1234",
  "url": "https://abc-osgb.com.tr"
}
```

---

> **Rule:** NAP inconsistency = Local ranking penalty. Audit regularly.
