// ═══ Conexión con Supabase ═══
// La clave "publishable" es pública por diseño: solo permite LEER el menú (lo controlan las reglas de la base de datos).
const SUPABASE = {
  url: "https://ozhusvriewgmmtoyppaw.supabase.co",
  key: "sb_publishable_HaH0tlSW0qg9GwW5WG4iZQ_NKDB0eYn"
};

// Valores por defecto; los datos reales (WhatsApp, horarios...) se editan desde el panel de administración.
const CONFIG = { whatsapp: "", currency: "RD$", minDaysAhead: 1, instagram: "", instagramHandle: "", address: "", hours: [], notice: "" };
