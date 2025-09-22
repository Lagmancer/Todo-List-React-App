import mysql from "mysql2/promise";

let connection;

export async function connectToDatabase() {
  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
    }

    console.log("✅ Connected to MySQL successfully!");

    // Test query using the connection
    const [rows] = await connection.query("SELECT 1 + 1 AS result");
    console.log("Test query result:", rows);

    return connection;
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    throw err;
  }
}