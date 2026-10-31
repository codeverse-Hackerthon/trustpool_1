# TrustPool 🛡️⚖️
> **"Share Resources. Build Trust."**  
> A trusted and fair shared-resource platform where users can discover, request, book, use, and return shared campus and institutional equipment, laboratories, event spaces, and professional facilities.

---

## 💡 The Problem

Shared resources on campuses and within institutions suffer from critical operational failures:
- **Underutilization & Hoarding:** Valuable lab equipment and facilities sit idle while high-demand slots are monopolized by a few users.
- **Unfair Allocation:** Traditional first-come, first-served systems disadvantage students with urgent academic deadlines, high trust scores, or previous under-allocation.
- **Lack of Accountability & Friction:** Manual sign-outs lead to unreturned equipment, damage disputes with zero photographic proof, and lost deposits.
- **Custodian Burnout:** Resource owners lack automated verification tools to check condition integrity and track physical custody in real time.

---

## 🚀 The TrustPool Solution

TrustPool replaces manual logs and unfair booking queues with an **algorithmic fairness engine**, **optical QR tracking**, and an **immutable condition verification workflow**:

```
Discover Resources ➔ Request Booking ➔ Fair Allocation ➔ QR Check-in ➔ Active Usage ➔ Return & Condition Verify
```

---

## ✨ Key Differentiating Features

### 1. ⚖️ Fair Allocation Engine (Differentiator)
TrustPool does not use naive first-come-first-served scheduling. When resources face contested demand, our multi-factor Fair Allocation Algorithm ranks requests based on:
- **Fair Access Score (0–100):** Continuous score reflecting return timeliness, resource care, and historical quota utilization.
- **Need Urgency & Purpose:** Academic milestones, thesis projects, and coursework requirements receive priority over general bookings.
- **Recency & Quota Balance:** Users who haven’t accessed high-demand resources recently receive a fairness boost to prevent monopolization.
- **Transparent Reasoning:** Every student sees exactly why their request was prioritized or waitlisted, with an interactive "What-If" simulator to understand how returning items on time improves future access.

### 2. 📱 Optical QR Resource Access & Session Monitoring
- **Live Optical Scanner:** Powered by `html5-qrcode` with camera switching, targeting reticle, and file upload fallback.
- **Institutional Digital Pass:** Instant display of cryptographic booking token, custodian verification seals, and security credentials.
- **Active Loan Clock:** Real-time countdown timer during physical custody with automatic warning alerts for approaching loan limits.

### 3. 📸 Before vs After Condition Verification & Audit Sealing
- **Pre-Use Inspection:** Mandatory photo upload, functional checklist, and timestamped condition baseline before physical release.
- **Return Inspection:** Side-by-side photographic comparison matrix comparing pre-use vs return evidence.
- **Custodian Audit Match:** Custodians verify resource condition, award Trust Score bonuses (+2 pts) for mint condition returns, or initiate incident workflows.

### 4. ⚖️ Incident Desk & Administrative Arbitration
- **Tiered Dispute Resolution:** Owners can resolve minor issues informally or escalate severe infractions to the campus administrative docket.
- **Audit Logging:** Every reservation, check-in, condition report, and admin ruling creates a tamper-evident audit log with actor ID, IP address, and timestamp.

### 5. 📊 Institutional Analytics (Recharts)
- **Owner Dashboard:** Live capacity tracking, daily circulation volumes, category utilization radar, and return integrity distributions.
- **Admin Command Center:** Campus-wide peak demand heatmap, department allocation fairness metrics, and trust score health distributions.

---

## 🛠️ Architecture & Tech Stack

```
trustpool/
├── src/
│   ├── assets/              # Branding, icons, logos
│   ├── components/
│   │   ├── booking/         # Multi-step booking modal with conflict detection
│   │   ├── common/          # Atomic UI: Button, Input, Modal, Badge, Card, Table
│   │   ├── feedback/        # Loading skeletons, empty states, error states
│   │   ├── layout/          # Public, Student, Owner, and Admin shells
│   │   └── qr/              # Optical QR Scanner with html5-qrcode
│   ├── data/                # Seed data, mock resource catalog, and audit trails
│   ├── hooks/               # Custom React hooks (auth, query, notifications)
│   ├── pages/
│   │   ├── admin/           # Admin governance, audits, incident arbitration
│   │   ├── owner/           # Custodian desk, returns, inventory management
│   │   ├── public/          # Landing page with problem/solution interactive hero
│   │   └── student/         # Resource discovery, details, pass, fair allocation
│   ├── routes/              # Declarative React Router v6 route manifest
│   ├── services/            # Axios API client architecture with interceptors
│   ├── types/               # Comprehensive TypeScript domain interfaces
│   └── utils/               # Date formatters, score calculators, status mappers
```

### Core Technologies:
- **Framework:** React 18 with TypeScript 5 (Strict Mode)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS with custom institutional design system tokens
- **Routing:** React Router v6 with role-based routing (Student, Owner, Admin)
- **State & Data Fetching:** TanStack Query v5 + Axios service architecture
- **Optical Scanning:** `html5-qrcode`
- **Data Visualization:** Recharts
- **Icons:** Lucide React

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/codeverse-Hackerthon/trustpool_1.git
cd trustpool_1

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be live at `http://localhost:5173`.

### Production Build & Type Verification

```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 Roles & Workflows

| Role | Access Path | Key Capabilities |
| :--- | :--- | :--- |
| **Public / Visitor** | `/` | Explore value proposition, how it works, resource catalog preview |
| **Student** | `/student/*` | Search & filter resources, book via multi-step wizard, inspect Fair Access Score, scan QR pass, file before/after condition reports |
| **Resource Owner** | `/owner/*` | Manage resource inventory, review & approve requests, verify return integrity, award trust bonuses, report damage |
| **Campus Admin** | `/admin/*` | Oversee university inventory, adjudicate disputes, calibrate user trust scores, audit system logs, monitor utilization |

---

## 🛡️ License

Built for hackathon innovation. Distributed under the MIT License.
