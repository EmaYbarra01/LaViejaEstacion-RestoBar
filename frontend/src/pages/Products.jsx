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
  Typography,
  Box,
} from "@mui/material";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    price: "",
    imgUrl: "",
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
        alert("Producto actualizado correctamente");
      } else {
        const newProduct = await createProduct(form);
        setProducts([...products, newProduct]);
        setOpenModal(false);
        alert("Producto agregado correctamente");
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting product:", err);
      alert("Error al procesar el producto");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      price: "",
      imgUrl: "",
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
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        alert("Producto eliminado correctamente");
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error al eliminar el producto");
      }
    }
  };

  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Productos
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setIsEdit(false);
          resetForm();
          handleOpenModal();
        }}
        sx={{ marginBottom: 2 }}
      >
        Crear Producto
      </Button>

      <ProductFormModal
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isEdit={isEdit}
        open={openModal}
        onClose={handleCloseModal}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.code}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditProduct(product)}
                    sx={{ marginRight: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Products;
