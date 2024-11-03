"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const uri = process.env.DB_URI;
if (!uri) {
    console.error("DB_URI is not set");
    process.exit(1);
}
(0, mongoose_1.connect)(uri).then(() => {
    console.log("Connected to database");
}).catch((e) => {
    console.error(e);
    process.exit(1);
});
