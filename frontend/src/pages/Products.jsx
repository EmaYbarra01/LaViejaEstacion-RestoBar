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
  Alert,

} from "@mui/material";
import Swal from 'sweetalert2';
import useUserStore from '../store/useUserStore';
import { formatCurrency } from '../utils/currencyFormatter';
import "./AdminPage.css";

const Products = () => {
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'SuperAdministrador';
  const isGerente = user?.role === 'Gerente';
  const canEdit = isSuperAdmin || isGerente;
  
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [nameError, setNameError] = useState("");
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [productsError, setProductsError] = useState('');

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
  }, [user?.role]);

  const loadProducts = async () => {
    try {
      const productsData = await getAllProducts();
      // Asegurar que siempre sea un array
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setProducts(productsArray);
      setProductsError('');
      
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setProductsError(err.response?.data?.mensaje || 'No se pudieron cargar los productos.');
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
        setNameError(`El producto "${value}" ya existe`);
      } else {
        setNameError("");
      }
    } else if (name === 'name') {
      setNameError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (nameError) {
      await Swal.fire({
        title: 'Producto duplicado',
        text: 'Ya existe un producto con ese nombre. Por favor, use uno diferente.',
        confirmButtonColor: '#642f3a'
      });
      return;
    }

    const stockValue = Number(form?.stock ?? 0);
    const estadoActual = form?.available !== false;
    const nuevoEstado = stockValue > 0 ? true : estadoActual;
    const normalizedForm = {
      ...form,
      stock: stockValue,
      minimumStock: Number(form?.minimumStock ?? 0),
      price: Number(form?.price ?? 0),
      cost: Number(form?.cost ?? 0),
      available: nuevoEstado
    };
    
    try {
      if (isEdit) {
        const updatedProduct = await updateProduct(form.id, normalizedForm);
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product?.id === form?.id ? {
              ...(updatedProduct || normalizedForm),
              stock: Number(updatedProduct?.stock ?? stockValue),
              available: stockValue > 0 ? true : nuevoEstado
            } : product
          )
        );
        setOpenModal(false);
        await Swal.fire({
          title: '¡Actualizado!',
          text: 'Producto actualizado correctamente',
          confirmButtonColor: '#642f3a',
          timer: 2000
        });
      } else {
        const newProduct = await createProduct(normalizedForm);
        setProducts((currentProducts) => [...currentProducts, newProduct]);
        setOpenModal(false);
        await Swal.fire({
          title: '¡Creado!',
          text: 'Producto agregado correctamente',
          confirmButtonColor: '#642f3a',
          timer: 2000
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error submitting product:", err);
      await Swal.fire({
        title: 'Error',
        text: err.response?.data?.mensaje || 'Error al procesar el producto',
        confirmButtonColor: '#642f3a'
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
    if (!product) return;
    setIsEdit(true);
    setForm({
      ...product,
      id: product?.id,
      stock: product?.stock ?? 0,
      minimumStock: product?.minimumStock ?? 0,
      available: product?.available !== false
    });
    handleOpenModal();
  };

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#642f3a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'Producto eliminado correctamente',
          confirmButtonColor: '#642f3a',
          timer: 2000
        });
      } catch (err) {
        console.error("Error deleting product:", err);
        await Swal.fire({
          title: 'Error',
          text: 'Error al eliminar el producto',
          confirmButtonColor: '#642f3a'
        });
      }
    }
  };

  const categories = [...new Set(
    products
      .map((product) => String(product.category || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  const filteredProducts = [...products]
    .filter((product) => {
      const name = filterName.trim().toLocaleLowerCase();
      const category = filterCategory.trim().toLocaleLowerCase();
      return (!name || String(product.name || '').toLocaleLowerCase().includes(name))
        && (!category || String(product.category || '').toLocaleLowerCase() === category);
    })
    .sort((a, b) => (
      String(a.name || '').localeCompare(String(b.name || ''), 'es', {
        sensitivity: 'base',
        numeric: true
      })
      || String(a.category || '').localeCompare(String(b.category || ''), 'es', { sensitivity: 'base' })
      || String(a.id).localeCompare(String(b.id), 'es', { numeric: true })
    ));

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);
    const minimumStock = Number(product.minimumStock || 0);
    return stock <= minimumStock;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          {isGerente ? 'Supervisión de Productos' : 'Gestión de Productos'}
        </h1>
        {isGerente && (
          <Chip 
            label="Gestión completa"
            color="success"
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
            Crear producto
          </Button>
        )}
      </div>

      {productsError && (
        <Alert severity="error" icon={false} sx={{ marginBottom: '20px' }}>
          {productsError}
        </Alert>
      )}

      <section className="products-filters" aria-label="Filtros de productos">
        <div className="products-filters-heading">
          <div>
            <h2>Catálogo de productos</h2>
            <p>Buscá por nombre o seleccioná una categoría para encontrar productos.</p>
          </div>
          <span className="products-results-count">
            {filteredProducts.length} de {products.length}
          </span>
        </div>
        <div className="products-filters-fields">
          <div className="products-filter-field">
            <label htmlFor="product-name-filter">Filtrar por nombre</label>
            <input
              id="product-name-filter"
              type="search"
              value={filterName}
              onChange={(event) => setFilterName(event.target.value)}
              maxLength={80}
            />
          </div>
          <div className="products-filter-field products-category-filter">
            <label htmlFor="product-category-filter">Filtrar por categoría</label>
            <select
              id="product-category-filter"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          {(filterName || filterCategory) && (
            <Button
              variant="outlined"
              className="products-clear-filters"
              onClick={() => {
                setFilterName('');
                setFilterCategory('');
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </section>

      {lowStockProducts.length > 0 && (
        <Alert severity="warning" icon={false} style={{ marginBottom: '20px' }}>
          <strong>Atención:</strong> {lowStockProducts.length === 1
            ? 'Este producto requiere reposición: '
            : 'Estos productos requieren reposición: '}
          {lowStockProducts.map((product) => product.name).join(', ')}.
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
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="empty-table">
                  No hay productos registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                (() => {
                  const stock = Number(product?.stock ?? 0);
                  const minimumStock = Number(product?.minimumStock ?? 0);
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= minimumStock;
                  const isAvailable = stock > 0;

                  return (
                <TableRow key={product.id} sx={{ 
                  backgroundColor: isAvailable ? 'inherit' : '#ffebee',
                  opacity: isAvailable ? 1 : 0.7
                }}>
                  <TableCell>
                    <strong>{product.name}</strong>
                    {product?.description && (
                      <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                        {String(product.description).substring(0, 50)}
                        {String(product.description).length > 50 && '...'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="role-badge user">
                      {product.category || 'General'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <strong style={{ color: '#8a6a2f' }}>${formatCurrency(product.price)}</strong>
                  </TableCell>
                  <TableCell>
                    ${formatCurrency(product.cost || 0)}
                    {product.cost && product.price && (
                      <div style={{ fontSize: '0.8em', color: '#1976d2' }}>
                        Margen: {(((product.price - product.cost) / product.cost) * 100).toFixed(0)}%
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      color: isOutOfStock || isLowStock ? '#d32f2f' : '#8a6a2f',
                      fontWeight: 'bold'
                    }}>
                      {stock}
                    </span>
                    {isOutOfStock ? (
                      <div style={{ fontSize: '0.8em', color: '#d32f2f' }}>
                        Sin stock
                      </div>
                    ) : isLowStock && (
                      <div style={{ fontSize: '0.8em', color: '#d32f2f' }}>
                        Stock bajo
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAvailable ? (
                      <span style={{ color: '#8a6a2f', fontWeight: 'bold' }}>Disponible</span>
                    ) : (
                      <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>No disponible</span>
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
                          Editar
                        </Button>
                        <Button
                          variant="contained"
                          className="delete-button"
                          onClick={() => handleDeleteProduct(product.id)}
                          size="small"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>Sin acciones</span>
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
