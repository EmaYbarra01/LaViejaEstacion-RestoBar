import { useEffect, useState } from "react";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../helpers/queriesProductos";
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

  const [form, setForm] = useState({
    name: "",
    code: "",
    price: "",
    imgUrl: "",
    stock: "",
    category: "",
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      imgUrl: "",
      stock: "",
      category: "",
    });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
      />

      <TableContainer className="admin-table-container">
        <Table className="admin-table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
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
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>
                    <span className="role-badge user">
                      {product.category || 'General'}
                    </span>
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.stock || 0}</TableCell>
                  <TableCell>
                    <div className="action-buttons">
                      <Button
                        variant="contained"
                        className="edit-button"
                        onClick={() => handleEditProduct(product)}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="contained"
                        className="delete-button"
                        onClick={() => handleDeleteProduct(product.id)}
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
