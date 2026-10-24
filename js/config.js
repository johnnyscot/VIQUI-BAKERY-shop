// ═══ CONFIGURACIÓN: edita aquí los datos del negocio ═══
const CONFIG = {
  whatsapp: "18097041495",              // número con código de país, sin + ni espacios
  currency: "RD$",
  minDaysAhead: 1,                      // días mínimos de anticipación para la fecha del pedido
  instagram: "https://instagram.com/me_ly_17",
  instagramHandle: "@me_ly_17",
  x: "",                                // pon tu enlace de X/Twitter; si queda vacío no se muestra
  address: "",                          // ej: "Calle Duarte #12, Santiago"; si queda vacío no se muestra
  hours: [                              // EDITA con tus horarios reales
    ["Lunes a viernes", "9:00 a. m. – 6:00 p. m."],
    ["Sábado", "9:00 a. m. – 4:00 p. m."],
    ["Domingo", "Cerrado"]
  ],
  notice: "Recomendamos pedir con 24 horas de anticipación."
};

// ═══ SUPABASE (solo lectura) ═══
// La clave "publishable" es pública por diseño: es seguro dejarla en el repo.
// Solo puede leer lo que las políticas de supabase.sql permiten (menú y datos del negocio).
const SUPABASE = {
  url: "https://ozhusvriewgmmtoyppaw.supabase.co",
  key: "sb_publishable_HaH0tlSW0qg9GwW5WG4iZQ_NKDB0eYn"
};
