"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const todo_model_1 = __importDefault(require("./models/todo.model"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const parseBody = (req) => new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", () => {
        try {
            resolve(body ? JSON.parse(body) : {});
        }
        catch (err) {
            reject(err);
        }
    });
});
const server = http_1.default.createServer(async (req, res) => {
    const url = req.url || "";
    const method = req.method || "";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    try {
        if (url === "/api/todos" && method === "POST") {
            const body = await parseBody(req);
            if (!body.title) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Title is required" }));
                return;
            }
            const todo = await todo_model_1.default.create({
                title: body.title,
                completed: body.completed ?? false
            });
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(todo));
            return;
        }
        if (url === "/api/todos" && method === "GET") {
            const todos = await todo_model_1.default.find();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(todos));
            return;
        }
        const idMatch = url.match(/^\/api\/todos\/([a-fA-F0-9]{24})$/);
        if (idMatch) {
            const id = idMatch[1];
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Invalid ID" }));
                return;
            }
            if (method === "GET") {
                const todo = await todo_model_1.default.findById(id);
                if (!todo) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Not found" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(todo));
                return;
            }
            if (method === "PUT") {
                const body = await parseBody(req);
                const todo = await todo_model_1.default.findByIdAndUpdate(id, body, {
                    new: true
                });
                if (!todo) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Not found" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(todo));
                return;
            }
            if (method === "DELETE") {
                const todo = await todo_model_1.default.findByIdAndDelete(id);
                if (!todo) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Not found" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Todo deleted" }));
                return;
            }
        }
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server error" }));
    }
});
(0, db_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(` Server running on port ${PORT}`);
    });
});
