import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Container } from 'react-bootstrap';
import { FaHamburger, FaCocktail, FaIceCream } from 'react-icons/fa';
import './Header.css';

const comida = [
  { name: 'Hamburguesa Clásica', price: 1200, description: 'Carne de res, queso cheddar, lechuga, tomate y mayonesa.', preparation: 'Preparada con ingredientes frescos y pan artesanal.' },
  { name: 'Pizza Margarita', price: 1500, description: 'Salsa de tomate, mozzarella fresca y albahaca.', preparation: 'Horneada en horno de piedra para un sabor auténtico.' },
  { name: 'Ensalada César', price: 900, description: 'Lechuga romana, crutones, queso parmesano y aderezo César.', preparation: 'Aderezo casero con un toque de anchoas.' },
  { name: 'Milanesa Napolitana', price: 1700, description: 'Carne empanada, salsa de tomate, jamón y queso.', preparation: 'Acompañada de papas fritas.' },
  { name: 'Empanadas Salteñas', price: 300, description: 'Carne cortada a cuchillo, cebolla y huevo.', preparation: 'Cocidas al horno de barro.' },
  { name: 'Lomo Completo', price: 2000, description: 'Lomo, jamón, queso, huevo y vegetales.', preparation: 'En pan artesanal.' },
  { name: 'Tarta de Verduras', price: 800, description: 'Masa casera, espinaca y ricota.', preparation: 'Acompañada de ensalada.' },
  { name: 'Pollo al Curry', price: 1600, description: 'Pollo, salsa curry y arroz basmati.', preparation: 'Receta especial de la casa.' },
  { name: 'Ravioles de Ricota', price: 1400, description: 'Pasta casera rellena de ricota y nuez.', preparation: 'Con salsa fileto.' },
  { name: 'Sándwich Vegano', price: 1100, description: 'Pan integral, hummus, vegetales frescos.', preparation: 'Ideal para vegetarianos.' },
];

const bebidas = [
  { name: 'Cerveza Artesanal', price: 600, tipo: 'Alcohol' },
  { name: 'Vino Malbec', price: 900, tipo: 'Alcohol' },
  { name: 'Agua Mineral', price: 250, tipo: 'Sin alcohol' },
  { name: 'Gaseosa Cola', price: 350, tipo: 'Sin alcohol' },
  { name: 'Jugo Natural', price: 400, tipo: 'Sin alcohol' },
  { name: 'Fernet con Coca', price: 700, tipo: 'Alcohol' },
  { name: 'Gin Tonic', price: 800, tipo: 'Alcohol' },
  { name: 'Café Expreso', price: 300, tipo: 'Caliente' },
  { name: 'Té de Hierbas', price: 280, tipo: 'Caliente' },
  { name: 'Limonada', price: 350, tipo: 'Sin alcohol' },
];

const postres = [
  { name: 'Flan Casero', price: 500, ingredientes: 'Leche, huevos, azúcar, vainilla' },
  { name: 'Helado Artesanal', price: 600, ingredientes: 'Leche, crema, frutas' },
  { name: 'Tarta de Manzana', price: 550, ingredientes: 'Manzana, masa, azúcar' },
  { name: 'Brownie con Helado', price: 700, ingredientes: 'Chocolate, nuez, helado' },
  { name: 'Cheesecake', price: 650, ingredientes: 'Queso crema, galleta, frutos rojos' },
  { name: 'Panqueque de Dulce de Leche', price: 500, ingredientes: 'Harina, huevo, dulce de leche' },
  { name: 'Fruta Fresca', price: 400, ingredientes: 'Frutas de estación' },
  { name: 'Budín de Pan', price: 450, ingredientes: 'Pan, leche, azúcar, pasas' },
  { name: 'Tiramisú', price: 700, ingredientes: 'Café, queso mascarpone, cacao' },
  { name: 'Copa Oreo', price: 600, ingredientes: 'Galleta Oreo, crema, chocolate' },
];

export default function Header() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'admin';
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-lg py-3">
      <Container>
        <Navbar.Brand href="#" className="fw-bold text-warning">
          La Vieja Estación
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Dropdown className="mx-2">
            <Dropdown.Toggle variant="warning" id="dropdown-comida">
              <FaHamburger className="me-2" /> Comida
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-dark text-light border-warning">
              {comida.map((item, idx) => (
                <Dropdown.Item key={idx} className="text-light">
                  <div className="fw-bold">
                    {item.name}{' '}
                    <span className="text-warning">${item.price}</span>
                  </div>
                  <div className="small text-secondary">{item.description}</div>
                  <div className="small text-muted">{item.preparation}</div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown className="mx-2">
            <Dropdown.Toggle variant="info" id="dropdown-bebidas">
              <FaCocktail className="me-2" /> Bebidas
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-dark text-light border-info">
              {bebidas.map((item, idx) => (
                <Dropdown.Item key={idx} className="text-light">
                  <div className="fw-bold">
                    {item.name}{' '}
                    <span className="text-info">${item.price}</span>
                  </div>
                  <div className="small text-secondary">{item.tipo}</div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown className="mx-2">
            <Dropdown.Toggle variant="success" id="dropdown-postres">
              <FaIceCream className="me-2" /> Postres
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-dark text-light border-success">
              {postres.map((item, idx) => (
                <Dropdown.Item key={idx} className="text-light">
                  <div className="fw-bold">
                    {item.name}{' '}
                    <span className="text-success">${item.price}</span>
                  </div>
                  <div className="small text-secondary">{item.ingredientes}</div>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}