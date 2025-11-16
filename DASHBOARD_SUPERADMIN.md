# Dashboard del SuperAdministrador - Guía de Uso

## 📊 Características Implementadas

### ✅ Componentes Desarrollados

1. **Backend - Endpoint de Estadísticas**
   - Ruta: `GET /api/dashboard/estadisticas`
   - Controlador: `dashboard.controller.js`
   - Protección: Solo SuperAdministrador y Gerente

2. **Frontend - Dashboard Interactivo**
   - Componente: `SuperadminDashboard.jsx`
   - Estilos: `SuperadminDashboard.css`
   - Librería de gráficos: Recharts

### 📈 Visualizaciones Incluidas

#### 1. Tarjetas de Resumen (3 cards superiores)
- **💰 Ventas del Mes**: Total de ventas del mes actual
- **📦 Pedidos del Mes**: Cantidad de pedidos + promedio de venta
- **⚠️ Alertas de Stock**: Productos con stock bajo

#### 2. Gráfico de Ventas Mensuales
- Gráfico de barras con ventas de los últimos 12 meses
- Muestra el total en pesos por mes
- Leyenda y tooltips informativos

#### 3. Gráfico de Ventas por Categoría
- Gráfico de torta (pie chart) con distribución por categoría
- Colores diferenciados por categoría
- Muestra el total de ventas por categoría del mes actual

#### 4. Top 10 Productos Más Vendidos
- Lista ordenada de productos más vendidos del mes
- Muestra:
  - Ranking (podio dorado/plata/bronce para top 3)
  - Nombre del producto y categoría
  - Cantidad vendida
  - Total de ventas en pesos
- Scroll vertical si hay muchos productos

#### 5. Alertas de Stock Bajo
- Lista de productos que requieren reposición
- Niveles de urgencia:
  - 🔴 CRÍTICO: Stock en 0
  - 🟠 URGENTE: Stock < stockMinimo / 2
  - 🟡 MEDIO: Stock <= stockMinimo
- Muestra stock actual vs stock mínimo

### 🎨 Diseño Visual

- **Tema oscuro**: Fondo degradado azul oscuro (#0f172a → #1e293b)
- **Cards con sombra**: Efecto de elevación y hover
- **Colores corporativos**:
  - Azul: #2563eb (principal)
  - Verde: #10b981 (ventas)
  - Naranja: #f59e0b (alertas)
  - Rojo: #ef4444 (crítico)
- **Responsive**: Grid adaptable a diferentes tamaños de pantalla
- **Iconos emoji**: Visualización rápida de cada sección

### 📍 Acceso al Dashboard

1. **Iniciar sesión** con credenciales de SuperAdministrador o Gerente:
   ```
   Email: admin@restobar.com
   Password: SA007
   
   O
   
   Email: gerente@restobar.com
   Password: GER123
   ```

2. **Navegar** a `/admin/dashboard`

3. El dashboard se cargará automáticamente con las estadísticas

### 🔄 Actualización de Datos

- Botón **"🔄 Actualizar"** en la esquina superior derecha
- Recarga las estadísticas sin necesidad de refrescar la página

### 📊 Datos de Prueba Generados

El script `generar-datos-dashboard.js` ha creado:
- **113 pedidos cobrados** distribuidos en los últimos 12 meses
- Ventas totales: **$3,161,000.00**
- Pedidos con 2-5 productos cada uno
- Mix de métodos de pago (Efectivo/Transferencia)
- Descuentos del 10% aplicados aleatoriamente

### 🛠️ Archivos Creados

**Backend:**
- `backend/src/routes/dashboard.routes.js`
- `backend/src/controllers/dashboard.controller.js`
- `backend/generar-datos-dashboard.js`

**Frontend:**
- `frontend/src/pages/SuperadminDashboard.jsx`
- `frontend/src/pages/SuperadminDashboard.css`

**Modificaciones:**
- `backend/index.js`: Importa y registra dashboard.routes
- `frontend/src/App.jsx`: Usa SuperadminDashboard en lugar de Dashboard

### 🔍 Endpoints de la API

```javascript
GET /api/dashboard/estadisticas
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "ventasMensuales": [
      { "mes": "Ene", "total": 250000, "cantidad": 10 },
      // ... 12 meses
    ],
    "ventasPorCategoria": [
      { "categoria": "Comidas", "total": 800000, "cantidad": 120 },
      { "categoria": "Bebidas", "total": 300000, "cantidad": 180 }
    ],
    "top10Productos": [
      {
        "nombre": "Hamburguesa Completa",
        "categoria": "Comidas",
        "cantidadVendida": 45,
        "totalVentas": 270000
      }
    ],
    "alertasStock": [
      {
        "producto": "Coca Cola 500ml",
        "categoria": "Bebidas",
        "stockActual": 2,
        "stockMinimo": 10,
        "urgencia": "URGENTE"
      }
    ],
    "resumenMes": {
      "totalVentas": 450000,
      "cantidadPedidos": 25,
      "promedioVenta": 18000
    }
  }
}
```

### ✨ Próximas Mejoras (Placeholder)

- **💳 Métodos de Pago**: Distribución de ventas por método de pago
- **📅 Comparativa Mensual**: Comparar mes actual vs mes anterior
- **👥 Rendimiento de Mozos**: Estadísticas por mozo
- **⏰ Horas Pico**: Distribución de ventas por horario

### 🐛 Troubleshooting

**Problema**: El dashboard no carga datos
- **Solución**: Verificar que el backend esté corriendo en puerto 4000
- **Solución**: Verificar que haya pedidos cobrados en la base de datos

**Problema**: Gráficos no se visualizan
- **Solución**: Verificar que recharts esté instalado: `npm install recharts`

**Problema**: Error 401 al cargar estadísticas
- **Solución**: Verificar que el usuario esté autenticado como SuperAdministrador o Gerente

## 🎯 Resumen de Completitud

✅ Ventas mensuales (gráfico de barras)
✅ Ventas por categoría (gráfico de torta)
✅ Top 10 productos más vendidos (lista con ranking)
✅ Alertas de stock bajo (lista con niveles de urgencia)
✅ Tarjetas de resumen del mes
✅ Diseño responsive y acorde a la imagen de referencia
✅ Datos de prueba generados

El dashboard está **100% funcional** y listo para usar.
