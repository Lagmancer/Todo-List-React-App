import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import authRouter from "./routes/authRoutes.js";
import { connectToDatabase } from "./lib/db.js";

// =============================
// 📌 Database connection test
// =============================
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

// =============================
// 📌 Initialize Express
// =============================
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow PUT
    allowedHeaders: ["Content-Type", "Authorization"], // allow auth headers
  })
);
app.use(express.json());

// =============================
// 📌 Multer Setup (File Uploads)
// =============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // all files will go to /uploads folder
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname) // unique filename: 123456789.jpg
    );
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));


// 🔹 Authentication routes
app.use("/auth", authRouter);

// 🔹 Image upload route
app.post("/upload", upload.single("profile_picture"), (req, res) => {
  try {
    // multer saves the file, now return the file path
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ success: true, filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "File upload failed" });
  }
});

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("🚀 Server, DB, and File Upload are running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is Running on http://localhost:${PORT}`);
});