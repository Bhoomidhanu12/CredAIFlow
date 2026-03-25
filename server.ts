import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("credit_underwriting.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    cin TEXT,
    pan TEXT,
    sector TEXT,
    turnover REAL,
    loan_type TEXT,
    loan_amount REAL,
    tenure INTEGER,
    interest_rate REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER,
    filename TEXT,
    file_type TEXT,
    classification TEXT,
    extracted_data TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(entity_id) REFERENCES entities(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER,
    report_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(entity_id) REFERENCES entities(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS primary_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER,
    note TEXT,
    interpretation TEXT,
    risk_adjustment TEXT,
    FOREIGN KEY(entity_id) REFERENCES entities(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/entities", (req, res) => {
    const { company_name, cin, pan, sector, turnover, loan_type, loan_amount, tenure, interest_rate } = req.body;
    const stmt = db.prepare(`
      INSERT INTO entities (company_name, cin, pan, sector, turnover, loan_type, loan_amount, tenure, interest_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(company_name, cin, pan, sector, turnover, loan_type, loan_amount, tenure, interest_rate);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/entities/:id", (req, res) => {
    const entity = db.prepare("SELECT * FROM entities WHERE id = ?").get(req.params.id);
    res.json(entity);
  });

  app.post("/api/documents", (req, res) => {
    const { entity_id, filename, file_type, classification } = req.body;
    const stmt = db.prepare(`
      INSERT INTO documents (entity_id, filename, file_type, classification)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(entity_id, filename, file_type, classification);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/entities/:id/documents", (req, res) => {
    const docs = db.prepare("SELECT * FROM documents WHERE entity_id = ?").all(req.params.id);
    res.json(docs);
  });

  app.post("/api/entities/:id/insights", (req, res) => {
    const { note, interpretation, risk_adjustment } = req.body;
    const stmt = db.prepare(`
      INSERT INTO primary_insights (entity_id, note, interpretation, risk_adjustment)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(req.params.id, note, interpretation, risk_adjustment);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/entities/:id/insights", (req, res) => {
    const insights = db.prepare("SELECT * FROM primary_insights WHERE entity_id = ?").all(req.params.id);
    res.json(insights);
  });

  app.patch("/api/documents/:id", (req, res) => {
    const { classification, extracted_data, status } = req.body;
    const stmt = db.prepare(`
      UPDATE documents SET classification = ?, extracted_data = ?, status = ? WHERE id = ?
    `);
    stmt.run(classification, JSON.stringify(extracted_data), status, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/reports", (req, res) => {
    const { entity_id, report_data } = req.body;
    const stmt = db.prepare(`
      INSERT INTO reports (entity_id, report_data)
      VALUES (?, ?)
    `);
    const info = stmt.run(entity_id, JSON.stringify(report_data));
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
