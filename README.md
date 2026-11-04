## 📦 Mini Lorrigo — Multi-Carrier Shipping Aggregator & Lifecycle Engine

A full-stack shipping aggregator web application built with **React (Tailwind CSS)**, **Node.js/Express (ES Modules)**, and **MongoDB**. Designed for e-commerce sellers to calculate accurate shipping rates, compare courier quotes, book shipments, and manage strict logistics status lifecycles with automated NDR/RTO enforcement.

## ✨ Key Features & Business Logic

1. **Smart Zone Detection:**
   - Automatically detects **Local** (first 3 pincode digits match), **Regional** (first 2 digits match), or **National** zones.

2. **Volumetric & Slab Weight Engine:**
   - Volumetric weight formula: `(L × B × H) / 5000`.

   - Billed weight takes `max(Actual, Volumetric)` and rounds **up** to the nearest **0.5 kg slab**.

3. **Multi-Carrier Quote Comparison:**
   - Compares **SwiftShip**, **BharatExpress**, and **QuickParcel** based on base rates, extra slabs, and COD fees (sorted cheapest first).

4. **Unique AWB Generation:**
   - Generates unique indexed AWB numbers (`LRG` + 8 random digits) with initial `CREATED` state.

5. **Strict Status Lifecycle & State Machine:**
   - Enforces valid forward-only transitions (`CREATED` → `PICKED_UP` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` / `NDR`).

   - **Automated RTO:** Automatically triggers `RTO_INITIATED` upon reaching **3 failed NDR attempts**.

## 🗂️ Project Architecture

```
mini-lorrigo/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection setup
│   ├── controllers/
│   │   └── shipmentController.js  # Rate calculation, booking & status logic
│   ├── models/
│   │   └── Shipment.js            # Mongoose schema (with unique AWB index)
│   ├── routes/
│   │   └── shipmentRoutes.js      # Express API router
│   ├── utils/
│   │   └── pricing.js             # Pricing math, zone detection & state machine rules
│   └── server.js                  # Entry point (ES Modules enabled)
└── frontend/
    └── src/
        ├── components/
        │   ├── RateCalculator.jsx   # Rate comparison & booking UI component
        │   └── ShipmentTracker.jsx  # Live AWB lookup & status simulator component
        ├── App.jsx                  # Main dashboard layout & navigation shell
        └── index.css                # Tailwind CSS styling

```

## 🛠️ Local Installation & Setup

### 1. Clone the Repository

```
git clone https://github.com/nickdevtech/mini-lorrigo.git
cd mini-lorrigo

```

### 2. Run Backend Server

```
cd backend
npm install
node server.js

```

_(Server runs on `http://localhost:8000`)_

### 3. Run Frontend App

Open a separate terminal window:

```
cd frontend
npm install
npm run dev

```

_(Frontend runs on `http://localhost:5173`)_

## 📡 Core API Endpoints

| Method | Endpoint                     | Description                                        |
| ------ | ---------------------------- | -------------------------------------------------- |
| `POST` | `/api/rates`                 | Calculate zone, billed weight, and courier quotes  |
| `POST` | `/api/shipments`             | Book shipment & generate unique AWB                |
| `GET`  | `/api/shipments`             | Fetch all booked shipments                         |
| `GET`  | `/api/shipments/:awb`        | Track shipment details & history log               |
| `POST` | `/api/shipments/:awb/status` | Update status (enforces state machine & RTO rules) |

git add frontend/src/components/ShipmentTracker.jsx
git commit -m "feat(ui): add ShipmentTracker component with lifecycle progress bar and simulator"

git add frontend/src/App.jsx
git commit -m "feat(ui): integrate RateCalculator and ShipmentTracker in main dashboard layout"
git push