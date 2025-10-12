import express from 'express'
import {connectToDatabase} from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from "multer";
import path from "path";
import rateLimit from "express-rate-limit";
import { profile } from 'console';

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

            const userId = result.insertId;

            // ✅ Create default priorities
            await db.query(
              `INSERT INTO priority (user_id, priority_name, priority_color, priority_level, is_default)
              VALUES 
                (?, 'Extreme', '#F21E1E', 5, 1),
                (?, 'Moderate', '#5BC0F8', 3, 1),
                (?, 'Low', '#7ED957', 1, 1)`,
              [userId, userId, userId]
            );

            // ✅ Create default statuses
            await db.query(
              `INSERT INTO status (user_id, status_name, status_color, is_default)
              VALUES 
              (?, 'Completed', '#05A301', 1),
              (?, 'In Progress', '#0225FF', 1),
              (?, 'Not Started', '#F21E1E', 1)`,
                [userId, userId, userId]
            );

            return res.status(201).json({ message: "User created successfully with defaults" });

            
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

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const [priorities] = await db.query('SELECT * FROM priority WHERE user_id = ?', [user.id]);
        if (priorities.length === 0) {
          await db.query(
            `INSERT INTO priority (user_id, priority_name, priority_color, priority_level, is_default)
            VALUES 
            (?, 'Extreme', '#F21E1E', 5, 1),
            (?, 'Moderate', '#5BC0F8', 3, 1),
            (?, 'Low', '#7ED957', 1, 1)`,
            [user.id, user.id, user.id]
          );
          console.log(`✅ Default priorities created for user ${user.username}`);
        }

        const [statuses] = await db.query('SELECT * FROM status WHERE user_id = ?', [user.id]);
        if (statuses.length === 0) {
          await db.query(
            `INSERT INTO status (user_id, status_name, status_color, is_default)
            VALUES 
            (?, 'Completed', '#05A301', 1),
            (?, 'In Progress', '#0225FF', 1),
            (?, 'Not Started', '#F21E1E', 1)`,
          [user.id, user.id, user.id]
          );
          console.log(`✅ Default statuses created for user ${user.username}`);
        }  

        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, { expiresIn: '3h' });

        return res.status(201).json({ token });
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).json({ message: "No token provided" });
    }
  
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(400).json({ message: "Invalid auth header format" });
    }
  
    const token = parts[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.userId = decoded.id;
      next();
    } catch (err) {
      console.error("verifyToken error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };

router.get("/priorities", verifyToken, async (req, res) => {
    try {
      const db = await connectToDatabase();
      const [rows] = await db.query("SELECT * FROM priority WHERE user_id = ?", [req.userId]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
router.get("/statuses", verifyToken, async (req, res) => {
    try {
      const db = await connectToDatabase();
      const [rows] = await db.query("SELECT * FROM status WHERE user_id = ?", [req.userId]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
// 📍 Add new task priority
router.post("/add-priority", verifyToken, async (req, res) => {
  const { priority_name, priority_color, priority_level } = req.body;

  if (!priority_name || !priority_color || priority_level === undefined) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const db = await connectToDatabase();

    // check if priority with the same name exists for this user
    const [existing] = await db.query(
      "SELECT * FROM priority WHERE user_id = ? AND priority_name = ?",
      [req.userId, priority_name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Priority name already exists." });
    }

    // insert new priority
    await db.query(
      `INSERT INTO priority (user_id, priority_name, priority_color, priority_level, is_default)
       VALUES (?, ?, ?, ?, 0)`,
      [req.userId, priority_name, priority_color, priority_level]
    );

    res.status(201).json({ message: "Priority added successfully." });
  } catch (err) {
    console.error("Add priority error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update a task priority
router.put("/priorities/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { priority_name, priority_color, priority_level } = req.body;

  if (!priority_name || !priority_color || !priority_level) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const db = await connectToDatabase();

    // check if priority with the same name exists for this user
    const [existing] = await db.query(
      "SELECT * FROM priority WHERE user_id = ? AND priority_name = ? AND id != ?",
      [req.userId, priority_name, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Priority name already exists." });
    }

    const [result] = await db.query(
      "UPDATE priority SET priority_name = ?, priority_color = ?, priority_level = ? WHERE id = ?",
      [priority_name, priority_color, priority_level, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Priority not found" });
    }

    res.json({ message: "Priority updated successfully" });
  } catch (err) {
    console.error("Error updating priority:", err);
    res.status(500).json({ error: "Server error while updating priority" });
  }
});

// DELETE priority
router.delete("/priorities/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query("DELETE FROM priority WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Priority not found" });
    }

    res.json({ message: "Priority deleted successfully" });
  } catch (error) {
    console.error("Error deleting priority:", error);
    res.status(500).json({ message: "Server error while deleting priority" });
  }
});

// 📍 Add new task priority
router.post("/add-statuses", verifyToken, async (req, res) => {
  const { status_name, status_color,} = req.body;

  if (!status_name || !status_color === undefined) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const db = await connectToDatabase();

    // check if status with the same name exists for this user
    const [existing] = await db.query(
      "SELECT * FROM status WHERE user_id = ? AND status_name = ?",
      [req.userId, status_name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Status name already exists." });
    }

    // insert new status
    await db.query(
      `INSERT INTO status (user_id, status_name, status_color, is_default)
       VALUES (?, ?, ?, 0)`,
      [req.userId, status_name, status_color]
    );

    res.status(201).json({ message: "Status added successfully." });
  } catch (err) {
    console.error("Add Status error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update a task priority
router.put("/statuses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status_name, status_color} = req.body;

  if (!status_name || !status_color) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const db = await connectToDatabase();

    // check if status with the same name exists for this user
    const [existing] = await db.query(
      "SELECT * FROM status WHERE user_id = ? AND status_name = ? AND id != ?",
      [req.userId, status_name, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Status name already exists." });
    }

    const [result] = await db.query(
      "UPDATE status SET status_name = ?, status_color = ? WHERE id = ?",
      [status_name, status_color, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Status not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Server error while updating status" });
  }
});

// DELETE priority
router.delete("/statuses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const [result] = await db.query("DELETE FROM status WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Status not found" });
    }

    res.json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ message: "Server error while deleting status" });
  }
});

// Get all categories for current user
router.get("/categories", verifyToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM categories WHERE user_id = ?", [req.userId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
});

// Create new category
router.post("/add-category", verifyToken, async (req, res) => {
  const { category_name } = req.body;

  if (!category_name || category_name.trim() === "") {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const db = await connectToDatabase();

    // Check for duplicate
    const [existing] = await db.query(
      "SELECT * FROM categories WHERE user_id = ? AND category_name = ?",
      [req.userId, category_name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // Insert new category
    await db.query(
      "INSERT INTO categories (user_id, category_name) VALUES (?, ?)",
      [req.userId, category_name]
    );

    res.status(201).json({ message: "Category added successfully" });
  } catch (err) {
    console.error("Add category error:", err);
    res.status(500).json({ message: "Server error while adding category" });
  }
});

router.delete("/categories/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();

    // First, ensure the category belongs to this user
    const [check] = await db.query(
      "SELECT id FROM categories WHERE id = ? AND user_id = ?",
      [id, req.userId]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: "Category not found or not authorized" });
    }

    // Delete all related values in category_value first
    await db.query("DELETE FROM category_values WHERE category_id = ?", [id]);

    // Then delete the category itself
    await db.query("DELETE FROM categories WHERE id = ? AND user_id = ?", [id, req.userId]);

    res.json({ message: "Category and related values deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

// GET /auth/category_values
router.get("/category_values", verifyToken, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const userId = req.userId; // from verifyToken middleware
    const [rows] = await db.query(`
      SELECT cv.*
      FROM category_values cv
      JOIN categories c ON cv.category_id = c.id
      WHERE c.user_id = ?
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch category values" });
  }
});

// Add a new category value
router.post("/add-category_values", verifyToken, async (req, res) => {
  const { category_id, value_name, value_color } = req.body;

  if (!category_id || !value_name || !value_color) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const db = await connectToDatabase();

    // ✅ Check if the same value_name already exists for this category
    const [existing] = await db.query(
      "SELECT * FROM category_values WHERE category_id = ? AND value_name = ?",
      [category_id, value_name.trim()]
    );

    if (existing.length > 0) {
      console.log("⚠️ Duplicate value detected:", value_name);
      return res.status(400).json({
        success: false,
        message: `The value "${value_name}" already exists in this category.`,
      });
    }

    // ✅ Insert new value if not duplicated
    const [result] = await db.query(
      "INSERT INTO category_values (category_id, value_name, value_color) VALUES (?, ?, ?)",
      [category_id, value_name.trim(), value_color]
    );

    console.log("✅ Value added successfully, ID:", result.insertId);

    return res.status(200).json({
      success: true,
      message: "Value added successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("🔥 DB Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add value",
      error: err.message,
    });
  }
});

// Update category value
router.put("/category_values/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { category_id, value_name, value_color } = req.body;

  try {
    const db = await connectToDatabase();
    // ✅ Check if the same value_name already exists for this category
    const [existing] = await db.query(
      "SELECT * FROM category_values WHERE category_id = ? AND value_name = ? AND id != ?",
      [category_id, value_name.trim(), id]
    );

    if (existing.length > 0) {
      console.log("⚠️ Duplicate value detected:", value_name);
      return res.status(400).json({
        success: false,
        message: `The value "${value_name}" already exists in this category.`,
      });
    }
    await db.query(
      "UPDATE category_values SET value_name = ?, value_color = ? WHERE id = ?",
      [value_name, value_color, id]
    );
    res.json({ message: "Value updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update value" });
  }
});

router.delete("/category_values/:id", verifyToken, async (req, res) => {
  const valueId = req.params.id;
  const userId = req.userId;

  try {
    const db = await connectToDatabase();
    // Verify that this value belongs to one of the user’s categories
    const [rows] = await db.query(
      `SELECT cv.id 
       FROM category_values cv
       JOIN categories c ON cv.category_id = c.id
       WHERE cv.id = ? AND c.user_id = ?`,
      [valueId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized or value not found" });
    }

    // Delete the category value
    await db.query("DELETE FROM category_values WHERE id = ?", [valueId]);

    res.status(200).json({ message: "Category value deleted successfully" });
  } catch (err) {
    console.error("Delete category value error:", err);
    res.status(500).json({ message: "Server error deleting category value" });
  }
});

router.get('/dashboard', verifyToken, async (req, res) => {
    try {
      const db = await connectToDatabase();
      const [rows] = await db.query(
        'SELECT username, email, firstname, lastname, contactnumber, position, profile_picture FROM users WHERE id = ?',
        [req.userId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // ✅ return only the needed fields
      return res.status(200).json({
        username: rows[0].username,
        email: rows[0].email,
        firstname: rows[0].firstname,
        lastname: rows[0].lastname,
        contactnumber: rows[0].contactnumber,
        position: rows[0].position,
        profile_picture: rows[0].profile_picture,
      });
      
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

router.put('/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }
  
    try {
      const db = await connectToDatabase();
  
      // 1. Get current user from DB
      const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.userId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const currentHashedPassword = rows[0].password;
  
      // 2. Compare old password
      const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }
  
      // 3. Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // 4. Update DB
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.userId]);
  
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error("Change password error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

router.put('/update', verifyToken, async (req, res) => {
    const updates = [];
    const values = [];
    const allowedFields = ["firstname", "lastname", "email", "contactnumber", "position"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
  
    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
  
    values.push(req.userId);
  
    try {
      const db = await connectToDatabase();
      const [result] = await db.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error("Update error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });


router.post('/logout', (req, res) => {
    // Nothing to do server-side with JWT unless you use a blacklist
    return res.status(200).json({ message: "Logged out successfully" })
  })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // folder must exist
    },
    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() + path.extname(file.originalname) // unique name
      );
    },
  });
  const upload = multer({ storage });

router.put(
    "/upload-profile-picture",
    verifyToken,
    upload.single("profile_picture"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
  
        const userId = req.userId; // from verifyToken
        const imagePath = `/uploads/${req.file.filename}`;
  
        // ✅ Open a connection just for this request
        const db = await connectToDatabase();
        await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
          imagePath,
          userId,
        ]);
  
        res.json({ message: "Profile picture updated", imagePath });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Failed to upload profile picture" });
      }
    }
  );
  

export default router;

