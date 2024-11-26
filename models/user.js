import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define the User schema
const userSchema = new Schema(
  {
    // Unique username for identification
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Unique and validated email
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: "Please enter a valid email address",
      },
    },

    // Full name of the user for display purposes
    fullName: {
      type: String,
      trim: true,
      index: true,
    },

    // URL for the user's avatar
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dtf0q4wz2/image/upload/v1732600093/blank-profile.png",
    },

    // Flag for admin privileges
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Membership status in a specific Puja
    membershipDetails: {
      associatedWith: {
        type: Schema.Types.ObjectId,
        ref: "Puja",
        default: null,
      },
      isApproved: {
        type: Boolean,
        default: false,
      },
    },

    // History of watched pujas
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Puja",
      },
    ],

    // List of pujas user wants to watch
    watchList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Puja",
      },
    ],

    // Hashed password (excluded from queries)
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    // Token for session management (excluded from queries)
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with the stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate an access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Method to check if the user has admin privileges
userSchema.methods.isUserAdmin = function () {
  return this.isAdmin;
};

// Create and export User model
const User = mongoose.model("User", userSchema);

export default User;
