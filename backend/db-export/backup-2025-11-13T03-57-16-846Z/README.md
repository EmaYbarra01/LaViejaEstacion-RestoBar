# Backup de Base de Datos - RestoBar

**Fecha de exportación:** 13/11/2025, 12:57:16
**Base de datos:** restobar_db
**Total de documentos:** 4

## Colecciones exportadas:

- **reservas.json** - 4 reservas
- **mesas.json** - 0 mesas
- **usuarios.json** - 0 usuarios (sin contraseñas)
- **productos.json** - 0 productos
- **pedidos.json** - 0 pedidos

## Cómo importar:

### Opción 1: MongoDB Compass
1. Abre MongoDB Compass
2. Conéctate a: `mongodb://localhost:27017`
3. Selecciona la base de datos `restobar_db`
4. Para cada colección:
   - Click en "Add Data" → "Import JSON"
   - Selecciona el archivo correspondiente

### Opción 2: mongoimport (comando)
```bash
mongoimport --db restobar_db --collection reservas --file reservas.json --jsonArray
mongoimport --db restobar_db --collection mesas --file mesas.json --jsonArray
mongoimport --db restobar_db --collection usuarios --file usuarios.json --jsonArray
mongoimport --db restobar_db --collection productos --file productos.json --jsonArray
mongoimport --db restobar_db --collection pedidos --file pedidos.json --jsonArray
```

### Opción 3: Script de importación
Ejecuta: `node importar-db.js`
