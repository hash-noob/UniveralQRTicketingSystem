# TicketScanner

A modern web application for managing, scanning, and validating event passes using QR codes/barcodes. Built with the MERN stack (MongoDB, Express, React, Node.js), TicketScanner streamlines event entry, pass management, and attendee tracking for tech fests and similar events.

---

## 🌟 Features

- **Real-time QR/Barcode Scanning:** Scan event passes using your device camera.
- **Pass Validation:** Instantly check if a pass is valid, used, or invalid.
- **Pass Management:** Create, update, and delete passes with attendee details.
- **Event Tracking:** Track which events an attendee has visited.
- **Admin Dashboard:** Secure admin-only area for managing all passes.
- **Responsive UI:** Mobile-friendly, intuitive interface.
- **API Integration:** RESTful backend for all pass operations.

---

## 🗂️ Project Structure

```
TicketScanner/
│
├── client/           # React frontend
│   ├── public/       # Static assets (HTML, icons, manifest)
│   └── src/          # Source code
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level components (Home, Scanner, Manage, etc.)
│       ├── utils/        # API utilities and helpers
│       ├── App.js        # Main app component and routes
│       └── App.css       # Main stylesheet
│
├── server/           # Node.js/Express backend
│   ├── controllers/  # Request handlers (e.g., passController.js)
│   ├── models/       # Mongoose models (e.g., Pass.js)
│   ├── routes/       # API route definitions
│   ├── middleware/   # Auth and other middleware
│   └── index.js      # Server entry point
│
├── Scripts/          # Utility scripts (Python, etc.)
│   ├── Ticket.py     # Script for generating or processing tickets
│   ├── pass.pdf      # Example/generated pass PDF
│   └── .env.sample   # Sample environment variables for scripts
│
├── README.md         # Project documentation
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Python 3 (for scripts in `Scripts/`)
- Web camera (for scanning)

### 1. Backend Setup

```sh
cd TicketScanner/server
npm install
# Create a .env file (see .env.sample for variables)
npm run dev
```

### 2. Frontend Setup

```sh
cd TicketScanner/client
npm install
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Scripts

- Navigate to `Scripts/` for utility scripts like ticket generation.
- Example: `Ticket.py` can be used to generate or process event passes (see script comments for usage).

---

## 🖥️ Web App Overview

- **Home Page:** Event info, features, and links.
- **Scan Pass:** Scan QR/barcode to validate entry.
- **Manage Passes:** Admins can create, update, or delete passes.
- **Result Page:** Shows scan results (valid, already used, invalid, etc.).
- **Instructions:** Step-by-step guide for attendees.

---

## 🔒 Security

- Admin routes are protected and require authentication.
- Sensitive data is not exposed to the client.

---

## 🛠️ Technologies Used

- **Frontend:** React, React Router, HTML5-QRCode
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **HTTP Client:** Axios
- **Scripts:** Python (for ticket/pass utilities)

---

## 📂 Scripts Folder

- **Ticket.py:** Python script for generating or processing event tickets/passes.
- **pass.pdf:** Example or template pass in PDF format.
- **.env.sample:** Sample environment variables for scripts.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📬 Contact

For questions or support, please contact the Cybernauts team or open an issue on GitHub.
