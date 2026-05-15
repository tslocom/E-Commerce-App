import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { addToCart } from '../services/store.js';

function ProductCatalog() {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('https://fakestoreapi.com/products/categories').then(res => res.json())
  });

  // fethc products based on category selection
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => {
      const url = selectedCategory 
        ? `https://fakestoreapi.com/products/category/${selectedCategory}`
        : 'https://fakestoreapi.com/products';
      return fetch(url).then(res => res.json());
    }
  });

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
  };

  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Error loading data from FakeStoreAPI</div>;

  return (
    <div>
      <h2>Product Catalog</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="category-select">Filter by Category: </label>
        <select 
          id="category-select"
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <img 
              src={product.image} 
              alt={product.title} 
              onError={handleImageError}
              style={{ width: '100px', height: '100px', objectFit: 'contain' }}/>
            <h3>{product.title}</h3>
            <p><strong>Category:</strong> {product.category}</p>
            <p>{product.description}</p>
            <p><strong>Rating:</strong> {product.rating?.rate} / 5</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <button onClick={() => dispatch(addToCart(product))}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCatalog;