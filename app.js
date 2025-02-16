// 🌟 Load Environment Variables
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// 🌟 Import Required Modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require('multer');
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

// 🌟 Import Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 🌟 Express App
const app = express();

// 🌟 MongoDB Connection (Fix for MONGO_URI issue)
const MONGO_URI = process.env.MONGO_URI || process.env.ATLASDB_URL;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB:", mongoose.connection.name);
        console.log("✅ Using Database:", mongoose.connection.db.databaseName);
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

connectDB();

// 🌟 View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// 🌟 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// 🌟 Session Store Setup
const store = MongoStore.create({
    mongoUrl: MONGO_URI,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // 24 hours
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

// 🌟 Passport Authentication Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 🌟 Global Variables for Flash Messages & User
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// 🌟 Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 🌟 New Listing Route (Fixed Error Handling)
app.post("/listings", async (req, res) => {
    console.log("✅ Incoming Request Body:", JSON.stringify(req.body, null, 2));

    if (!req.body.Listing || !req.body.Listing.title) {
        console.log("❌ Title Missing in Request Body!");
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const newListing = new Listing(req.body.Listing);
        await newListing.save();
        console.log("✅ Listing Saved Successfully:", newListing);
        res.status(201).json(newListing);
    } catch (err) {
        console.error("❌ Error Saving Listing:", err);
        res.status(500).json({ error: err.message });
    }
});

// 🌟 404 Error Handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// 🌟 General Error Handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).send("File upload error!");
    }
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// 🌟 Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 App is listening on port ${PORT}`);
});