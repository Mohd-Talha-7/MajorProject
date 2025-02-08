const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const Mongoose_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(Mongoose_URL)
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: '67249f144000bd36c5fcd01e'}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();