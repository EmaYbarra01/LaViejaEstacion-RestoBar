import { useEffect, useState } from "react";
import { getAllProducts, createProduct, updateProduct, deleteProduct, checkProductNameExists } from "../helpers/queriesProductos";
import ProductFormModal from "../crud/products/ProductFormModal";
import {
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Chip,
  Alert
} from "@mui/material";
import Swal from 'sweetalert2';
import useUserStore from '../store/useUserStore';
import "./AdminPage.css";

const Products = () => {
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'SuperAdministrador';
  const isGerente = user?.role === 'Gerente';
  const canEdit = isSuperAdmin; // Solo SuperAdmin puede editar productos
  const canView = isSuperAdmin || isGerente; // Ambos pueden ver
  
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [nameError, setNameError] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    price: "",
    cost: "",
    imgUrl: "",
    stock: "",
    minimumStock: "",
    category: "",
    description: "",
    unit: "Unidad",
    available: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getAllProducts();
      // Asegurar que siempre sea un array
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setProducts(productsArray);
      
      // Calcular productos con stock bajo
      const lowStock = productsArray.filter((product) => {
        const stock = Number(product.stock || 0);
        const minimumStock = Number(product.minimumStock || 0);
        return stock <= minimumStock;
      }).length;
      setLowStockCount(lowStock);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]); // Establecer array vacío en caso de error
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'stock' || name === 'minimumStock' || name === 'price' || name === 'cost'
      ? value
      : value;
    
    setForm({
      ...form,
      [name]: nextValue,
    });

    // Validar nombre en tiempo real
    if (name === 'name' && value.trim()) {
      const exists = await checkProductNameExists(value, isEdit ? form.id : null);
      if (exists) {
        setNameError(`⚠️ El producto "${value}" ya existe`);
      } else {
        setNameError("");
      }
    } else if (name === 'name') {
      setNameError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar si hay errores antes de enviar
    if (codeError) {
      await Swal.fire({
        icon: 'warning',
        title: 'Código duplicado',
        text: 'El código ingresado ya existe. Por favor, use uno diferente.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    if (nameError) {
      await Swal.fire({
        icon: 'warning',
        title: 'Producto duplicado',
        text: 'Ya existe un producto con ese nombre. Por favor, use uno diferente.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const stockValue = Number(form.stock || 0);
    const normalizedForm = {
      ...form,
      stock: stockValue,
      minimumStock: Number(form.minimumStock || 0),
      price: Number(form.price || 0),
      cost: Number(form.cost || 0),
      available: stockValue > 0 ? form.available !== false : false
    };
    
    try {
      if (isEdit) {
        const updatedProduct = await updateProduct(form.id, normalizedForm);
        setProducts(
          products.map((product) =>
            product.id === form.id ? updatedProduct : product
          )
        );
        setOpenModal(false);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Producto actualizado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      } else {
        const newProduct = await createProduct(normalizedForm);
        setProducts([...products, newProduct]);
        setOpenModal(false);
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Producto agregado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting product:", err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.mensaje || 'Error al procesar el producto',
        confirmButtonColor: '#667eea'
      });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      cost: "",
      imgUrl: "",
      stock: "",
      minimumStock: "",
      category: "",
      description: "",
      unit: "Unidad",
      available: true
    });
    setNameError("");
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNameError("");
  };

  const handleEditProduct = async (product) => {
    setIsEdit(true);
    setForm({
      ...product,
      id: product.id,
      stock: product.stock ?? 0,
      minimumStock: product.minimumStock ?? 0,
      available: product.available !== false
    });
    handleOpenModal();
  };

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        await Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'Producto eliminado correctamente',
          confirmButtonColor: '#667eea',
          timer: 2000
        });
      } catch (err) {
        console.error("Error deleting product:", err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el producto',
          confirmButtonColor: '#667eea'
        });
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          {isGerente ? '🔍 Supervisión de Productos' : '📦 Gestión de Productos'}
        </h1>
        {isGerente && (
          <Chip 
            label="Solo Lectura" 
            color="warning" 
            size="small" 
            style={{ marginLeft: '10px' }}
          />
        )}
        {canEdit && (
          <Button
            variant="contained"
            className="create-button"
            onClick={() => {
              setIsEdit(false);
              resetForm();
              handleOpenModal();
            }}
          >
            ➕ Crear Producto
          </Button>
        )}
      </div>

      {/* Banner de Solo Lectura para Gerente */}
      {isGerente && (
        <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffc107' }}>
          <p style={{ margin: 0, color: '#856404' }}>📋 Solo visualización - Sin edición permitida</p>
        </div>
      )}

      {/* Alertas de Stock Bajo */}
      {lowStockCount > 0 && (
        <Alert severity="warning" style={{ marginBottom: '20px' }}>
          <strong>⚠️ Atención:</strong> Hay {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo o agotado.
          {isGerente && ' Contacte al SuperAdministrador para realizar reposición.'}
        </Alert>
      )}

      <ProductFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}
        onClose={handleCloseModal}
        nameError={nameError}
      />

      <TableContainer className="admin-table-container">
        <Table className="admin-table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Costo</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="empty-table">
                  No hay productos registrados
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                (() => {
                  const stock = Number(product.stock || 0);
                  const minimumStock = Number(product.minimumStock || 0);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= minimumStock;
                  const isAvailable = !isOutOfStock && product.available !== false;

                  return (
                <TableRow key={product.id} sx={{ 
                  backgroundColor: isAvailable ? 'inherit' : '#ffebee',
                  opacity: isAvailable ? 1 : 0.7
                }}>
                  <TableCell>
                    <strong>{product.name}</strong>
                    {product.description && (
                      <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                        {product.description.substring(0, 50)}
                        {product.description.length > 50 && '...'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="role-badge user">
                      {product.category || 'General'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <strong style={{ color: '#2e7d32' }}>${product.price}</strong>
                  </TableCell>
                  <TableCell>
                    ${product.cost || 0}
                    {product.cost && product.price && (
                      <div style={{ fontSize: '0.8em', color: '#1976d2' }}>
                        Margen: {(((product.price - product.cost) / product.cost) * 100).toFixed(0)}%
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      color: isOutOfStock || isLowStock ? '#d32f2f' : '#2e7d32',
                      fontWeight: 'bold'
                    }}>
                      {stock}
                    </span>
                    {isOutOfStock ? (
                      <div style={{ fontSize: '0.8em', color: '#d32f2f' }}>
                        🔴 Agotado
                      </div>
                    ) : isLowStock && (
                      <div style={{ fontSize: '0.8em', color: '#d32f2f' }}>
                        ⚠️ Stock bajo
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAvailable ? (
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✅ Disponible</span>
                    ) : (
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>❌ No disponible</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <div className="action-buttons">
                        <Button
                          variant="contained"
                          className="edit-button"
                          onClick={() => handleEditProduct(product)}
                          size="small"
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          variant="contained"
                          className="delete-button"
                          onClick={() => handleDeleteProduct(product.id)}
                          size="small"
                        >
                          🗑️ Eliminar
                        </Button>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>Solo visualización</span>
                    )}
                  </TableCell>
                </TableRow>
                  );
                })()
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Products;
