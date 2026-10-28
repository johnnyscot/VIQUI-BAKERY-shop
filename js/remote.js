// Menú desde Supabase, actualizado en tiempo real.
// Si no hay conexión, se queda con el menú local de js/products.js.
const Remote = {
  sig: "",

  async fetchMenu() {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    try {
      const get = q => fetch(`${SUPABASE.url}/rest/v1/${q}`, { headers: { apikey: SUPABASE.key }, cache: "no-store", signal: ctl.signal })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
      const [categories, products, rows] = await Promise.all([
        get("categories?select=id,title,icon&order=position,id"),
        get("products?select=id,category,name,description,price,badge,emoji,img,featured&available=eq.true&order=id"),
        get("settings?select=key,value")
      ]);
      return { categories, products, rows };
    } finally { clearTimeout(t); }
  },

  // Devuelve true solo si algo cambió desde la última vez
  async load() {
    try {
      const d = await this.fetchMenu();
      const sig = JSON.stringify(d);
      if (sig === this.sig) return false;
      this.sig = sig;
      PRODUCTS.splice(0, PRODUCTS.length, ...d.products.map(p => ({ ...p, desc: p.description || "", badge: p.badge || null, img: p.img || null })));
      CATEGORIES.splice(0, CATEGORIES.length, ...d.categories);
      Object.assign(CONFIG, Object.fromEntries(d.rows.map(r => [r.key, r.value])));
      return true;
    } catch (e) { return false; }
  },

  // Avisa en cuanto la administradora cambia algo (WebSocket de Supabase Realtime)
  subscribe(onChange) {
    let timer, live = false;
    const ping = () => { clearTimeout(timer); timer = setTimeout(onChange, 300); };
    try {
      if (window.supabase) {
        const sb = window.supabase.createClient(SUPABASE.url, SUPABASE.key);
        const ch = sb.channel("menu-en-vivo");
        ["products", "categories", "settings"].forEach(table => ch.on("postgres_changes", { event: "*", schema: "public", table }, ping));
        ch.subscribe(status => { live = status === "SUBSCRIBED"; if (live) ping(); });
      }
    } catch (e) { /* si falla, funciona el respaldo de abajo */ }
    // Respaldo: al volver a la pantalla, al recuperar internet y cada 20 s si no hay conexión en vivo
    document.addEventListener("visibilitychange", () => { if (!document.hidden) ping(); });
    window.addEventListener("online", ping);
    setInterval(() => { if (!document.hidden && !live) onChange(); }, 20000);
    setInterval(() => { if (!document.hidden) onChange(); }, 120000);
  }
};
