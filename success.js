const params = new URLSearchParams(location.search);
const orderId = params.get("orderId");

const statusIcon = document.getElementById("statusIcon");
const statusTitle = document.getElementById("statusTitle");
const statusSub = document.getElementById("statusSub");
const receipt = document.getElementById("receipt");

function money(n) {
  return `RM${n.toFixed(2)}`;
}

function renderReceipt(order) {
  receipt.innerHTML = `
    <div class="row"><span>Order ID</span><span>${order.id}</span></div>
    <div class="row"><span>Game</span><span>${order.gameName}</span></div>
    <div class="row"><span>Item</span><span>${order.productLabel}</span></div>
    <div class="row"><span>Amount paid</span><span>${money(order.price)}</span></div>
    <div class="row"><span>Payment method</span><span>${order.paymentMethod}</span></div>
  `;
}

function setSuccessState() {
  statusIcon.className = "status-icon success";
  statusIcon.textContent = "✓";
  statusTitle.textContent = "Top-up successful!";
  statusSub.textContent = "Your item has been delivered to your account.";
}

async function poll() {
  try {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) throw new Error("Order not found");
    const order = await res.json();

    renderReceipt(order);

    if (order.status === "success") {
      setSuccessState();
      return;
    }

    setTimeout(poll, 1200);
  } catch (err) {
    statusTitle.textContent = "We couldn't find that order.";
    statusSub.textContent = "It may have expired or the link is incorrect.";
    statusIcon.className = "status-icon";
    statusIcon.textContent = "!";
  }
}

if (!orderId) {
  statusTitle.textContent = "No order found.";
  statusSub.textContent = "Head back home to start a new top-up.";
  statusIcon.className = "status-icon";
  statusIcon.textContent = "!";
} else {
  poll();
}
