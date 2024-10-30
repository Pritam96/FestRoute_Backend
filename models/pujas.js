import mongoose from "mongoose";

const PujaSchema = new mongoose.Schema({
  name: { type: String, required: true }, // The name of the puja or pandal.
  type: { type: String }, // Type of puja, e.g., Sarbojonin Puja (Public Pandal) / Sabekbarir Puja (Traditional Puja).
  description: { type: String }, // A short description providing historical or cultural significance.
  images: [{ type: String }], // Links to images of the pandal.
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
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
  startDate: { type: Date, required: true }, // Date when the puja starts.
  endDate: { type: Date, required: true }, // Date when the puja ends.
  visitTiming: { startTime: { type: String }, endTime: { type: String } }, // Specifies visiting hours.
  rating: { type: Number, default: 0 }, // Overall average rating from user reviews.
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // References to a separate Review schema.
  popularityScore: { type: Number, default: 0 }, // An internal metric or algorithm-based score.
  theme: { type: String }, // Describes the theme of the pandal if it has one.
  crowdDensity: { type: String, enum: ["low", "moderate", "high"] }, // Provides crowd density status.
  specialEvents: [{ type: String }], // Lists any special events.
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Puja = mongoose.model("Puja", PujaSchema);

export default Puja;
