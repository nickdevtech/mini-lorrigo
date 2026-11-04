import dotenv from "dotenv";
import express, { json } from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

// Connect to Database
connectDB();

app.get("/", (req, res) => {
  res.send("Mini Lorrigo API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
