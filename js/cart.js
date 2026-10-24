// ═══ CARRITO: solo guarda id y cantidad (los precios siempre salen de PRODUCTS) ═══
const Cart = {
  key: "viqui-cart",
  items: [],
  load() {
    try { this.items = JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { this.items = []; }
    this.items = this.items.filter(i => PRODUCTS.some(p => p.id === i.id) && i.qty > 0);
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch (e) {} },
  add(id, qty = 1) {
    const it = this.items.find(i => i.id === id);
    it ? it.qty += qty : this.items.push({ id, qty });
    this.save();
  },
  change(id, delta) {
    const it = this.items.find(i => i.id === id);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) this.items = this.items.filter(i => i.id !== id);
    this.save();
  },
  clear() { this.items = []; this.save(); },
  get count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  get total() { return this.items.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0); }
};
