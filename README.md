# HopeNest - Support Registry and Crowdfunding Platform

> "Every child deserves a home, every heart deserves a purpose"

HopeNest is a unified platform bridge connecting generous donors, volunteers, and adoptive families directly with verified orphanages.

---

## 🚀 Tech Stack

* **Frontend**: React (Vite) + Tailwind CSS + Leaflet.js (OpenStreetMap) + Socket.io Client
* **Backend**: Node.js + Express.js + Mongoose (MongoDB) + Socket.io Server + Nodemailer
* **Security**: JWT session tokens + bcrypt password hashing

---

## 📂 Folder Structure

```text
HopeNest/
├── client/                 # React frontend application
│   ├── public/             # Map assets & icons
│   └── src/
│       ├── assets/
│       ├── components/     # Reusable components (Navbar, Cards, counters)
│       ├── context/        # Context Stores (Auth, Toasts)
│       ├── hooks/          # Custom hooks (useAuth, useToast)
│       ├── pages/          # Full UI Views (Home, Orphanages, Donate, etc.)
│       └── utils/          # Axios API interceptors
├── server/                 # Node.js + Express backend
│   ├── middleware/         # JWT authorization checks
│   ├── models/             # Mongoose schemas (User, Child, Donation, etc.)
│   ├── routes/             # API routers
│   ├── utils/              # Nodemailer helpers
│   ├── uploads/            # Fallback upload folder
│   ├── seed.js             # Database seeding script
│   └── server.js           # Server bootstrap
├── .env                    # System configurations
└── README.md
```

---

## 🛠️ Installation & Execution

### Prerequisites
Make sure you have **Node.js** (v16+) and a running **MongoDB** database instance.

### 1. Environment Setup
Fill in the `.env` file at the root folder:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/hopenest
JWT_SECRET=hopenest_super_secret_session_key_2026
```

### 2. Seeding the Database
Populate the database with mock orphanages (Mumbai & Bengaluru), child profiles, and platform counters:
```bash
cd server
npm run seed
```

### 3. Running the Server (Backend)
Start the Express server on port 5000:
```bash
cd server
npm run dev
```

### 4. Running the Client (Frontend)
Start the Vite React development server on port 5173:
```bash
cd client
npm install
npm run dev
```

---

## 🔑 Seeded Test Credentials

To preview and interact with all user roles immediately, log in using:

| User Role | Email | Password | What you can test |
| :--- | :--- | :--- | :--- |
| **Public User** | `donor@hopenest.org` | `password123` | Make donations, book volunteer visits, sponsor children, track adoptions |
| **Orphanage Admin** | `admin@hopenest.org` | `password123` | Post urgent needs, add child profiles, review/approve volunteer visits & adoptions |
| **Super Admin** | `superadmin@hopenest.org` | `password123` | Approve orphanage registrations (via DB or API) |
