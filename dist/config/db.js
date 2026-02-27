"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not defined");
        }
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(" MongoDB Connected");
    }
    catch (error) {
        console.error(" DB Connection Error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
