// backend/utils/otpGenerator.js
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  };
  