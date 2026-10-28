const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => `${CONFIG.currency}${Number(n).toLocaleString("es-DO")}`;
const fold = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = id => PRODUCTS.find(p => p.id === id);
const state = { cat: "all", q: "", modalId: null, modalQty: 1 };

// Foto del producto; si no hay o no carga, se muestra el emoji
function pic(p, cls) {
  const fb = `<span class="ph" role="img" aria-label="${esc(p.name)}">${esc(p.emoji || "🍰")}</span>`;
  return p.img ? `<img class="${cls}" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" data-fb='${fb}' onerror="this.outerHTML=this.dataset.fb">` : fb;
}

/* ── Pintar la página ── */
const card = p => `
  <article class="card glass" tabindex="0" data-product="${p.id}" aria-label="${esc(p.name)}, ${money(p.price)}">
    <div class="thumb">${pic(p, "cover")}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}</div>
    <div class="card-body"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
      <div class="card-foot"><span class="price">${money(p.price)}</span>
        <button class="add" data-add="${p.id}" aria-label="Agregar ${esc(p.name)}">+</button></div></div>
  </article>`;

function renderChips() {
  $("#chips").innerHTML = [{ id: "all", title: "Todos" }, ...CATEGORIES].map(c =>
    `<button class="chip" data-cat="${esc(c.id)}" aria-pressed="${c.id === state.cat}">${c.id === "all" ? "" : esc(c.icon || "") + " "}${esc(c.title)}</button>`).join("");
}

function renderMenu() {
  const box = $("#productsContainer");
  if (!Store.ok) return (box.innerHTML = `<div class="empty glass"><p>No pudimos cargar el menú. Revisa tu conexión.</p><button class="btn btn-primary" data-retry>Intentar de nuevo</button></div>`);
  if (!PRODUCTS.length) return (box.innerHTML = `<div class="empty glass"><p>Estamos preparando el menú. ¡Vuelve en un momento! 🍰</p></div>`);
  const q = fold(state.q.trim());
  const html = CATEGORIES.filter(c => state.cat === "all" || c.id === state.cat).map(c => {
    const list = PRODUCTS.filter(p => p.category === c.id && (!q || fold(p.name + " " + p.desc).includes(q)));
    return list.length ? `<section class="group"><div class="group-head"><h2>${esc(c.icon || "")} ${esc(c.title)}</h2>
      <span>${list.length} ${list.length === 1 ? "opción" : "opciones"}</span></div><div class="grid">${list.map(card).join("")}</div></section>` : "";
  }).join("");
  box.innerHTML = html || `<div class="empty glass"><p>No encontramos “${esc(state.q)}” en el menú.</p><button class="btn btn-glass" data-clear>Ver todo el menú</button></div>`;
}

function renderHero() {
  const p = PRODUCTS.find(x => x.featured) || PRODUCTS[0], box = $("#heroFeature");
  box.hidden = !p;
  if (!p) return;
  box.innerHTML = `<div class="thumb">${pic(p, "cover")}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}</div>
    <div class="feat-body"><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p>
      <div class="feat-row"><span class="price">${money(p.price)}</span>
        <button class="btn btn-primary" data-add="${p.id}">Agregar al pedido</button></div></div>`;
}

function renderContact() {
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("¡Hola Viqui Bakery! Quisiera información.")}`;
  const hours = (CONFIG.hours || []).map(([d, h]) => `<li><span>${esc(d)}</span><strong>${esc(h)}</strong></li>`).join("");
  const links = [
    CONFIG.whatsapp && `<a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">Escribir por WhatsApp</a>`,
    CONFIG.instagram && `<a class="btn ig" href="${esc(CONFIG.instagram)}" target="_blank" rel="noopener">📸 Instagram ${esc(CONFIG.instagramHandle || "")}</a>`
  ].filter(Boolean).join("");
  $("#contactInfo").innerHTML = `
    <div class="panel glass"><h3>Horarios</h3>${hours ? `<ul>${hours}</ul>` : ""}
      ${CONFIG.notice ? `<p>${esc(CONFIG.notice)}</p>` : ""}${CONFIG.address ? `<p>📍 ${esc(CONFIG.address)}</p>` : ""}</div>
    <div class="panel glass"><h3>Hablemos</h3><p>Pedidos especiales, cumpleaños y eventos: escríbenos y lo armamos contigo.</p>${links}</div>`;
}

function renderCart() {
  $("#cartItems").innerHTML = Cart.items.length ? Cart.items.map(i => {
    const p = byId(i.id);
    return `<div class="cart-item"><div class="thumb">${pic(p, "cover")}</div>
      <div><h4>${esc(p.name)}</h4><small>${money(p.price * i.qty)}</small></div>
      <div class="qty"><button data-qty="${p.id}" data-d="-1" aria-label="Quitar uno">−</button><b>${i.qty}</b>
      <button data-qty="${p.id}" data-d="1" aria-label="Agregar uno">+</button></div></div>`;
  }).join("") : `<div class="cart-empty"><div>🧺</div><p>Tu carrito está vacío.<br>Agrega algo delicioso.</p></div>`;
  const n = Cart.count;
  $("#cartTotal").textContent = money(Cart.total);
  $("#checkoutBtn").disabled = !n;
  $("#clearCart").hidden = $("#orderForm").hidden = !n;
  $("#cartCount").textContent = $("#tabBadge").textContent = n;
  $("#cartCount").hidden = $("#tabBadge").hidden = $("#cartBar").hidden = !n;
  $("#cbCount").textContent = `${n} ${n === 1 ? "postre" : "postres"}`;
  $("#cbTotal").textContent = money(Cart.total);
}

const renderAll = () => { renderChips(); renderHero(); renderMenu(); renderContact(); renderCart(); };

/* ── Acciones ── */
function addToCart(id, qty = 1) {
  const p = byId(id); if (!p) return;
  Cart.add(id, qty); renderCart();
  if (navigator.vibrate) navigator.vibrate(12);
  toast(`${p.emoji || "🍰"} ${p.name} agregado`);
}

function openLayer(id) { closeLayers(true); $("#" + id).classList.add("open"); $("#overlay").classList.add("open"); document.body.classList.add("lock"); }
function closeLayers(keep) {
  $$(".sheet.open").forEach(s => s.classList.remove("open"));
  if (!keep) { $("#overlay").classList.remove("open"); document.body.classList.remove("lock"); }
}

function openProduct(id) {
  const p = byId(id); if (!p) return;
  state.modalId = id; state.modalQty = 1;
  $("#productBody").innerHTML = `<div class="pm">
    <div class="thumb">${pic(p, "cover")}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}</div>
    <div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
      <div class="pm-row"><span class="price">${money(p.price)}</span>
        <div class="qty"><button data-mq="-1" aria-label="Quitar uno">−</button><b id="mq">1</b><button data-mq="1" aria-label="Agregar uno">+</button></div></div>
      <button class="btn btn-primary" id="mAdd">Agregar · ${money(p.price)}</button></div></div>`;
  openLayer("productModal");
}

function checkout() {
  if (!Cart.items.length) return toast("Tu carrito está vacío");
  if (!CONFIG.whatsapp) return toast("El WhatsApp del negocio aún no está configurado");
  const f = $("#orderForm").elements, name = f.customer.value.trim(), delivery = f.mode.value === "delivery";
  if (!name) { f.customer.focus(); return toast("Escribe tu nombre para el pedido"); }
  if (delivery && !f.address.value.trim()) { f.address.focus(); return toast("Escribe la dirección de entrega"); }
  const lines = Cart.items.map(i => { const p = byId(i.id); return `• ${i.qty}x ${p.name} — ${money(p.price * i.qty)}`; }).join("\n");
  const when = f.date.value ? new Date(f.date.value + "T12:00").toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" }) : "";
  const msg = ["*Pedido · Viqui Bakery*", `Cliente: ${name}`,
    `Entrega: ${delivery ? "Delivery — " + f.address.value.trim() : "Recoger en tienda"}`,
    when ? `Fecha: ${when}` : null, "", lines, "", `*Total: ${money(Cart.total)}*`,
    f.note.value.trim() ? `\nNotas: ${f.note.value.trim()}` : null, "\n¡Hola! Me gustaría confirmar este pedido."
  ].filter(x => x !== null).join("\n");
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  Cart.clear(); renderCart(); openLayer("confirmModal");
}

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ── Tiempo real: si la administradora cambia algo, se actualiza solo ── */
async function refresh() {
  if (!(await Store.load()) && Store.ok && $("#productsContainer .loading") === null) return;
  if (state.cat !== "all" && !CATEGORIES.some(c => c.id === state.cat)) state.cat = "all";
  if (Cart.prune()) { Cart.save(); toast("Un postre de tu pedido ya no está disponible"); }
  if (state.modalId && !byId(state.modalId)) { state.modalId = null; if ($("#productModal").classList.contains("open")) closeLayers(); }
  renderAll();
}

/* ── Eventos ── */
document.addEventListener("click", e => {
  const t = e.target, add = t.closest("[data-add]"), open = t.closest("[data-open]"), cat = t.closest("[data-cat]"),
    qty = t.closest("[data-qty]"), mq = t.closest("[data-mq]"), prod = t.closest("[data-product]");
  if (add) return addToCart(+add.dataset.add);
  if (open) return openLayer(open.dataset.open);
  if (t.closest("[data-close]") || t === $("#overlay")) return closeLayers();
  if (t.closest("[data-retry]")) { Store.sig = ""; return refresh(); }
  if (cat) { state.cat = cat.dataset.cat; $$(".chip").forEach(c => c.setAttribute("aria-pressed", c === cat)); return renderMenu(); }
  if (t.closest("[data-clear]")) { state.q = ""; state.cat = "all"; $("#search").value = ""; return (renderChips(), renderMenu()); }
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
$("#orderForm").addEventListener("change", e => { if (e.target.name === "mode") $("#addressField").hidden = e.target.value !== "delivery"; });
$$(".sheet").forEach(s => { // deslizar hacia abajo para cerrar
  let y0 = null;
  s.addEventListener("touchstart", e => { if (e.target === s || e.target.closest(".sheet-head")) y0 = e.touches[0].clientY; }, { passive: true });
  s.addEventListener("touchend", e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 70) closeLayers(); y0 = null; });
});

/* ── Inicio ── */
(async function init() {
  $("#year").textContent = new Date().getFullYear();
  await Store.load();
  Cart.load();
  renderAll();
  const d = new Date(); d.setDate(d.getDate() + (CONFIG.minDaysAhead || 0));
  $("#orderForm").elements.date.min = d.toISOString().slice(0, 10);
  Store.subscribe(refresh);
})();
