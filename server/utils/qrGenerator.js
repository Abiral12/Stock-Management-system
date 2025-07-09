const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQR = async (sku) => {
  try {
    const qrData =sku

    // Create directory if not exists
    const qrDir = path.join(__dirname, '../public/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate file path
    const filePath = path.join(qrDir, `${sku}.png`);
    
    // Generate and save QR code
    await QRCode.toFile(filePath, qrData, {
      color: {
        dark: '#000',
        light: '#fff'
      },
      width: 300
    });

    return `/qrcodes/${sku}.png`; // Return public path
  } catch (err) {
    throw new Error(`QR generation failed: ${err.message}`);
  }
};

module.exports = generateQR;