// ---------- Product catalog ----------
const PRODUCTS = [
  { id: "p1", name: "Nilgiri Frost", origin: "Nilgiri Hills, Tamil Nadu", type: "tea", price: 320, desc: "Bright, brisk high-altitude black tea with a clean finish.", color: "#2E5B45" },
  { id: "p2", name: "Assam Copper", origin: "Dibrugarh, Assam", type: "tea", price: 280, desc: "Malty and full-bodied, the tea that wakes a room up.", color: "#7A3B2E" },
  { id: "p3", name: "Green Needle", origin: "Darjeeling, West Bengal", type: "tea", price: 410, desc: "Delicate first-flush green, lightly grassy, no bitterness.", color: "#4E7A4A" },
  { id: "p4", name: "Smoked Oolong", origin: "Munnar, Kerala", type: "tea", price: 460, desc: "Pan-fired over wood embers for a gentle campfire note.", color: "#5A4632" },
  { id: "p5", name: "White Tip Silver", origin: "Darjeeling, West Bengal", type: "tea", price: 540, desc: "Barely processed silver buds, soft and honeyed.", color: "#8A8163" },
  { id: "p6", name: "Rose Cardamom", origin: "Blended, in-house", type: "tea", price: 350, desc: "Black tea base with whole cardamom pods and rose petal.", color: "#8C4A5C" },
  { id: "s1", name: "Malabar Peppercorn", origin: "Wayanad, Kerala", type: "spice", price: 220, desc: "Sun-dried single-estate black pepper, sharp and resinous.", color: "#2A2A28" },
  { id: "s2", name: "Alleppey Turmeric", origin: "Alappuzha, Kerala", type: "spice", price: 180, desc: "High-curcumin turmeric root, ground fresh each batch.", color: "#C97F1F" },
  { id: "s3", name: "Green Cardamom", origin: "Idukki, Kerala", type: "spice", price: 610, desc: "Whole pods, intensely aromatic — a little goes a long way.", color: "#3E6B42" },
  { id: "s4", name: "Ceylon Cinnamon Bark", origin: "Imported, Sri Lanka", type: "spice", price: 290, desc: "True cinnamon quills, sweet and mild, not the sharp cassia kind.", color: "#9C5B31" },
  { id: "s5", name: "Star Anise", origin: "Northeast hill farms", type: "spice", price: 240, desc: "Whole pods with a warm, liquorice-sweet aroma.", color: "#4A3222" },
  { id: "s6", name: "Kashmiri Saffron", origin: "Pampore, Kashmir", type: "spice", price: 950, desc: "Hand-picked stigmas, deep colour, minimal bitterness.", color: "#B0272A" }
];

// ---------- App state (in-memory only) ----------
let cart = {};       // { productId: quantity }
let activeFilter = "all";

// ---------- DOM refs ----------
const productGrid = document.getElementById("productGrid");
const filterRow = document.getElementById("filterRow");
const cartToggle = document.getElementById("cartToggle");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutOverlay = document.getElementById("checkoutOverlay");
const modalClose = document.getElementById("modalClose");
const orderForm = document.getElementById("orderForm");
const modalTotalEl = document.getElementById("modalTotal");
const checkoutFormWrap = document.getElementById("checkoutForm");
const checkoutSuccessWrap = document.getElementById("checkoutSuccess");
const orderIdEl = document.getElementById("orderId");
const orderEmailEl = document.getElementById("orderEmail");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");

function formatRupees(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// ---------- Render product grid ----------
function renderProducts() {
  const list = activeFilter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.type === activeFilter);
  productGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-swatch" style="background:${p.color}">${p.type === "tea" ? "Loose Leaf" : "Whole Spice"}</div>
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-origin">${p.origin}</p>
        <p class="product-desc">${p.desc}</p>
        <div class="product-foot">
          <span class="product-price">${formatRupees(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

filterRow.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if (!btn) return;
  activeFilter = btn.dataset.filter;
  [...filterRow.children].forEach(c => c.classList.toggle("active", c === btn));
  renderProducts();
});

productGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  btn.textContent = "Added";
  btn.classList.add("added");
  setTimeout(() => { btn.textContent = "Add"; btn.classList.remove("added"); }, 900);
});

// ---------- Cart rendering ----------
function cartEntries() {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: PRODUCTS.find(p => p.id === id), qty }));
}

function cartTotal() {
  return cartEntries().reduce((sum, { product, qty }) => sum + product.price * qty, 0);
}

function cartCount() {
  return cartEntries().reduce((sum, { qty }) => sum + qty, 0);
}

function renderCart() {
  const entries = cartEntries();
  cartCountEl.textContent = cartCount();
  cartTotalEl.textContent = formatRupees(cartTotal());
  modalTotalEl.textContent = formatRupees(cartTotal());

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your bag is empty. Add a tin to get started.</p>`;
    checkoutBtn.disabled = true;
    return;
  }
  checkoutBtn.disabled = false;

  cartItemsEl.innerHTML = entries.map(({ product, qty }) => `
    <div class="cart-item" data-id="${product.id}">
      <div class="cart-item-swatch" style="background:${product.color}"></div>
      <div class="cart-item-info">
        <p class="cart-item-name">${product.name}</p>
        <p class="cart-item-price">${formatRupees(product.price)} each</p>
        <div class="qty-controls">
          <button class="qty-btn" data-action="dec">&minus;</button>
          <span>${qty}</span>
          <button class="qty-btn" data-action="inc">+</button>
          <button class="remove-link" data-action="remove">Remove</button>
        </div>
      </div>
    </div>
  `).join("");
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.closest(".cart-item").dataset.id;
  if (btn.dataset.action === "inc") cart[id]++;
  if (btn.dataset.action === "dec") cart[id] = Math.max(0, cart[id] - 1);
  if (btn.dataset.action === "remove") cart[id] = 0;
  renderCart();
});

// ---------- Cart drawer open/close ----------
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("visible");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("visible");
}
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// ---------- Checkout modal ----------
function openCheckout() {
  if (cartCount() === 0) return;
  modalTotalEl.textContent = formatRupees(cartTotal());
  checkoutFormWrap.classList.remove("hidden");
  checkoutSuccessWrap.classList.add("hidden");
  checkoutOverlay.classList.add("visible");
}
function closeCheckout() {
  checkoutOverlay.classList.remove("visible");
}
checkoutBtn.addEventListener("click", () => { closeCart(); openCheckout(); });
modalClose.addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", (e) => { if (e.target === checkoutOverlay) closeCheckout(); });

orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(orderForm);
  const orderId = "PT" + Math.floor(100000 + Math.random() * 900000);
  orderIdEl.textContent = orderId;
  orderEmailEl.textContent = data.get("email");
  checkoutFormWrap.classList.add("hidden");
  checkoutSuccessWrap.classList.remove("hidden");
  cart = {};
  renderCart();
  orderForm.reset();
});

continueShoppingBtn.addEventListener("click", closeCheckout);

// ---------- Init ----------
renderProducts();
renderCart();
