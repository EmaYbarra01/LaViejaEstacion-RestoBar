# 🧪 Ejemplos de Uso - API Menú Digital

## Endpoint: GET /api/menu

**URL:** `http://localhost:4000/api/menu`  
**Método:** GET  
**Autenticación:** ❌ No requerida (público)

---

## 📋 Ejemplo de Respuesta Exitosa

```json
{
  "restaurante": "La Vieja Estación",
  "slogan": "Sabores que cuentan historias",
  "menu": {
    "Comidas": [
      {
        "id": "673abc123def456789012345",
        "nombre": "Hamburguesa Clásica",
        "descripcion": "Carne de res premium, queso cheddar, lechuga fresca, tomate y mayonesa casera en pan artesanal.",
        "precio": 1200,
        "imagenUrl": "/images/productos/hamburguesa-clasica.jpg"
      },
      {
        "id": "673abc123def456789012346",
        "nombre": "Pizza Margarita",
        "descripcion": "Salsa de tomate casera, mozzarella de primera calidad y albahaca fresca.",
        "precio": 1500,
        "imagenUrl": "/images/productos/pizza-margarita.jpg"
      },
      {
        "id": "673abc123def456789012347",
        "nombre": "Milanesa Napolitana",
        "descripcion": "Carne tierna empanada, salsa de tomate, jamón cocido y queso gratinado. Con guarnición.",
        "precio": 1700,
        "imagenUrl": "/images/productos/milanesa-napolitana.jpg"
      }
    ],
    "Bebidas": [
      {
        "id": "673abc123def456789012348",
        "nombre": "Agua Mineral",
        "descripcion": "Agua mineral con o sin gas. 500ml",
        "precio": 250,
        "imagenUrl": "/images/productos/agua.jpg"
      },
      {
        "id": "673abc123def456789012349",
        "nombre": "Gaseosa",
        "descripcion": "Línea Coca-Cola, Sprite o Fanta. 500ml",
        "precio": 350,
        "imagenUrl": "/images/productos/gaseosa.jpg"
      }
    ],
    "Bebidas Alcohólicas": [
      {
        "id": "673abc123def45678901234a",
        "nombre": "Cerveza Artesanal",
        "descripcion": "Cerveza local IPA o Honey. 500ml",
        "precio": 600,
        "imagenUrl": "/images/productos/cerveza-artesanal.jpg"
      },
      {
        "id": "673abc123def45678901234b",
        "nombre": "Vino Malbec",
        "descripcion": "Copa de vino Malbec de la región. Bodega seleccionada.",
        "precio": 900,
        "imagenUrl": "/images/productos/vino-malbec.jpg"
      }
    ],
    "Postres": [
      {
        "id": "673abc123def45678901234c",
        "nombre": "Flan Casero",
        "descripcion": "Flan casero con dulce de leche y crema.",
        "precio": 500,
        "imagenUrl": "/images/productos/flan.jpg"
      },
      {
        "id": "673abc123def45678901234d",
        "nombre": "Helado Artesanal",
        "descripcion": "2 bochas de helado artesanal. Sabores variados.",
        "precio": 600,
        "imagenUrl": "/images/productos/helado.jpg"
      }
    ],
    "Entradas": [
      {
        "id": "673abc123def45678901234e",
        "nombre": "Picada para 2",
        "descripcion": "Tabla de fiambres, quesos, aceitunas, pickles y pan.",
        "precio": 1800,
        "imagenUrl": "/images/productos/picada.jpg"
      }
    ]
  },
  "ultimaActualizacion": "2025-11-11T18:45:30.123Z"
}
```

---

## 🧪 Pruebas con cURL

### 1. Obtener Menú Completo

```bash
curl -X GET http://localhost:4000/api/menu
```

### 2. Obtener Menú con Pretty Print

```bash
curl -X GET http://localhost:4000/api/menu | json_pp
```

### 3. Guardar Respuesta en Archivo

```bash
curl -X GET http://localhost:4000/api/menu -o menu-response.json
```

### 4. Ver Solo Headers

```bash
curl -I http://localhost:4000/api/menu
```

**Respuesta esperada:**
```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Nov 2025 18:45:30 GMT
Content-Length: 3456
```

---

## 🧪 Pruebas con JavaScript (Fetch)

### En el Navegador (Console)

```javascript
// Obtener el menú
fetch('http://localhost:4000/api/menu')
  .then(res => res.json())
  .then(data => {
    console.log('Restaurante:', data.restaurante);
    console.log('Total de categorías:', Object.keys(data.menu).length);
    
    Object.entries(data.menu).forEach(([categoria, productos]) => {
      console.log(`${categoria}: ${productos.length} productos`);
    });
  });
```

### Con async/await

```javascript
async function obtenerMenu() {
  try {
    const response = await fetch('http://localhost:4000/api/menu');
    const data = await response.json();
    
    console.log('Menú cargado:', data);
    return data;
  } catch (error) {
    console.error('Error al cargar menú:', error);
  }
}

obtenerMenu();
```

---

## 🧪 Pruebas con Axios (React)

```javascript
import axios from 'axios';

// En un componente React
useEffect(() => {
  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/menu');
      console.log('Menú:', response.data);
      
      // Procesar categorías
      const categorias = Object.keys(response.data.menu);
      console.log('Categorías disponibles:', categorias);
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  fetchMenu();
}, []);
```

---

## 🧪 Pruebas con Postman

### Request
```
GET http://localhost:4000/api/menu
```

### Headers
```
Content-Type: application/json
```

### Response Status
```
200 OK
```

### Tests (Postman Scripts)

```javascript
// Verificar status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Verificar que retorna JSON
pm.test("Response is JSON", function () {
    pm.response.to.be.json;
});

// Verificar estructura
pm.test("Has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('restaurante');
    pm.expect(jsonData).to.have.property('menu');
    pm.expect(jsonData).to.have.property('ultimaActualizacion');
});

// Verificar categorías
pm.test("Menu has categories", function () {
    var jsonData = pm.response.json();
    pm.expect(Object.keys(jsonData.menu).length).to.be.above(0);
});

// Verificar productos en cada categoría
pm.test("Each category has products", function () {
    var jsonData = pm.response.json();
    Object.values(jsonData.menu).forEach(productos => {
        pm.expect(productos).to.be.an('array');
        pm.expect(productos.length).to.be.above(0);
    });
});
```

---

## 📊 Casos de Prueba

| # | Caso | Método | Resultado Esperado | Status |
|---|------|--------|-------------------|--------|
| 1 | Menú con productos | GET | 200 OK, JSON con categorías | ✅ |
| 2 | Menú sin autenticación | GET | 200 OK (público) | ✅ |
| 3 | BD vacía | GET | 200 OK, menu: {} | ✅ |
| 4 | Productos deshabilitados | GET | No aparecen en menu | ✅ |
| 5 | Error de BD | GET | 500 Error interno | ✅ |
| 6 | CORS habilitado | GET | Access-Control-Allow-Origin | ✅ |

---

## 🔄 Integración Frontend

### Ejemplo Completo en React

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MenuComponent() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/menu');
      setMenuData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el menú');
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando menú...</div>;
  if (error) return <div>{error}</div>;
  if (!menuData) return null;

  return (
    <div>
      <h1>{menuData.restaurante}</h1>
      <p>{menuData.slogan}</p>
      
      {Object.entries(menuData.menu).map(([categoria, productos]) => (
        <div key={categoria}>
          <h2>{categoria}</h2>
          <ul>
            {productos.map(producto => (
              <li key={producto.id}>
                <strong>{producto.nombre}</strong> - ${producto.precio}
                <p>{producto.descripcion}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <small>
        Última actualización: {new Date(menuData.ultimaActualizacion).toLocaleString()}
      </small>
    </div>
  );
}

export default MenuComponent;
```

---

## 🐛 Debugging

### Ver Logs del Servidor

El endpoint registra cada acceso:

```
[2025-11-11T18:45:30.123Z] GET /api/menu - Menu solicitado
```

### Errores Comunes

#### Error: Cannot GET /api/menu

**Causa:** Servidor no está corriendo o ruta incorrecta  
**Solución:**
```bash
cd backend
npm start
```

#### Error: Network Error

**Causa:** CORS o servidor no accesible  
**Solución:** Verificar configuración CORS en `index.js`

#### Error: Menu vacío {}

**Causa:** No hay productos en BD o todos están deshabilitados  
**Solución:**
```bash
node scripts/seedMenuData.js
```

---

## 📈 Monitoreo de Performance

### Tiempo de Respuesta

```javascript
console.time('Menu API');
fetch('http://localhost:4000/api/menu')
  .then(res => res.json())
  .then(data => {
    console.timeEnd('Menu API');
    // Esperado: < 100ms
  });
```

### Tamaño de Respuesta

```bash
curl -w "Size: %{size_download} bytes\nTime: %{time_total}s\n" \
     http://localhost:4000/api/menu -o /dev/null
```

---

## ✅ Checklist de Verificación

- [ ] Endpoint responde con 200 OK
- [ ] Retorna JSON válido
- [ ] Incluye todas las categorías
- [ ] Productos tienen todos los campos requeridos
- [ ] Solo muestra productos disponibles
- [ ] No expone datos sensibles (costo, stock)
- [ ] Funciona sin autenticación
- [ ] CORS configurado correctamente
- [ ] Tiempo de respuesta < 200ms
- [ ] Frontend puede consumir el endpoint

---

**Documentación de Pruebas - HU1**  
La Vieja Estación RestoBar  
Última actualización: 11/11/2025
