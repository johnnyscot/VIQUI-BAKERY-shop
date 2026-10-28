// ═══ Datos del menú (Supabase) en tiempo real + carrito ═══
const CATEGORIES = [], PRODUCTS = [];

const Store = {
  sig: "", ok: false,

  async fetchAll() {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 7000);
    try {
      const get = q => fetch(`${SUPABASE.url}/rest/v1/${q}`, { headers: { apikey: SUPABASE.key }, cache: "no-store", signal: ctl.signal })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
      const [categories, products, rows] = await Promise.all([
        get("categories?select=id,title,icon&order=position,id"),
        get("products?select=id,category,name,description,price,badge,emoji,img,featured&available=eq.true&order=position,id"),
        get("settings?select=key,value")
      ]);
      return { categories, products, rows };
    } finally { clearTimeout(t); }
  },

  // true si hubo cambios desde la última carga
  async load() {
    try {
      const d = await this.fetchAll();
      this.ok = true;
      const sig = JSON.stringify(d);
      if (sig === this.sig) return false;
      this.sig = sig;
      PRODUCTS.splice(0, PRODUCTS.length, ...d.products.map(p => ({ ...p, desc: p.description || "" })));
      CATEGORIES.splice(0, CATEGORIES.length, ...d.categories);
      Object.assign(CONFIG, Object.fromEntries(d.rows.map(r => [r.key, r.value])));
      return true;
    } catch (e) { return false; }
  },

  // Aviso inmediato cuando la administradora cambia algo (Supabase Realtime)
  subscribe(onChange) {
    let timer, live = false;
    const ping = () => { clearTimeout(timer); timer = setTimeout(onChange, 300); };
    try {
      if (window.supabase) {
        const ch = window.supabase.createClient(SUPABASE.url, SUPABASE.key).channel("menu-en-vivo");
        ["products", "categories", "settings"].forEach(table => ch.on("postgres_changes", { event: "*", schema: "public", table }, ping));
        ch.subscribe(s => { live = s === "SUBSCRIBED"; if (live) ping(); });
      }
    } catch (e) { /* si falla, queda el respaldo */ }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) ping(); });
    window.addEventListener("online", ping);
    setInterval(() => { if (!document.hidden && !live) onChange(); }, 20000);
    setInterval(() => { if (!document.hidden) onChange(); }, 120000);
  }
};

const Cart = {
  key: "viqui2-cart", items: [],
  load() { try { this.items = JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { this.items = []; } this.prune(); },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.items)); } catch (e) {} },
  prune() { const n = this.items.length; this.items = this.items.filter(i => i.qty > 0 && PRODUCTS.some(p => p.id === i.id)); return n - this.items.length; },
  add(id, q = 1) { const it = this.items.find(i => i.id === id); it ? it.qty += q : this.items.push({ id, qty: q }); this.save(); },
  change(id, d) { const it = this.items.find(i => i.id === id); if (!it) return; it.qty += d; this.items = this.items.filter(i => i.qty > 0); this.save(); },
  clear() { this.items = []; this.save(); },
  get count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  get total() { return this.items.reduce((s, i) => s + (PRODUCTS.find(p => p.id === i.id)?.price || 0) * i.qty, 0); }
};
