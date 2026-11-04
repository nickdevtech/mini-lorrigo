import dotenv from "dotenv";
import express, { json } from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
dotenv.config();
import shipmentRoutes from './routes/shipmentRoutes.js';

const app = express();
app.use(cors());
app.use(json());

// Connect to Database
connectDB();

// routes
app.use('/api', shipmentRoutes);

app.get("/", (req, res) => {
  res.send("Mini Lorrigo API is running");
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
export default app;