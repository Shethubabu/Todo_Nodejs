"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)("Todo", TodoSchema);
