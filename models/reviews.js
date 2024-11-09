import mongoose, { Schema } from "mongoose";

// Define the Review schema
const reviewSchema = new Schema(
  {
    // Rating given by the reviewer (from 1 to 5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review text content
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },

    // Reference to the Puja being reviewed
    puja: {
      type: Schema.Types.ObjectId,
      ref: "Puja",
      required: true,
    },

    // Reference to the User who wrote the review
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Prevent duplicate reviews by the same user for the same puja
reviewSchema.index({ puja: 1, user: 1 }, { unique: true });

// Static method to calculate the average rating for a puja
reviewSchema.statics.calculateAverageRating = async function (pujaId) {
  const result = await this.aggregate([
    { $match: { puja: pujaId } },
    {
      $group: {
        _id: "$puja",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await mongoose.model("Puja").findByIdAndUpdate(pujaId, {
      rating: result[0]?.averageRating || 0,
      reviewsCount: result[0]?.totalReviews || 0,
    });
  } catch (error) {
    console.error("Error calculating average rating:", error);
  }
};

// Update average rating after saving a new review
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.puja);
});

// Update average rating after deleting a review
reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.puja);
});

// Create and export Review model
const Review = mongoose.model("Review", reviewSchema);

export default Review;
