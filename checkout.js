const receiptBody = document.getElementById("receiptBody");
const payBtn = document.getElementById("payBtn");

let draft = null;
let game = null;
let product = null;

function money(n) {
  return `RM${n.toFixed(2)}`;
}

function renderReceipt() {
  const idLines = Object.entries(draft.playerInfo)
    .map(([key, value]) => {
      const field = game.idFields.find((f) => f.key === key);
      return `<div class="row"><span>${field ? field.label : key}</span><span>${value}</span></div>`;
    })
    .join("");

  receiptBody.innerHTML = `
    <div class="row"><span>Game</span><span>${game.name}</span></div>
    <div class="row"><span>Item</span><span>${product.label}</span></div>
    ${idLines}
    <div class="row"><span>Payment</span><span>${draft.paymentMethod}</span></div>
    <div class="row"><span>Total</span><span>${money(product.price)}</span></div>
  `;
}

async function init() {
  const raw = sessionStorage.getItem("rulzstore_order_draft");
  if (!raw) {
    receiptBody.innerHTML = `No order in progress. <a href="/">Start over</a>.`;
    payBtn.disabled = true;
    return;
  }

  draft = JSON.parse(raw);

  const res = await fetch(`/api/games/${draft.gameId}`);
  game = await res.json();
  product = game.products.find((p) => p.id === draft.productId);

  renderReceipt();
}

payBtn.addEventListener("click", async () => {
  payBtn.disabled = true;
  payBtn.textContent = "Processing…";

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    if (!res.ok) throw new Error("Order failed");
    const order = await res.json();

    sessionStorage.removeItem("rulzstore_order_draft");
    location.href = `/success.html?orderId=${order.id}`;
  } catch (err) {
    payBtn.disabled = false;
    payBtn.textContent = "Confirm & pay";
    alert("Something went wrong placing your order. Please try again.");
  }
});

init();
