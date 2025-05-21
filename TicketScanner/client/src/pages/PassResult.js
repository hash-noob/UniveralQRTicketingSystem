import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const PassResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const passData = location.state?.passData;

  useEffect(() => {
    if (!passData) {
      setError('No pass data available. Please scan a pass again.');
    }
  }, [passData]);

  const handleScanAgain = () => {
    navigate('/scanner');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (error) {
    return (
      <>
        <div className="pass-result-container">
          <div className="result-card error">
            <h2>Error</h2>
            <p>{error}</p>
            <div className="button-group">
              <button onClick={handleScanAgain} className="btn btn-primary">
                Scan Again
              </button>
              <button onClick={handleBackToHome} className="btn btn-secondary">
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="pass-result-container">
        <div className={`result-card ${passData?.isValid ? 'valid' : 'invalid'}`}>
          <h2>{passData?.isValid ? 'Valid Pass' : 'Invalid Pass'}</h2>
          
          {passData?.isValid ? (
            <>
              <div className="pass-details">
                <p><strong>Attendee:</strong> {passData.attendeeName}</p>
                <p><strong>Event:</strong> {passData.eventName}</p>
                <p><strong>Pass Type:</strong> {passData.passType}</p>
                {passData.isScanned && (
                  <p className="warning">
                    <strong>Note:</strong> This pass has already been scanned at{' '}
                    {new Date(passData.scanTime).toLocaleString()}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="error-message">
              <p>{passData?.message || 'This pass is not valid for this event.'}</p>
            </div>
          )}

          <div className="button-group">
            <button onClick={handleScanAgain} className="btn btn-primary">
              Scan Another Pass
            </button>
            <button onClick={handleBackToHome} className="btn btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PassResult; 