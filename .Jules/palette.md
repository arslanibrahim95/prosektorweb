## 2024-05-22 - Form Accessibility Pattern
**Learning:** Found that admin forms (CompanyForm, InvoiceForm) consistently lack `htmlFor`/`id` association between labels and inputs. This makes it impossible to focus inputs by clicking labels and hurts screen reader users.
**Action:** When creating or modifying forms, always verify that labels are explicitly associated with their inputs using `htmlFor` and matching `id`.
