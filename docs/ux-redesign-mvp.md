# UX Redesign: From "Dev Console" to "Business Command Center"

**Goal:** Transform the Admin Dashboard into a beginner-friendly tool that answers "Where do I start?" in <10 seconds.

## 1. The Primary Job
**Users come here to:** Manage client compliance and strictly control cash flow (Invoicing).

**Top 3 Tasks:**
1.  **Bill Clients:** Issue invoices and track overdue payments (Cash Flow).
2.  **Onboard Clients:** Add new companies and workplaces (Growth).
3.  **Resolve Issues:** Respond to support tickets (Retention).

## 2. First-Run Experience (MVP)
**State:** When the dashboard has 0 data (Day 1).

-   **Headline:** "Hoş geldiniz! İşlerinizi dijitalleştirmeye başlayalım."
-   **Helper Text:** "Müşterilerinizi ekleyerek iş güvenliği süreçlerini yönetmeye ve fatura kesmeye başlayın."
-   **Primary CTA (Hero):** [ + Yeni Firma Ekle ] (Action + Outcome)
-   **Secondary Actions:**
    -   [ Kullanıcı Davet Et ]
    -   [ Destek Talebi Oluştur ]

## 3. Information Architecture (3-Zone Layout)

### ZONE 1: The Pulse (Top - Immediate Attention)
*Context: "Is my business healthy right now?"*
-   **Key Metric:** **Tahsilat Durumu** (Collection Status).
    -   Show: Total Revenue (Ciro) vs. Pending (Alacak).
    -   **Alert:** "3 Gecikmiş Fatura (15.000₺)" (Red/Orange badge if actionable).
-   *Cut:* "MRR Projection" (Too theoretical for MVP).

### ZONE 2: The Workbench (Middle - Next Action)
*Context: "What should I do next?"*
-   **Primary Components:** **Quick Actions** (Large, clickable cards).
    1.  **Fatura Kes** (Create Invoice) - *Green/Money Icon*
    2.  **Firma Ekle** (Add Company) - *Brand Color/Building Icon*
    3.  **Destek Paneli** (Support) - *Red/Message Icon*

### ZONE 3: The Archive (Bottom - Context)
*Context: "What happened recently?"*
-   **Recent Items:** Last 5 modified companies or invoices.
-   *Cut:* "Raw Activity Log" (JSON dumps). Replace with "Last Interactions".

## 4. Progressive Disclosure Rules
1.  **System Health:** Hide by default. Move to `Settings > System Status`. Only show Alert on Dashboard if API/DB is DOWN.
2.  **Advanced Charts:** Hide "Financial Flow Chart" until user has >3 months of data. Show "Empty State placeholder" promoting data entry instead.
3.  **Blog Stats:** Hide unless User has "Content Manager" role or has published >0 posts.

## 5. Simplification Cuts (Hard Decisions)
| Feature | Verdict | Rationale |
| :--- | :--- | :--- |
| **System Health Panel** (DB/SSL/Latency) | **REMOVE** | Users assume the system works. Only show critical errors via Global Toast. |
| **Raw Activity Stream** (JSON details) | **MOVE** | Cognitive load. Move to dedicated `Audit Log` page. |
| **MRR / Monthly Forecast** | **HIDE** | Advanced metric. Confusing for new businesses. Unlock after 100+ invoices. |
| **"Projects" & "Workplaces" Counts** | **DEMOTE** | Sub-metrics of "Companies". Group under Company Stats or remove from top level. |
| **"Blog" Mini Stats** | **REMOVE** | Distraction from core business operations. Move to Sidebar badge. |

## 6. Usability Test Script (The Mom Test)
**Task 1:** "Business is growing. Add a new client to the system."
-   *Success:* Clicks "Firma Ekle" in <3s.
-   *Fail:* Wanders to sidebar or searching settings.

**Task 2:** "You did a job yesterday. Issue the bill for it."
-   *Success:* Finds "Fatura Kes" immediately.

**Task 3:** "Check if anyone owes us money properly."
-   *Success:* Identifies the "Bekleyen / Alacak" card in Zone 1.

**Task 4:** "A client called with a problem. Log it."
-   *Success:* Clicks "Destek Paneli".

**Interview Questions:**
1.  "Looking at this screen, what is the *first* thing you think you should do?" (Tests Hero Path).
2.  "Is there anything on this screen you would be afraid to click?" (Tests jargon/complexity).
3.  "If you wanted to see how much money you made today, where would you look?" (Tests Zone 1 clarity).

## 7. Implementation Note (Action Plan)
To implement this MVP:
1.  Modify `admin/page.tsx`.
2.  Delete `<HealthRow>` and `System Health` section.
3.  Remove `JSON.parse` logic from Activity Feed; replace with simple "Entity updated" text or remove widget entirely.
4.  Limit `SpotlightCard`s to max 3 (Revenue, Pending, Active Issues).
5.  Center `QuickAction`s as the Hero section.
