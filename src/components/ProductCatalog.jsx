import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart } from '../services/store.js';
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../services/productService';

const emptyProduct = {
  title: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  description: '',
};

function ProductCatalog() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState('');
  const [formData, setFormData] = useState(emptyProduct);

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
    [products],
  );

  const visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProductId) {
        return updateProduct(editingProductId, payload);
      }

      return createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProductId('');
      setFormData(emptyProduct);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveMutation.mutateAsync(formData);
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setFormData({
      title: product.title ?? '',
      category: product.category ?? '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      image: product.image ?? '',
      description: product.description ?? '',
    });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product from Firestore?')) {
      return;
    }

    await deleteMutation.mutateAsync(productId);
  };

  const handleCancel = () => {
    setEditingProductId('');
    setFormData(emptyProduct);
  };

  const handleImageError = (event) => {
    event.currentTarget.src = 'https://via.placeholder.com/160?text=No+Image';
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Firestore catalog</p>
          <h2>Products</h2>
        </div>
        <p className="panel-meta">Create, edit, and delete catalog records.</p>
      </div>

      <div className="toolbar">
        <label className="field field-inline">
          <span>Search</span>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products" />
        </label>

        <label className="field field-inline">
          <span>Category</span>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form className="stack-form product-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Title</span>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Category</span>
            <input name="category" value={formData.category} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Price</span>
            <input name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Stock</span>
            <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
          </label>
        </div>

        <label className="field">
          <span>Image URL</span>
          <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} />
        </label>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : editingProductId ? 'Update product' : 'Create product'}
          </button>
          {editingProductId && (
            <button type="button" className="ghost-button" onClick={handleCancel}>
              Cancel edit
            </button>
          )}
        </div>

        {saveMutation.isError && <div className="notice error">{saveMutation.error?.message ?? 'Unable to save product.'}</div>}
      </form>

      {productsQuery.isLoading ? (
        <p className="muted-copy">Loading products from Firestore...</p>
      ) : productsQuery.isError ? (
        <p className="notice error">Unable to load products.</p>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <img src={product.image || 'https://via.placeholder.com/320x220?text=Product'} alt={product.title} onError={handleImageError} />
              <div className="product-card-body">
                <div className="product-card-header">
                  <div>
                    <p className="label">{product.category || 'Uncategorized'}</p>
                    <h3>{product.title}</h3>
                  </div>
                  <strong>${Number(product.price ?? 0).toFixed(2)}</strong>
                </div>
                <p className="muted-copy clamp-text">{product.description}</p>
                <div className="product-actions">
                  <button type="button" className="primary-button compact" onClick={() => dispatch(addToCart(product))}>
                    Add to cart
                  </button>
                  <button type="button" className="ghost-button compact" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                  <button type="button" className="danger-button compact" onClick={() => handleDelete(product.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductCatalog;