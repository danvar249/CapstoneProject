import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, List, ListItem, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const mockProducts = [
  { id: 1, name: 'Smartphone X', price: '$999', tags: ['smartphone', 'electronics'] },
  { id: 2, name: 'Laptop Pro', price: '$1,299', tags: ['laptop', 'computers'] },
  { id: 3, name: 'Wireless Headphones', price: '$199', tags: ['accessories', 'audio'] },
];

function ProductCatalog() {
  const [products, setProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setNewName(product.name);
    setNewPrice(product.price);
    setNewTags(product.tags.join(', '));
  };

  const handleSaveProduct = () => {
    if (selectedProduct) {
      const updatedProducts = products.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, name: newName, price: newPrice, tags: newTags.split(',').map(tag => tag.trim()) }
          : product
      );
      setProducts(updatedProducts);
      setSelectedProduct(null);
      setNewName('');
      setNewPrice('');
      setNewTags('');
      alert('Product updated successfully!');
    } else {
      const newProduct = {
        id: products.length + 1,
        name: newName,
        price: newPrice,
        tags: newTags.split(',').map(tag => tag.trim()),
      };
      setProducts([...products, newProduct]);
      setNewName('');
      setNewPrice('');
      setNewTags('');
      alert('Product added successfully!');
    }
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
      setNewName('');
      setNewPrice('');
      setNewTags('');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Box sx={{ width: '100%', maxWidth: '600px' }}>
        <Typography variant="h4" gutterBottom>Product Catalog</Typography>
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>Current Products</Typography>
          <List>
            {products.map((product) => (
              <ListItem key={product.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                  <Typography variant="body1"><strong>Name:</strong> {product.name}</Typography>
                  <Typography variant="body1"><strong>Price:</strong> {product.price}</Typography>
                  <Typography variant="body1"><strong>Tags:</strong> {product.tags.join(', ')}</Typography>
                </div>
                <IconButton onClick={() => handleEditProduct(product)} color="primary" sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteProduct(product.id)} color="secondary">
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>{selectedProduct ? 'Edit Product' : 'Add New Product'}</Typography>
          <TextField
            label="Product Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Price"
            fullWidth
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Tags (comma separated)"
            fullWidth
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleSaveProduct}>
            {selectedProduct ? 'Save Changes' : 'Add Product'}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default ProductCatalog;
