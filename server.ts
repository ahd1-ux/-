import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_DIR = path.join(process.cwd(), "database");

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// JSON Database helper paths
const DB_PATHS = {
  books: path.join(DB_DIR, "books.json"),
  articles: path.join(DB_DIR, "articles.json"),
  thoughts: path.join(DB_DIR, "thoughts.json"),
  reviews: path.join(DB_DIR, "reviews.json"),
  users: path.join(DB_DIR, "users.json"),
  welcomeAudio: path.join(DB_DIR, "welcome_audio.json"),
};

// Middleware - allows high payloads for uploading high-quality welcome screen audio files
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Helper to read database file safely
function readDB<T>(fileKey: keyof typeof DB_PATHS, defaultValue: T): T {
  try {
    const filePath = DB_PATHS[fileKey];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch (error) {
    console.error(`Error reading ${fileKey} database:`, error);
  }
  return defaultValue;
}

// Helper to write database file safely
function writeDB<T>(fileKey: keyof typeof DB_PATHS, data: T): boolean {
  try {
    const filePath = DB_PATHS[fileKey];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing ${fileKey} database:`, error);
    return false;
  }
}

// Health status report
app.get("/api/status", (req, res) => {
  const booksExist = fs.existsSync(DB_PATHS.books);
  const articlesExist = fs.existsSync(DB_PATHS.articles);
  
  res.json({
    initialized: booksExist && articlesExist,
    databaseDir: DB_DIR,
    database: "JSON Files (Local Persistent Storage)"
  });
});

// Bootstrap / Seed database from the client
app.post("/api/bootstrap", (req, res) => {
  try {
    const { books, articles, thoughts, reviews, users } = req.body;
    
    if (books && !fs.existsSync(DB_PATHS.books)) {
      writeDB("books", books);
    }
    if (articles && !fs.existsSync(DB_PATHS.articles)) {
      writeDB("articles", articles);
    }
    if (thoughts && !fs.existsSync(DB_PATHS.thoughts)) {
      writeDB("thoughts", thoughts);
    }
    if (reviews && !fs.existsSync(DB_PATHS.reviews)) {
      writeDB("reviews", reviews);
    }
    if (users && !fs.existsSync(DB_PATHS.users)) {
      writeDB("users", users);
    } else if (!fs.existsSync(DB_PATHS.users)) {
      writeDB("users", {});
    }

    res.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync data (active overwrite of lists)
app.post("/api/sync", (req, res) => {
  try {
    const { books, articles, thoughts, reviews, users } = req.body;
    
    if (books !== undefined) writeDB("books", books);
    if (articles !== undefined) writeDB("articles", articles);
    if (thoughts !== undefined) writeDB("thoughts", thoughts);
    if (reviews !== undefined) writeDB("reviews", reviews);
    if (users !== undefined) writeDB("users", users);
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Welcome Audio API ---
app.get("/api/welcome-audio", (req, res) => {
  try {
    if (fs.existsSync(DB_PATHS.welcomeAudio)) {
      const content = fs.readFileSync(DB_PATHS.welcomeAudio, "utf-8");
      res.setHeader("Content-Type", "application/json");
      return res.send(content);
    }
    res.json({ audio: null, filename: null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/welcome-audio", (req, res) => {
  try {
    const { audio, filename } = req.body;
    fs.writeFileSync(DB_PATHS.welcomeAudio, JSON.stringify({ audio, filename }), "utf-8");
    res.json({ success: true, filename });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/welcome-audio", (req, res) => {
  try {
    if (fs.existsSync(DB_PATHS.welcomeAudio)) {
      fs.unlinkSync(DB_PATHS.welcomeAudio);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Books API ---
app.get("/api/books", (req, res) => {
  const data = readDB("books", []);
  res.json(data);
});

app.post("/api/books", (req, res) => {
  const data = readDB("books", []);
  const newBook = req.body;
  
  const updated = [...data.filter((b: any) => b.id !== newBook.id), newBook];
  writeDB("books", updated);
  res.json({ success: true, book: newBook });
});

app.put("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  const data = readDB("books", []);
  const updatedBook = req.body;
  
  const updated = data.map((b: any) => b.id === bookId ? updatedBook : b);
  writeDB("books", updated);
  res.json({ success: true, book: updatedBook });
});

app.delete("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  const data = readDB("books", []);
  
  const updated = data.filter((b: any) => b.id !== bookId);
  writeDB("books", updated);
  res.json({ success: true });
});

// --- Articles API ---
app.get("/api/articles", (req, res) => {
  const data = readDB("articles", []);
  res.json(data);
});

app.post("/api/articles", (req, res) => {
  const data = readDB("articles", []);
  const newArticle = req.body;
  
  const updated = [...data.filter((a: any) => a.id !== newArticle.id), newArticle];
  writeDB("articles", updated);
  res.json({ success: true, article: newArticle });
});

app.put("/api/articles/:id", (req, res) => {
  const articleId = req.params.id;
  const data = readDB("articles", []);
  const updatedArticle = req.body;
  
  const updated = data.map((a: any) => a.id === articleId ? updatedArticle : a);
  writeDB("articles", updated);
  res.json({ success: true, article: updatedArticle });
});

app.delete("/api/articles/:id", (req, res) => {
  const articleId = req.params.id;
  const data = readDB("articles", []);
  
  const updated = data.filter((a: any) => a.id !== articleId);
  writeDB("articles", updated);
  res.json({ success: true });
});

// --- Thoughts API ---
app.get("/api/thoughts", (req, res) => {
  const data = readDB("thoughts", []);
  res.json(data);
});

app.post("/api/thoughts", (req, res) => {
  const data = readDB("thoughts", []);
  const newThought = req.body;
  
  const updated = [newThought, ...data.filter((t: any) => t.id !== newThought.id)];
  writeDB("thoughts", updated);
  res.json({ success: true, thought: newThought });
});

app.delete("/api/thoughts/:id", (req, res) => {
  const thoughtId = req.params.id;
  const data = readDB("thoughts", []);
  
  const updated = data.filter((t: any) => t.id !== thoughtId);
  writeDB("thoughts", updated);
  res.json({ success: true });
});

// --- Reviews API ---
app.get("/api/reviews", (req, res) => {
  const data = readDB("reviews", []);
  res.json(data);
});

app.post("/api/reviews", (req, res) => {
  const data = readDB("reviews", []);
  const newReview = req.body;
  
  const updated = [...data.filter((r: any) => r.id !== newReview.id), newReview];
  writeDB("reviews", updated);
  res.json({ success: true, review: newReview });
});

app.delete("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;
  const data = readDB("reviews", []);
  
  const updated = data.filter((r: any) => r.id !== reviewId);
  writeDB("reviews", updated);
  res.json({ success: true });
});

// --- Users / Registrations API ---
app.get("/api/users", (req, res) => {
  const data = readDB("users", {});
  res.json(data);
});

app.post("/api/users", (req, res) => {
  const newUsersMap = req.body;
  writeDB("users", newUsersMap);
  res.json({ success: true });
});

// Vite Dev Server / Static Ingress handling
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-Stack dynamic server running on http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
