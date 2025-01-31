// backend/models/User.js

const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required.'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required.'],
      min: -180,
      max: 180,
    },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, 'Street is required.'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required.'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal Code is required.'],
      trim: true,
    },
    coordinates: {
      type: coordinatesSchema,
      required: [true, 'Coordinates are required.'],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required.'],
      // Removed the `unique: true` constraint
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Validates a 10-digit number
        },
        message: props => `${props.value} is not a valid 10-digit phone number.`,
      },
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required.'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
