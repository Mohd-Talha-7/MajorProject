const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    console.log("📌 Review Request Body:", req.body);
    
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let newReview = new Review({
        rating: parseInt(req.body.review.rating), // ✅ Ensure Number Type
        comments: req.body.review.comments,      // ✅ Ensure Comments Are Saved
        author: req.user._id
    });

    console.log("📝 New Review Object Before Save:", newReview);

    await newReview.save();  // ✅ Save Review in DB
    console.log("✅ Review Successfully Saved in DB");

    listing.reviews.push(newReview);
    await listing.save();  // ✅ Link Review to Listing
    
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};