const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comments: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {  
        type: Date,  
        default: Date.now,  // ✅ Fix: Automatically set current date/time
    },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
