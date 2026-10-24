// Endpoint público de SOLO LECTURA: devuelve el menú desde la base de datos
import postgres from "postgres";

// "prepare: false" es necesario con el pooler de Supabase
const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, { prepare: false, max: 1, ssl: "require" });

export default async function handler(req, res) {
  try {
    const [categories, products, rows] = await Promise.all([
      sql`SELECT id, title, icon FROM categories ORDER BY position, id`,
      sql`SELECT id, category, name, description AS "desc", price, badge, emoji, img, featured
          FROM products WHERE available ORDER BY id`,
      sql`SELECT key, value FROM settings`
    ]);
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=60");
    res.json({ categories, products, settings });
  } catch (e) {
    res.status(500).json({ error: "menu_unavailable" });
  }
}
