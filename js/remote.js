// Carga el menú desde Supabase. Si falla (o aún no hay datos), se usa el de js/products.js
const Remote = {
  async load() {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 5000);
      const get = q => fetch(`${SUPABASE.url}/rest/v1/${q}`, { headers: { apikey: SUPABASE.key }, signal: ctl.signal })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
      const [categories, products, rows] = await Promise.all([
        get("categories?select=id,title,icon&order=position,id"),
        get("products?select=id,category,name,description,price,badge,emoji,img,featured&available=eq.true&order=id"),
        get("settings?select=key,value")
      ]);
      clearTimeout(t);
      if (!products.length) return;
      PRODUCTS.splice(0, PRODUCTS.length, ...products.map(p => ({ ...p, desc: p.description || "", badge: p.badge || null, img: p.img || null })));
      CATEGORIES.splice(0, CATEGORIES.length, ...categories);
      Object.assign(CONFIG, Object.fromEntries(rows.map(r => [r.key, r.value])));
    } catch (e) { /* se queda con los datos locales */ }
  }
};
