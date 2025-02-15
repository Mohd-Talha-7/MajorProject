const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true, // ✅ Ensures email is unique
    }
});

userSchema.plugin(passportLocalMongoose); // Handles username + password

const User = mongoose.model("User", userSchema);
module.exports = User;