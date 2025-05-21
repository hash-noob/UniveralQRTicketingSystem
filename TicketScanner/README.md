# Barcode Scanner for Event Passes

A web application for scanning and validating event passes using barcodes. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Real-time barcode scanning using device camera
- Validation of event passes
- Management of passes (create, view)
- Verification of pass status (valid, used, invalid)

## Project Structure

```
barcode-scanner/
├── client/            # React front-end
│   ├── public/        # Static files
│   └── src/           # React source code
│       ├── components/  # Reusable components
│       ├── pages/     # Page components
│       └── utils/     # Utility functions
└── server/            # Node.js back-end
    ├── controllers/   # Request handlers
    ├── models/        # Database models
    └── routes/        # API routes
```

## Prerequisites

- Node.js (v14+)
- MongoDB (local instance or MongoDB Atlas)
- Web camera for barcode scanning

## Getting Started

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/barcode-scanner
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the client:
   ```
   npm start
   ```

4. The application should open in your browser at `http://localhost:3000`

## Usage

1. **Home Page**: Overview of the application.
2. **Scan Pass**: Use your device's camera to scan a barcode on an event pass.
3. **Manage Passes**: Create new passes and view existing ones.
4. **Result Page**: Displays the validation result after scanning a pass.

## Technologies Used

- **Frontend**: React, React Router, HTML5-QRCode
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **HTTP Client**: Axios

## License

This project is licensed under the MIT License. 