# care_patient_geo_fe

> Adds a "current location" capture to patient registration in the [CARE](https://github.com/ohcnetwork/care_fe) EMR.

`care_patient_geo_fe` is a **Care Frontend plugin** for **field/home-visit
registration** — a staff member registering a patient while physically at the
patient's location (e.g. a home visit) can attach that location to the
patient's address as a plain `https://` Maps link, so opening it later
just works, in any browser or map app, without needing a native app scheme.

It captures the **device's** current location, so it's only meaningful when
registration happens at the patient's own location — not when registering
from a facility desk.

It runs as a **Vite Module Federation remote** loaded by
[`care_fe`](https://github.com/ohcnetwork/care_fe) and hooks into the
`PatientRegistrationForm` plugin extension point.

---

## What it does

- Renders a **"Get current location"** control on the patient registration
  form (create and edit), positioned after the form sections.
- On click, reads the browser's geolocation (`navigator.geolocation`) and
  builds a Maps
  [search URL](`https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`) — a real,
  clickable `https://` link that native map apps still intercept via
  universal/app links when installed, unlike a bare `geo:` URI.
- Appends the link to the patient's `address` field (on its own line,
  replacing any previously-appended link instead of duplicating it), and
  mirrors it into `permanent_address` when "same as address" is checked.
- Briefly highlights the address field so the change is noticeable.
- Reactively watches the `address` field, so if it already contains a
  captured link — including one that loads asynchronously when editing an
  existing patient — the control shows the "already added" state and an
  "Update location" button instead of prompting again.

---

## How it works (in brief)

```text
care_fe (host) ──loads remoteEntry.js──▶ manifest.ts
                                            │
                            components.PatientRegistrationForm
                                            ▼
                              PatientLocationCapture
                                            │
              ┌─────────────────────────────┼─────────────────────────┐
              ▼                             ▼                         ▼
   navigator.geolocation          form.setValue("address", …)   highlightAddressField()
   (buildMapsUrl)                 form.watch("address")         (host DOM, outside this
                                   (reactive re-sync)             plugin's own tree)
```

`care_fe` renders `<PLUGIN_Component __name="PatientRegistrationForm" form={form} .../>`
directly inside the registration form, passing the live `react-hook-form`
instance. This plugin doesn't depend on `react-hook-form` itself — it only
relies on a small duck-typed subset (`getValues`, `setValue`, `watch`).

---

## Getting started

### Prerequisites

- **Node.js ≥ 22.9.0**
- A running **[care_fe](https://github.com/ohcnetwork/care_fe)** instance configured to load this plugin

### Setup

```bash
npm install
npm start
```

`npm start` runs two processes concurrently:

| Script        | What it does                                             |
| ------------- | --------------------------------------------------------- |
| `build:watch` | Nodemon watches `src/` and runs `vite build` on changes  |
| `preview`     | Serves built assets on **port 10123** with CORS enabled |

### care_fe registration

**Local development** — via `REACT_ENABLED_APPS` in care_fe's `.env.local`:

```
REACT_ENABLED_APPS=ohcnetwork/care_patient_geo_fe@localhost:10123/assets/remoteEntry.js
```

**Deployed** — register via the admin panel / `plug_config` API:

```json
{
  "url": "https://<host>/assets/remoteEntry.js",
  "name": "care_patient_geo_fe"
}
```

care_fe resolves the package, loads `remoteEntry.js`, and mounts
`PatientLocationCapture` wherever it renders the `PatientRegistrationForm`
extension point. No plugin-side config is required.

---

## Project structure

```text
src/
├── manifest.ts                     # Plugin manifest (components.PatientRegistrationForm)
├── routes.tsx                      # No standalone pages — empty routes object
├── index.tsx                       # Module-federation entry + exports
├── components/
│   ├── PatientLocationCapture.tsx  # The capture control itself
│   └── ui/button.tsx               # Local Button primitive (cva-based)
├── hooks/
│   └── useTranslation.ts           # i18next scoped to this plugin's namespace
└── lib/
    ├── geo.ts                      # buildMapsUrl / append / extract helpers
    ├── highlightAddressField.ts    # Flashes the host's address textarea
    └── utils.ts                    # cn() class-merge helper
```

---

## Scripts

- `npm start` — Build in watch mode + preview server
- `npm run build` — Production build (`vite build`)
- `npm run preview` — Serve built assets on port 10123
- `npm run lint` — Run ESLint over `src/`
- `npm run lint-fix` — Run ESLint with `--fix`
- `npm run format` — Format `src/` with Prettier
- `npm run sort-locales` — Sort `public/locale/*.json` keys
