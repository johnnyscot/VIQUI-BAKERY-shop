// ═══ PRODUCTOS: agrega o edita aquí. `img` es la ruta de tu imagen; si falta o no carga, se muestra el emoji ═══
const CATEGORIES = [
  { id: "carlotta",   title: "Carlottas",   icon: "🍮" },
  { id: "tiramisu",   title: "Tiramisú",    icon: "☕" },
  { id: "cheesecake", title: "Cheesecakes", icon: "🍓" }
];

const PRODUCTS = [
  { id: 1,  category: "carlotta",   name: "Carlotta Clásica",       desc: "Bizcocho de vainilla, crema pastelera y frutas frescas", price: 450, badge: "Clásico", emoji: "🍮", img: "imagenes/limon.jpg" },
  { id: 2,  category: "carlotta",   name: "Carlotta de Fresas",     desc: "Esponjoso bizcocho con fresas naturales y chantilly",    price: 480, badge: "Popular", emoji: "🍓", img: "imagenes/fresa.png" },
  { id: 3,  category: "carlotta",   name: "Carlotta de Chinola",    desc: "Chinola natural sobre crema diplomática suave",          price: 470, badge: null,      emoji: "🍑", img: "imagenes/chinola.png" },
  { id: 4,  category: "carlotta",   name: "Carlotta de Chocolate",  desc: "Ganache oscuro, bizcocho húmedo y crocante de nuez",     price: 500, badge: "⭐ Chef", featured: true, emoji: "🍫", img: "imagenes/choco.png" },
  { id: 5,  category: "carlotta",   name: "Carlotta Tropical",      desc: "Mango, piña y crema de coco sobre bizcocho ligero",      price: 480, badge: "Nuevo",   emoji: "🥭", img: "imagenes/mango.png" },
  { id: 6,  category: "tiramisu",   name: "Tiramisú Clásico",       desc: "Savoiardi, mascarpone, espresso y cacao puro",           price: 420, badge: "Clásico", emoji: "☕", img: "imagenes/clasic.jpg" },
  { id: 7,  category: "tiramisu",   name: "Tiramisú con alcohol",   desc: "Mascarpone y café con un toque de licor entre capas de bizcocho", price: 450, badge: "Popular", emoji: "🥃", img: "imagenes/clasic.jpg" },
  { id: 11, category: "cheesecake", name: "Cheesecake de Fresas",   desc: "Base crocante, relleno cremoso y coulis de fresa",       price: 500, badge: "Popular", emoji: "🍓", img: "imagenes/ffesa.jpg" },
  { id: 12, category: "cheesecake", name: "Cheesecake de Oreo",     desc: "Base de galleta negra y crema de queso con trozos Oreo", price: 520, badge: "⭐ Chef", emoji: "🖤", img: "imagenes/cchoco.png" },
  { id: 13, category: "cheesecake", name: "Cheesecake de Mango",    desc: "Tropical y refrescante, con mango natural horneado",     price: 510, badge: "Nuevo",   emoji: "🥭", img: "imagenes/mmango.png" },
  { id: 14, category: "cheesecake", name: "Cheesecake de Limón",    desc: "Cremoso y cítrico con merengue italiano tostado",        price: 490, badge: null,      emoji: "🍋", img: "imagenes/llimon.png" }
];

const FEATURED_ID = 4; // producto destacado del inicio
