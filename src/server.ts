import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import Todo from "./models/todo.model";

dotenv.config();

const PORT = process.env.PORT || 5000;


const parseBody = (req: http.IncomingMessage): Promise<any> =>
  new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });

const server = http.createServer(async (req, res) => {
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
    if (url==="/"){
      res.writeHead(200);
      return res.end("You can check running of this API at /api/todos");
    }
   
    if (url === "/api/todos" && method === "POST") {
      const body = await parseBody(req);

      if (!body.title) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Title is required" }));
        return;
      }

      const todo = await Todo.create({
        title: body.title,
        completed: body.completed ?? false
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(todo));
      return;
    }

   
    if (url === "/api/todos" && method === "GET") {
      const todos = await Todo.find();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(todos));
      return;
    }

    
    const idMatch = url.match(/^\/api\/todos\/([a-fA-F0-9]{24})$/);

    if (idMatch) {
      const id = idMatch[1];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid ID" }));
        return;
      }

      
      if (method === "GET") {
        const todo = await Todo.findById(id);

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

        const todo = await Todo.findByIdAndUpdate(id, body, {
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
        const todo = await Todo.findByIdAndDelete(id);

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

  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Server error" }));
  }
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});