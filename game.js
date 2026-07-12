const params = new URLSearchParams(location.search);
const gameId = params.get("id");

const gameHeader = document.getElementById("gameHeader");
const crumbName = document.getElementById("crumbName");
const currencyHelp = document.getElementById("currencyHelp");
const productGrid = document.getElementById("productGrid");
const idHelp = document.getElementById("idHelp");
const idFieldsEl = document.getElementById("idFields");
const payMethods = document.getElementById("payMethods");
const checkoutBtn = document.getElementById("checkoutBtn");

const sumGame = document.getElementById("sumGame");
const sumItem = document.getElementById("sumItem");
const sumPayment = document.getElementById("sumPayment");
const sumTotal = document.getElementById("sumTotal");

let game = null;
let selectedProduct = null;
let selectedPayment = null;

function money(n) {
  return `RM${n.toFixed(2)}`;
}

function initials(name) {
  return name
    .split(" ")
    .filter((w) => w.length && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || name.slice(0, 2).toUpperCase();
}

function renderHeader() {
  document.documentElement.style.setProperty("--accent", game.accent);
  crumbName.textContent = game.name;
  gameHeader.style.setProperty("--accent", game.accent);
  gameHeader.innerHTML = `
    <div class="icon">${initials(game.name)}</div>
    <div>
      <h1>${game.name}</h1>
      <div class="meta">${game.publisher} · ${game.category}</div>
    </div>
  `;
  currencyHelp.textContent = `Select how many ${game.currencyLabel} you'd like to top up.`;
  idHelp.textContent = game.helpText;
  sumGame.textContent = game.name;
}

function renderProducts() {
  productGrid.innerHTML = game.products
    .map(
      (p) => `
    <div class="product-card" data-id="${p.id}" tabindex="0">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <div class="amount">${p.label}</div>
      <div class="price">${money(p.price)}</div>
    </div>
  `
    )
    .join("");
}

function renderIdFields() {
  idFieldsEl.innerHTML = game.idFields
    .map(
      (f) => `
    <div class="field">
      <label for="field-${f.key}">${f.label}</label>
      <input id="field-${f.key}" data-key="${f.key}" type="text" placeholder="${f.placeholder}" />
    </div>
  `
    )
    .join("");
}

function updateSummary() {
  if (selectedProduct) {
    sumItem.textContent = selectedProduct.label;
    sumTotal.textContent = money(selectedProduct.price);
  }
  sumPayment.textContent = selectedPayment || "Not selected";
  checkoutBtn.disabled = !(selectedProduct && selectedPayment);
  checkoutBtn.textContent =
    selectedProduct && selectedPayment
      ? `Pay ${money(selectedProduct.price)} now`
      : !selectedProduct
      ? "Select an amount to continue"
      : "Select a payment method";
}

productGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;
  productGrid.querySelectorAll(".product-card").forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedProduct = game.products.find((p) => p.id === card.dataset.id);
  updateSummary();
});

payMethods.addEventListener("click", (e) => {
  const method = e.target.closest(".pay-method");
  if (!method) return;
  payMethods.querySelectorAll(".pay-method").forEach((m) => m.classList.remove("selected"));
  method.classList.add("selected");
  selectedPayment = method.dataset.method;
  updateSummary();
});

checkoutBtn.addEventListener("click", () => {
  const playerInfo = {};
  let missing = false;
  idFieldsEl.querySelectorAll("input").forEach((input) => {
    playerInfo[input.dataset.key] = input.value.trim();
    if (!input.value.trim()) missing = true;
  });

  if (missing) {
    alert("Please fill in all account detail fields before continuing.");
    return;
  }

  const orderDraft = {
    gameId: game.id,
    productId: selectedProduct.id,
    playerInfo,
    paymentMethod: selectedPayment,
  };

  sessionStorage.setItem("rulzstore_order_draft", JSON.stringify(orderDraft));
  location.href = "/checkout.html";
});

async function init() {
  if (!gameId) {
    gameHeader.innerHTML = `<p>No game selected. <a href="/">Go back home</a>.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/games/${gameId}`);
    if (!res.ok) throw new Error("Game not found");
    game = await res.json();
    renderHeader();
    renderProducts();
    renderIdFields();
    updateSummary();
  } catch (err) {
    gameHeader.innerHTML = `<p>Couldn't load this game. <a href="/">Go back home</a>.</p>`;
  }
}

init();
