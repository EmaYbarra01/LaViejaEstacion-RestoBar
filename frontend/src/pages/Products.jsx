import { useEffect, useState } from "react";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, checkProductCodeExists, checkProductNameExists } from "../helpers/queriesProductos";
import ProductFormModal from "../crud/products/ProductFormModal";
import {
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
} from "@mui/material";
import Swal from 'sweetalert2';
import "./AdminPage.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [nameError, setNameError] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
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
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    setForm({
      ...form,
      [name]: value,
    });

    // Validar código en tiempo real
    if (name === 'code' && value.trim()) {
      const exists = await checkProductCodeExists(value, isEdit ? form.id : null);
      if (exists) {
        setCodeError(`⚠️ El código "${value}" ya existe`);
      } else {
        setCodeError("");
      }
    } else if (name === 'code') {
      setCodeError("");
    }

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
    
    try {
      if (isEdit) {
        const updatedProduct = await updateProduct(form.id, form);
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
        const newProduct = await createProduct(form);
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
      code: "",
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
    setCodeError("");
    setNameError("");
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCodeError("");
    setNameError("");
  };

  const handleEditProduct = async (product) => {
    setIsEdit(true);
    setForm(product);
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
          📦 Gestión de Productos
        </h1>
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
      </div>

      <ProductFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}
        onClose={handleCloseModal}
        codeError={codeError}
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
                <TableRow key={product.id} sx={{ 
                  backgroundColor: product.available ? 'inherit' : '#ffebee',
                  opacity: product.available ? 1 : 0.7
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
                      color: product.stock <= (product.minimumStock || 0) ? '#d32f2f' : '#2e7d32',
                      fontWeight: 'bold'
                    }}>
                      {product.stock || 0}
                    </span>
                    {product.stock <= (product.minimumStock || 0) && (
                      <div style={{ fontSize: '0.8em', color: '#d32f2f' }}>
                        ⚠️ Stock bajo
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.available ? (
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✅ Disponible</span>
                    ) : (
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>❌ No disponible</span>
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Products;
