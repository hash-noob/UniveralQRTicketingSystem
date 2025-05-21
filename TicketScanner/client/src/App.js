import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ManagePasses from './pages/ManagePasses';
import PassResult from './pages/PassResult';
import ViewPass from './pages/ViewPass';
import Login from './pages/Login';
import ViewPassInstructions from './pages/ViewPassInstructions';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Import AuthContext provider
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/view-instructions" element={<ViewPassInstructions />} />
              <Route path="/result" element={<PassResult />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pass/:id" element={<ViewPass />} />
              
              {/* Protected routes - Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/manage" element={<ManagePasses />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
