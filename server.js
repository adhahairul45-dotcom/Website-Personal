const express = require("express");
const path = require("path");

const gamesRouter = require("./src/routes/games");
const ordersRouter = require("./src/routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/games", gamesRouter);
app.use("/api/orders", ordersRouter);

// Fallback 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`RulzStore running at http://localhost:${PORT}`);
});
