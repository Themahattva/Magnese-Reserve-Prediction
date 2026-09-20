# UX4G Design System 3.0 Deviation Report
**Project:** ANVESHA — Uncertainty-Aware AI for Manganese Exploration & Production
**Authority:** National e-Governance Division (NeGD), MeitY, Government of India
**Date of Audit:** 2026-09-20
**Status:** ZERO (0) VISUAL OR STRUCTURAL DEVIATIONS CONFIRMED

---

## 1. Compliance Audit Overview

| Audit Category | Specification Requirement | Implementation Status | Deviations |
| :--- | :--- | :--- | :--- |
| **Brand Primary Token** | Mandated `#4A2BC2` (UX4G Deep Indigo) | Applied globally across all pages, buttons, headers, borders, and active tabs | **None (0)** |
| **National Identity Strip** | Mandated Saffron (`#FF9933`), White (`#FFFFFF`), Green (`#138808`) tricolor bar | Rendered in top `AccessibilityBar.tsx` across all viewport sizes | **None (0)** |
| **Typography Standard** | Mandated Google Noto Sans with tabular figures for geological data | Configured in `globals.css` via Google Fonts import with CSS fallback stack | **None (0)** |
| **WCAG Accessibility** | WCAG 2.1 AA compliant (contrast ≥ 4.5:1, keyboard skip link, font scaling) | Skip-to-main link, dynamic A-/A/A+ zoom engine, high-contrast mode toggle | **None (0)** |
| **Aesthetic Prohibition** | Strict ban on matrix green phosphor terminal aesthetic and sci-fi glowing fonts | Completely purged; replaced with clean, neutral government dashboard cards | **None (0)** |
| **Scientific Honesty** | Honest uncertainty communication (`inferred`, `estimated`, confidence bounds) | All ML/geostatistical outputs explicitly convey confidence levels and error ranges | **None (0)** |
| **Human-in-the-Loop** | Mandatory human sign-off workflow for drilling proposals & dispatch actions | Integrated Decision Center (`/decisions`) requires explicit user approval & audit log | **None (0)** |

---

## 2. Token Registry Verification

The following official tokens from `ux4g-web-components` are compiled and active in `frontend/src/app/globals.css`:

```css
:root {
  --ux4g-primary: #4A2BC2;
  --ux4g-primary-hover: #3D22A0;
  --ux4g-primary-subtle: #EDE9FE;
  --ux4g-primary-border: #DDD6FE;
  --ux4g-saffron: #FF9933;
  --ux4g-green: #138808;
  --ux4g-navy: #000080;
  --bg-body: #F8F9FB;
  --bg-surface: #FFFFFF;
  --bg-subtle: #F1F3F7;
  --border-default: #E2E6EE;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --status-low: #0D9488;
  --status-medium: #D97706;
  --status-high: #DC2626;
  --status-critical: #991B1B;
}
```

---

## 3. Conclusion & Certification
The ANVESHA user interface strictly satisfies all NeGD and UX4G 3.0 requirements. No unapproved third-party utility frameworks (e.g. Tailwind) or competing design languages were introduced. All visual presentation is unified under the official Government of India e-Governance standard.
