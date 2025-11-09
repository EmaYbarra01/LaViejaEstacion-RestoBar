import React, { useState } from "react";
import ProductCard from "../crud/products/ProductCard";
import { Navbar, Nav, Dropdown, Container, Accordion } from "react-bootstrap";
import { FaPhoneAlt, FaShoppingCart } from "react-icons/fa";

const navLinks = [
  { name: "inicio", href: "#" },
  { name: "Menú", href: "#menú" },
  { name: "Nosotros", href: "#nosotros" },
  { name: "Contacto", href: "#contacto" },
];

const menuItems = [
  {
    id: 1,
    name: "Hamburguesa Clásica",
    price: 9000,
    description: "Carne de res, queso cheddar, lechuga, tomate y mayonesa.",
    preparation: "Preparada con ingredientes frescos y pan artesanal.",
    image: "/assets/burger.jpg",
  },
    {
    id: 2,
    name: "Hamburguesa Oklahoma",
    price: 9000,
    description: "Carne de res, queso cheddar, cebolla caramelizada y salsa BBQ.",
    preparation: "Preparada con ingredientes frescos y pan de papas.",
    image: "/assets/burger.jpg",
  },
    {
    id: 3,
    name: "Hamburguesa De la Casa",
    price: 9000,
    description: "Doble Carne de res, queso cheddar, cebolla crispy, lechuga, tomate y salsa especial.",
    preparation: "Preparada con ingredientes frescos y pan de papas artesanal.",
    image: "/assets/burger.jpg",
  },
    {
    id: 4,
    name: "Sándwich de Milanesa",
    price: 7000,
    description: "Milanesa de carne, lechuga, tomate y adheresos.",
    preparation: "Pan de masa fresca.",
    image: "/assets/vegano.jpg",
  },
  {
    id: 5,
    name: "Lomito Completo",
    price: 2000,
    description: "Lomo, jamón, queso, huevo y vegetales.",
    preparation: "En pan artesanal.",
    image: "/assets/lomo.jpg",
  },
    {
    id: 6,
    name: "Pio Pio Sandwich",
    price: 2000,
    description: "Pollo crispy, lechuga, tomate, queso y mayonesa casera.",
    preparation: "En pan artesanal.",
    image: "/assets/lomo.jpg",
  },
    {
    id: 7,
    name: "Milanesa Napolitana",
    price: 9500,
    description: "Carne empanada, salsa de tomate, jamón y queso.",
    preparation: "Acompañada de papas fritas.",
    image: "/assets/milanesa.jpg",
  },
    {
    id: 8,
    name: "Milanesa a caballo",
    price: 9500,
    description: "Carne empanada, huevo frito, jamón y queso.",
    preparation: "Acompañada de papas fritas.",
    image: "/assets/milanesa.jpg",
  },  {
    id: 9,
    name: "Milanesa Suprema",
    price: 9500,
    description: "Carne de pollo empanada, jamón, queso, panceta y huevo frito.",
    preparation: "Acompañada de papas fritas.",
    image: "/assets/milanesa.jpg",
  },
  {
    id: 10,
    name: "Pizza Margarita",
    price: 8500,
    description: "Salsa de tomate, mozzarella fresca y albahaca.",
    preparation: "Horneada en horno de piedra para un sabor auténtico.",
    image: "/assets/pizza.jpg",
  },
    {
    id: 10,
    name: "Pizza fugazzeta",
    price: 8500,
    description: "Salsa de tomate, mozzarella fresca y albahaca.",
    preparation: "Horneada en horno de piedra para un sabor auténtico.",
    image: "/assets/pizza.jpg",
  },
    {
    id: 11,
    name: "Pizza Napolitana",
    price: 8500,
    description: "Salsa de tomate, mozzarella fresca, jamón y huevo.",
    preparation: "Horneada en horno de piedra para un sabor auténtico.",
    image: "/assets/pizza.jpg",
  },
  {
    id: 12,
    name: "Ensalada César",
    price: 5000,
    description: "Lechuga romana, crutones, queso parmesano y aderezo César.",
    preparation: "Aderezo casero con un toque de anchoas.",
    image: "/assets/salad.jpg",
  },
  {
    id: 13,
    name: "Empanadas Tucumanas",
    price: 300,
    description: "Carne cortada a cuchillo, cebolla y huevo.",
    preparation: "Cocidas al horno de barro.",
    image: "/assets/empanada.jpg",
  },

  {
    id: 14,
    name: "Tarta de Verduras",
    price: 4900,
    description: "Masa casera, espinaca y ricota.",
    preparation: "Acompañada de ensalada.",
    image: "/assets/tarta.jpg",
  },
  {
    id: 15,
    name: "Pollo al Curry",
    price: 8500,
    description: "Pollo, salsa curry y arroz basmati.",
    preparation: "Receta especial de la casa.",
    image: "/assets/pollo.jpg",
  },
  {
    id: 16,
    name: "Ravioles de Ricota",
    price: 6000,
    description: "Pasta casera rellena de ricota y nuez.",
    preparation: "Con salsa fileto.",
    image: "/assets/ravioles.jpg",
  },
];

const bebidas = [
  { id: 1, name: "Cerveza Artesanal", price: 5000 },
  { id: 2, name: "Vino Malbec", price: 9000 },
  { id: 3, name: "Agua Mineral", price: 2500 },
  { id: 4, name: "Gaseosa Cola", price: 3500 },
  { id: 5, name: "Jugo Natural", price: 4000 },
  { id: 6, name: "Fernet con Coca", price: 7000 },
  { id: 7, name: "Gin Tonic", price: 8000 },
  { id: 8, name: "Café Expreso", price: 3000 },
  { id: 9, name: "Té de Hierbas", price: 2500 },
  { id: 10, name: "Limonada", price: 3500 },
];

const postres = [
  { id: 1, name: "Flan Casero", price: 5000 },
  { id: 2, name: "Helado Artesanal", price: 6000 },
  { id: 3, name: "Tarta de Manzana", price: 5500 },
  { id: 4, name: "Brownie con Helado", price: 7000 },
  { id: 5, name: "Cheesecake", price: 6500 },
  { id: 6, name: "Panqueque de Dulce de Leche", price: 5000 },
  { id: 7, name: "Fruta Fresca", price: 4000 },
  { id: 8, name: "Budín de Pan", price: 4500 },
  { id: 9, name: "Tiramisú", price: 7000 },
  { id: 10, name: "Copa Oreo", price: 6000 },
];

function HeaderMenu() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-lg py-3 border-bottom border-secondary">
      <Container>
        <Navbar.Brand href="#" className="fw-bold text-warning mx-auto" style={{fontSize:'2rem', letterSpacing:'2px'}}>
          La Vieja Estación Resto-Bar
        </Navbar.Brand>
        <Nav className="mx-auto gap-3">
          {navLinks.map((link, idx) => (
            <Nav.Link key={idx} href={link.href} className="text-light px-3 fw-semibold" style={{fontSize:'1.1rem'}}>{link.name}</Nav.Link>
          ))}
        </Nav>
      </Container>
    </Navbar>
  );
}

function CartaDigitalAccordion() {
  return (
    <div className="container my-4">
      <h4 className="fw-bold text-warning mb-3 text-center">Nuestro Menú de Bebidas y Postres</h4>
      <Accordion defaultActiveKey="0" flush>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Bebidas</Accordion.Header>
          <Accordion.Body>
            <div className="row">
              {bebidas.map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4 mb-2 text-start">
                  <span className="fw-bold">{item.name}</span>{" "}
                  <span className="text-info">${item.price}</span>
                </div>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Postres</Accordion.Header>
          <Accordion.Body>
            <div className="row">
              {postres.map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4 mb-2 text-start">
                  <span className="fw-bold">{item.name}</span>{" "}
                  <span className="text-success">${item.price}</span>
                </div>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

const HomePage = () => {
  const [menuType, setMenuType] = useState("menu");

  const heroBg = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-dark text-light min-vh-100">
      {/* Top bar contacto y horario */}
      <div className="w-100 bg-black text-light py-2 d-flex justify-content-between align-items-center px-4" style={{fontSize:'0.95rem', letterSpacing:'1px'}}>
        <div><FaPhoneAlt className="me-2" /> +54 381 642-9612 &nbsp; | &nbsp; 20:00 pm - 23:55 pm</div>
        <div><FaShoppingCart className="me-2" /> $0.00 &nbsp; | &nbsp; 0 items - View Cart</div>
      </div>
      {/* Header principal */}
      <HeaderMenu />
      {/* Hero principal */}
      <div className="w-100 position-relative" style={{height:'420px', background:`url(${heroBg}) center/cover no-repeat`}}>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.45)'}}></div>
        <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3" style={{zIndex:2}}>
          <h2 className="display-5 fw-bold text-warning mb-2" style={{letterSpacing:'2px'}}>BIENVENIDOS</h2>
          <h1 className="display-3 fw-bold text-light mb-3" style={{letterSpacing:'3px'}}>LA VIEJA ESTACION RESTO-BAR</h1>
          <p className="lead text-light mb-4" style={{fontSize:'1.2rem'}}>el sabor de nuestros platos caseros, ricos y abundantes.</p>
        </div>
      </div>

      {/* Menu Section */}
      <section className="container py-5" id="menu">
        <h2 className="text-center mb-5 display-5 fw-bold">Conocé Nuestro Menú</h2>
        <div className="row g-4">
          {menuItems.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <ProductCard product={item} hideOrderBtn />
            </div>
          ))}
        </div>
      </section>

      {/* Footer con carta digital en formato acordeón */}
      <footer className="w-100 py-4 text-center text-secondary bg-black mt-5 rounded-top shadow border-top border-warning">
        <CartaDigitalAccordion />
        <span className="small d-block mt-3">
          © 2025 La Vieja Estación Resto-Bar. Todos los derechos reservados.
        </span>
      </footer>
    </div>
  );
};

export default HomePage;