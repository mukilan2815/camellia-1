// backend/controllers/authController.js

const User = require('../models/User');
const { generateOTP } = require('../utils/otpGenerator');

// Register User
exports.register = async (req, res) => {
  const { name, phoneNumber, location } = req.body;

  console.log('Register Request Body:', req.body);

  try {
    // Validate presence of required fields
    if (!name || !phoneNumber || !location) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const { coordinates, street, city, state, country, postalCode } = location;

    if (
      !coordinates ||
      typeof coordinates.latitude !== 'number' ||
      typeof coordinates.longitude !== 'number' ||
      !street ||
      !city ||
      !country ||
      !postalCode
    ) {
      return res.status(400).json({ message: 'Missing required location fields.' });
    }

    // Validate coordinate ranges
    if (
      coordinates.latitude < -90 || coordinates.latitude > 90 ||
      coordinates.longitude < -180 || coordinates.longitude > 180
    ) {
      return res.status(400).json({ message: 'Invalid coordinates.' });
    }

    // Removed the duplicate phone number check here

    // Generate OTP
    const otp = generateOTP();

    // Create a new user
    const user = new User({
      name,
      phoneNumber,
      location: {
        street,
        city,
        state,
        country,
        postalCode,
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      },
      otp,
      isVerified: false,
    });

    await user.save();

    // Return the OTP in response (for testing) - remove this in production
    res.status(201).json({ message: 'User registered successfully.', otp });
  } catch (error) {
    console.error('Error in register:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join('. ') });
    }

    // If there's a duplicate key error for phoneNumber, you can still handle it
    // but since `unique: true` is removed, it should not occur unless there's another unique field
    // if (error.code === 11000 && error.keyValue.phoneNumber) {
    //   return res.status(409).json({ message: 'User with this phone number already exists.' });
    // }

    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    // Find the user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined; // Remove OTP after verification
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};
