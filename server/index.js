import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import { connectToDatabase } from "./lib/db.js"; 

(async () => {
  try {
    const db = await connectToDatabase();
    console.log("✅ MySQL connected in server.js!");

    const [rows] = await db.query("SHOW TABLES");
    console.log("📦 Tables in DB:", rows);
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.get('/', (req, res) => {
  res.send("🚀 Server and DB are running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is Running on http://localhost:${PORT}`);
});