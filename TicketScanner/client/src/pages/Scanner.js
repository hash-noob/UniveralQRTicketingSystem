import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { scanPass } from '../utils/api';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize the scanner
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });
    
    const success = async (result) => {
      // Stop the scanner when a barcode is detected
      scanner.clear();
      
      // Set the scan result
      setScanResult(result);
      
      try {
        setLoading(true);
        // Make API call to verify the barcode
        const response = await scanPass(result);
        
        // Handle successful scan
        if (response.success) {
          navigate(`/result/success?data=${encodeURIComponent(JSON.stringify(response.data))}`);
        } else {
          navigate(`/result/error?message=${encodeURIComponent(response.message)}`);
        }
      } catch (error) {
        console.error('Error scanning pass:', error);
        // Handle error based on status code
        if (error.response) {
          if (error.response.status === 404) {
            navigate(`/result/invalid?message=Invalid pass code`);
          } else if (error.response.status === 400) {
            if (error.response.data.scanTime) {
              navigate(`/result/scanned?time=${encodeURIComponent(error.response.data.scanTime)}`);
            } else {
              navigate(`/result/error?message=${encodeURIComponent(error.response.data.message)}`);
            }
          } else {
            navigate(`/result/error?message=Server error`);
          }
        } else {
          navigate(`/result/error?message=Network error`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    const error = (err) => {
      console.error(err);
      setCameraError(true);
      setError('Failed to start the camera. Please allow camera permissions.');
    };
    
    // Render the scanner
    scanner.render(success, error);
    
    // Cleanup on component unmount
    return () => {
      scanner.clear();
    };
  }, [navigate]);
  
  return (
    <div className="scanner-container">
      <h2>Scan Pass</h2>
      <p>Position the barcode within the box to scan.</p>
      
      {loading && <div className="loading">Processing scan...</div>}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          {cameraError && (
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Retry Camera
            </button>
          )}
        </div>
      )}
      
      <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      
      {scanResult && (
        <div className="scan-result">
          <p>Code scanned: {scanResult}</p>
        </div>
      )}
    </div>
  );
};

export default Scanner; 