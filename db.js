// db.js
// A tiny file-based data layer. It reads/writes JSON files under /data.
// Swap this module out for a real database (Postgres, MySQL, MongoDB, etc.)
// later without touching the routes -- they only call the functions below.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const GAMES_FILE = path.join(DATA_DIR, "games.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- Games ----------

function getAllGames() {
  return readJson(GAMES_FILE);
}

function getGameById(id) {
  const games = getAllGames();
  return games.find((g) => g.id === id) || null;
}

function getProductById(gameId, productId) {
  const game = getGameById(gameId);
  if (!game) return null;
  return game.products.find((p) => p.id === productId) || null;
}

// ---------- Orders ----------

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RZ-${timestamp}-${random}`;
}

function createOrder({ gameId, productId, playerInfo, paymentMethod }) {
  const game = getGameById(gameId);
  if (!game) throw new Error("Game not found");

  const product = getProductById(gameId, productId);
  if (!product) throw new Error("Product not found");

  const orders = readJson(ORDERS_FILE);

  const order = {
    id: generateOrderId(),
    gameId,
    gameName: game.name,
    productId,
    productLabel: product.label,
    price: product.price,
    playerInfo,
    paymentMethod,
    status: "processing", // processing -> success (mock, flips after a short delay)
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  writeJson(ORDERS_FILE, orders);
  return order;
}

function getOrderById(orderId) {
  const orders = readJson(ORDERS_FILE);
  return orders.find((o) => o.id === orderId) || null;
}

function markOrderSuccess(orderId) {
  const orders = readJson(ORDERS_FILE);
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = "success";
  writeJson(ORDERS_FILE, orders);
  return order;
}

module.exports = {
  getAllGames,
  getGameById,
  getProductById,
  createOrder,
  getOrderById,
  markOrderSuccess,
};
