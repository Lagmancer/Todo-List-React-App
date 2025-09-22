import express from 'express'
import {connectToDatabase} from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import rateLimit from "express-rate-limit";

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable old headers
});

const router = express.Router()

router.post('/register', async (req, res) => {
    const {username, email, password, firstname, lastname} = req.body;

    try {
        const db = await connectToDatabase()

        const [rows] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email])
        console.log("Existing users check:", rows);
        
        if(rows.length > 0) {
            return res.status(409).json({message : "user already existed"})
        }

        const hashPassword = await bcrypt.hash(password, 10)

        try {
            const [result] = await db.query(
              "INSERT INTO users (username, email, password, firstname, lastname) VALUES (?, ?, ?, ?, ?)",
              [username, email, hashPassword, firstname, lastname]
            );
          } catch (err) {
            console.error("Insert query failed:", err); // ✅ log the exact MySQL error
            return res.status(500).json({ message: err.message });
        }
        
        return res.status(201).json({message: "user created successfully"})
    } catch(err) {
        return res.status(500).json(err.message)
    }
})

// LOGIN route with limiter
router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const db = await connectToDatabase();

        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, { expiresIn: '3h' });

        return res.status(201).json({ token });
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).json({ message: "No Token Provided" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: "Invalid Token Format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.userId = decoded.id;
        next()
    }  catch(err) {
        return res.status(500).json({message: "server error"})
    }
}

router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId])
        if(rows.length === 0) {
            return res.status(404).json({message : "user not existed"})
        }

        return res.status(201).json({user: rows[0]})
    }catch(err) {
        return res.status(500).json({message: "server error"})
    }
})

export default router;