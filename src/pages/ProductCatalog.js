import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, List, ListItem, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const initialProducts = [
  { id: 1, name: 'Smartphone X', category: 'smartphone', price: 999 },
  { id: 2, name: 'Laptop Y', category: 'laptop', price: 1299 },
  { id: 3, name: 'Wireless Headphones Z', category: 'accessories', price: 199 },
];

function ProductCatalog() {
  const [products, setProducts] = useState(initialProducts);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '' });
  const [editProduct, setEditProduct] = useState(null);

  const handleAddProduct = () => {
    if (editProduct) {
      setProducts(products.map((product) => (product.id === editProduct.id ? { ...editProduct } : product)));
      setEditProduct(null);
    } else {
      const newProductObj = {
        id: products.length + 1,
        ...newProduct,
        price: parseFloat(newProduct.price),
      };
      setProducts([...products, newProductObj]);
    }
    setNewProduct({ name: '', category: '', price: '' });
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setNewProduct(product);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Product Catalog</Typography>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>{editProduct ? 'Edit Product' : 'Add New Product'}</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Product Name"
            fullWidth
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Category"
            fullWidth
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Price"
            fullWidth
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            sx={{ flex: 1 }}
          />
        </Box>
        <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleAddProduct}>
          {editProduct ? 'Update Product' : 'Add Product'}
        </Button>
      </Paper>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>Product List</Typography>
        <List>
          {products.map((product) => (
            <ListItem key={product.id}>
              <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                <Typography variant="body1">{product.name} - {product.category} - ${product.price.toFixed(2)}</Typography>
                <Box>
                  <IconButton onClick={() => handleEditProduct(product)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
}

export default ProductCatalog;
