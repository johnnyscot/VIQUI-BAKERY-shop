const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => `${CONFIG.currency}${n.toLocaleString("es-DO")}`;
const fold = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = id => PRODUCTS.find(p => p.id === id);
const state = { cat: "all", q: "", modalId: null, modalQty: 1 };

/* ── Imagen con respaldo al emoji si no carga ── */
function pic(p, cls) {
  const fb = `<span class="ph" role="img" aria-label="${esc(p.name)}">${p.emoji}</span>`;
  return p.img
    ? `<img class="${cls}" src="${p.img}" alt="${esc(p.name)}" loading="lazy" data-fb='${fb}' onerror="this.outerHTML=this.dataset.fb">`
    : fb;
}

function renderChips() {
  $("#chips").innerHTML = [{ id: "all", title: "Todos" }, ...CATEGORIES].map(c =>
    `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === state.cat}">${c.id === "all" ? "" : (c.icon || "") + " "}${esc(c.title)}</button>`).join("");
}

/* ── Menú ── */
const card = p => `
  <article class="card glass" tabindex="0" data-product="${p.id}" aria-label="${esc(p.name)}, ${money(p.price)}">
    <div class="thumb">${pic(p, "cover")}${p.badge ? `<span class="badge">${p.badge}</span>` : ""}</div>
    <div class="card-body"><h3>${p.name}</h3><p>${p.desc}</p>
      <div class="card-foot"><span class="price">${money(p.price)}</span>
        <button class="add" data-add="${p.id}" aria-label="Agregar ${esc(p.name)}">+</button></div>
    </div>
  </article>`;

function renderMenu() {
  const q = fold(state.q.trim());
  const html = CATEGORIES.filter(c => state.cat === "all" || c.id === state.cat).map(c => {
    const list = PRODUCTS.filter(p => p.category === c.id && (!q || fold(p.name + " " + p.desc).includes(q)));
    if (!list.length) return "";
    return `<section class="group"><div class="group-head"><h2>${c.icon} ${c.title}</h2>
      <span>${list.length} ${list.length === 1 ? "opción" : "opciones"}</span></div>
      <div class="grid">${list.map(card).join("")}</div></section>`;
  }).join("");
  $("#productsContainer").innerHTML = html ||
    PRODUCTS.length ? `<div class="empty glass"><p>No encontramos “${esc(state.q)}” en el menú.</p><button class="btn btn-glass" data-clear>Ver todo el menú</button></div>`
      : `<div class="empty glass"><p>Estamos preparando el menú. ¡Vuelve en un momento! 🍰</p></div>`;
}

function renderHero() {
  const p = PRODUCTS.find(x => x.featured) || PRODUCTS[0];
  const box = $("#heroFeature");
  box.hidden = !p;
  if (!p) return;
  box.innerHTML = `
    <div class="thumb">${pic(p, "cover")}${p.badge ? `<span class="badge">${p.badge}</span>` : ""}</div>
    <div class="feat-body"><h2>${p.name}</h2><p>${p.desc}</p>
      <div class="feat-row"><span class="price">${money(p.price)}</span>
        <button class="btn btn-primary" data-add="${p.id}">Agregar al pedido</button></div></div>`;
}

function renderContact() {
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("¡Hola Viqui Bakery! Quisiera información.")}`;
  const hours = CONFIG.hours.map(([d, h]) => `<li><span>${d}</span><strong>${h}</strong></li>`).join("");
  const links = [
    `<a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">Escribir por WhatsApp</a>`,
    CONFIG.instagram && `<a class="btn ig" href="${CONFIG.instagram}" target="_blank" rel="noopener">📸 Instagram ${CONFIG.instagramHandle || ""}</a>`,
    CONFIG.x && `<a class="btn x-btn" href="${CONFIG.x}" target="_blank" rel="noopener">𝕏 Síguenos en X</a>`
  ].filter(Boolean).join("");
  $("#contactInfo").innerHTML = `
    <div class="panel glass"><h3>Horarios</h3><ul>${hours}</ul>
      ${CONFIG.notice ? `<p>${CONFIG.notice}</p>` : ""}${CONFIG.address ? `<p>📍 ${CONFIG.address}</p>` : ""}</div>
    <div class="panel glass"><h3>Hablemos</h3><p>Pedidos especiales, cumpleaños y eventos: escríbenos y lo armamos contigo.</p>${links}</div>`;
}

/* ── Carrito ── */
function renderCart() {
  const box = $("#cartItems");
  box.innerHTML = Cart.items.length ? Cart.items.map(i => {
    const p = byId(i.id);
    return `<div class="cart-item"><div class="thumb">${pic(p, "cover")}</div>
      <div><h4>${p.name}</h4><small>${money(p.price * i.qty)}</small></div>
      <div class="qty"><button data-qty="${p.id}" data-d="-1" aria-label="Quitar uno">−</button><b>${i.qty}</b>
      <button data-qty="${p.id}" data-d="1" aria-label="Agregar uno">+</button></div></div>`;
  }).join("") : `<div class="cart-empty"><div>🧺</div><p>Tu carrito está vacío.<br>Agrega algo delicioso.</p></div>`;
  $("#cartTotal").textContent = money(Cart.total);
  $("#checkoutBtn").disabled = !Cart.items.length;
  $("#clearCart").hidden = !Cart.items.length;
  $("#orderForm").hidden = !Cart.items.length;
  const c = $("#cartCount");
  const n = Cart.count;
  c.textContent = n; c.hidden = !n;
  $("#tabBadge").textContent = n; $("#tabBadge").hidden = !n;
  $("#cartBar").hidden = !n;
  $("#cbCount").textContent = `${n} ${n === 1 ? "postre" : "postres"}`;
  $("#cbTotal").textContent = money(Cart.total);
  c.classList.add("bump");
  setTimeout(() => c.classList.remove("bump"), 300);
}

function addToCart(id, qty = 1) {
  Cart.add(id, qty);
  renderCart();
  if (navigator.vibrate) navigator.vibrate(12);
  toast(`${byId(id).emoji} ${byId(id).name} agregado`);
}

/* ── Capas (carrito, detalle, confirmación) ── */
function openLayer(id) {
  closeLayers(true);
  $("#" + id).classList.add("open");
  $("#overlay").classList.add("open");
  document.body.classList.add("lock");
}
function closeLayers(keepOverlay) {
  $$(".sheet.open").forEach(s => s.classList.remove("open"));
  if (!keepOverlay) { $("#overlay").classList.remove("open"); document.body.classList.remove("lock"); }
}

function openProduct(id) {
  state.modalId = id; state.modalQty = 1;
  const p = byId(id);
  $("#productBody").innerHTML = `<div class="pm">
    <div class="thumb">${pic(p, "cover")}${p.badge ? `<span class="badge">${p.badge}</span>` : ""}</div>
    <div><h3>${p.name}</h3><p>${p.desc}</p>
      <div class="pm-row"><span class="price">${money(p.price)}</span>
        <div class="qty"><button data-mq="-1" aria-label="Quitar uno">−</button><b id="mq">1</b><button data-mq="1" aria-label="Agregar uno">+</button></div></div>
      <button class="btn btn-primary" id="mAdd" style="width:100%">Agregar · ${money(p.price)}</button></div></div>`;
  openLayer("productModal");
}

/* ── Pedido por WhatsApp ── */
function checkout() {
  if (!Cart.items.length) return toast("Tu carrito está vacío");
  const f = $("#orderForm").elements;
  const name = f.customer.value.trim();
  const delivery = f.mode.value === "delivery";
  if (!name) { f.customer.focus(); return toast("Escribe tu nombre para el pedido"); }
  if (delivery && !f.address.value.trim()) { f.address.focus(); return toast("Escribe la dirección de entrega"); }

  const lines = Cart.items.map(i => { const p = byId(i.id); return `• ${i.qty}x ${p.name} — ${money(p.price * i.qty)}`; }).join("\n");
  const when = f.date.value
    ? new Date(f.date.value + "T12:00").toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" }) : "";
  const msg = [
    "*Pedido · Viqui Bakery*", `Cliente: ${name}`,
    `Entrega: ${delivery ? "Delivery — " + f.address.value.trim() : "Recoger en tienda"}`,
    when && `Fecha: ${when}`, "", lines, "", `*Total: ${money(Cart.total)}*`,
    f.note.value.trim() && `\nNotas: ${f.note.value.trim()}`, "\n¡Hola! Me gustaría confirmar este pedido."
  ].filter(x => x !== "" || true).filter(x => x !== false && x !== "").join("\n");

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  Cart.clear(); renderCart(); openLayer("confirmModal");
}

/* ── Aviso ── */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ── Eventos ── */
document.addEventListener("click", e => {
  const t = e.target;
  const add = t.closest("[data-add]"), open = t.closest("[data-open]"), cat = t.closest("[data-cat]"),
        qty = t.closest("[data-qty]"), mq = t.closest("[data-mq]"), prod = t.closest("[data-product]");
  if (add) return addToCart(+add.dataset.add);
  if (open) return openLayer(open.dataset.open);
  if (t.closest("[data-close]") || t === $("#overlay")) return closeLayers();
  if (cat) {
    state.cat = cat.dataset.cat;
    $$(".chip").forEach(c => c.setAttribute("aria-pressed", c === cat));
    return renderMenu();
  }
  if (t.closest("[data-clear]")) { state.q = ""; state.cat = "all"; $("#search").value = ""; $$(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.cat === "all")); return renderMenu(); }
  if (qty) { Cart.change(+qty.dataset.qty, +qty.dataset.d); return renderCart(); }
  if (mq) { state.modalQty = Math.max(1, state.modalQty + +mq.dataset.mq); $("#mq").textContent = state.modalQty; $("#mAdd").textContent = `Agregar · ${money(byId(state.modalId).price * state.modalQty)}`; return; }
  if (t.closest("#mAdd")) { addToCart(state.modalId, state.modalQty); return closeLayers(); }
  if (t.closest("#checkoutBtn")) return checkout();
  if (t.closest("#clearCart")) { Cart.clear(); return renderCart(); }
  if (prod) return openProduct(+prod.dataset.product);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLayers();
  if (e.key === "Enter" && e.target.matches("[data-product]")) openProduct(+e.target.dataset.product);
});
$("#search").addEventListener("input", e => { state.q = e.target.value; renderMenu(); });
$("#orderForm").addEventListener("change", e => {
  if (e.target.name === "mode") $("#addressField").hidden = e.target.value !== "delivery";
});

/* Deslizar hacia abajo para cerrar */
$$(".sheet").forEach(s => {
  let y0 = null;
  s.addEventListener("touchstart", e => { if (e.target === s || e.target.closest(".sheet-head")) y0 = e.touches[0].clientY; }, { passive: true });
  s.addEventListener("touchend", e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 70) closeLayers(); y0 = null; });
});

/* ── Tiempo real: refresca todo sin recargar la página ── */
async function refresh() {
  if (!(await Remote.load())) return;
  if (state.cat !== "all" && !CATEGORIES.some(c => c.id === state.cat)) state.cat = "all";
  const antes = Cart.items.length;
  Cart.items = Cart.items.filter(i => byId(i.id));
  Cart.save();
  if (Cart.items.length < antes) toast("Un postre de tu pedido ya no está disponible");
  if (state.modalId && !byId(state.modalId)) { state.modalId = null; if ($("#productModal").classList.contains("open")) closeLayers(); }
  renderChips(); renderHero(); renderMenu(); renderContact(); renderCart();
}

/* ── Inicio ── */
async function init() {
  await Remote.load();
  Cart.load();
  renderChips();
  renderHero(); renderMenu(); renderContact(); renderCart();
  $("#year").textContent = new Date().getFullYear();
  const d = new Date(); d.setDate(d.getDate() + CONFIG.minDaysAhead);
  $("#orderForm").elements.date.min = d.toISOString().slice(0, 10);
  Remote.subscribe(refresh);
}
init();
