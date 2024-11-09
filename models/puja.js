import mongoose, { Schema } from "mongoose";

// Define schema for Puja data structure
const PujaSchema = new Schema(
  {
    // Puja or pandal name
    name: { type: String, required: [true, "Puja name is required"] },

    // Type of puja, e.g., public or traditional
    type: { type: String },

    // Brief description of the puja
    description: { type: String },

    // Array of image URLs for the puja or pandal
    images: [{ type: String, default: [] }],

    // Thumbnail image URL for quick display
    thumbnail: { type: String, required: [true, "Thumbnail is required"] },

    // Location details for mapping the puja
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere", // Enable geospatial queries
        validate: {
          validator: function (arr) {
            return (
              arr.length === 2 &&
              arr[0] >= -180 &&
              arr[0] <= 180 &&
              arr[1] >= -90 &&
              arr[1] <= 90
            );
          },
          message: "Coordinates should be [longitude, latitude].",
        },
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },

    // Start date of the puja event
    startDate: { type: Date, required: [true, "Start date is required"] },

    // End date of the puja event
    endDate: { type: Date, required: [true, "End date is required"] },

    // Visiting hours for the puja
    visitTiming: {
      startTime: { type: String },
      endTime: { type: String },
    },

    // Average rating for the puja
    rating: { type: Number, default: 0 },

    // Array of review references
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],

    // Popularity score used internally for rankings
    popularityScore: { type: Number, default: 0 },

    // Theme description of the puja
    theme: { type: String, default: "N/A" },

    // Crowd density indicator
    crowdDensity: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "low",
    },

    // List of special events for the puja
    specialEvents: [{ type: String, default: [] }],

    // Array of user IDs representing puja members
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ID of the user who posted the puja
    postBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ID of the user who last updated the puja
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create a model for Puja schema
const Puja = mongoose.model("Puja", PujaSchema);

export default Puja;
