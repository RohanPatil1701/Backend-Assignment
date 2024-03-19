const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "newdatabase.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ticker_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT,
        date TEXT,
        revenue REAL,
        gp REAL,
        fcf REAL,
        capex REAL
      )
    `);

    const count = await db.get("SELECT COUNT(*) as count FROM ticker_table");
    if (count.count === 0) {
      await db.run(`
        INSERT INTO ticker_table (ticker, date, revenue, gp, fcf, capex)
        VALUES
          ('AAPL', '2023-01-01', 1000000, 500000, 300000, 200000),
          ('GOOG', '2023-01-02', 1200000, 600000, 400000, 250000),
          ('MSFT', '2023-01-03', 900000, 450000, 350000, 180000)
      `);
      console.log("Demo data inserted successfully.");
    }

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/ticker/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      ticker_table
    ;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
