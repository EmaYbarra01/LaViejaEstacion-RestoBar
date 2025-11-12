import './ProductForm.css';

const ProductForm = (props) => {
    const { form, handleChange, handleSubmit, showAddButton, handleEditSubmit } = props;
    return (
        <form className='formularioProducto' onSubmit={showAddButton ? handleSubmit : handleEditSubmit}>
            <input name='name' value={form.name} onChange={handleChange} placeholder='nombre'></input>
            <input name='code'value={form.code} onChange={handleChange} placeholder='codigo'></input>
            <input name='price' value={form.price} onChange={handleChange} placeholder='precio'></input>
            <input name='imgUrl' value={form.imgUrl} onChange={handleChange} placeholder='url-imagen'></input>
            {showAddButton?<button type='submit'  >Agregar producto</button>: <button type='submit'>Editar producto</button> }
        </form>
    );
};

export default ProductForm;