import React, { useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import axios from 'axios';

const QRScanner = ({ onScan }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const videoElement = document.getElementById('qr-video');
    const scanner = new QrScanner(
      videoElement,
      async (result) => {
        try {
          const response = await axios.post('https://warehouse-app-backend-kbt5.onrender.com/api/scan', {
            qrCode: result.data,
          });
          onScan(response.data);
        } catch (err) {
          setError('Invalid QR code or server error');
        }
      },
      { highlightScanRegion: true }
    );

    scanner.start();
    return () => scanner.stop();
  }, [onScan]);

  return (
    <div>
      <video id="qr-video" style={{ width: '100%' }}></video>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default QRScanner;
