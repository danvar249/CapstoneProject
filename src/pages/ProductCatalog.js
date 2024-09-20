import React, { useState } from 'react';
import { Typography, Paper, TextField, Button, List, ListItem, IconButton, Box, Tabs, Tab } from '@mui/material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const mockProducts = [
  { id: 1, name: 'Smartphone X', price: '$999', tags: ['smartphone', 'electronics'] },
  { id: 2, name: 'Laptop Pro', price: '$1,299', tags: ['laptop', 'computers'] },
  { id: 3, name: 'Wireless Headphones', price: '$199', tags: ['accessories', 'audio'] },
];

const mockTags = ['smartphone', 'electronics', 'laptop', 'computers', 'accessories', 'audio'];

function ProductCatalog() {
  const [products, setProducts] = useState(mockProducts);
  const [tags, setTags] = useState(mockTags);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState(-1); // Track the index of the tag being edited
  const [editedTagName, setEditedTagName] = useState(''); // Hold the edited tag name
  const [tabIndex, setTabIndex] = useState(0); // State for managing tabs

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

  const handleAddTag = () => {
    if (newTagName.trim() && !tags.includes(newTagName.trim())) {
      setTags([...tags, newTagName.trim()]);
      setNewTagName('');
      alert('Tag added successfully!');
    } else {
      alert('Tag already exists or is empty');
    }
  };

  const handleDeleteTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
    alert('Tag deleted successfully!');
  };

  const handleEditTag = (index) => {
    setEditingTagIndex(index);
    setEditedTagName(tags[index]);
  };

  const handleSaveTag = () => {
    if (editingTagIndex !== -1 && editedTagName.trim()) {
      const updatedTags = tags.map((tag, index) =>
        index === editingTagIndex ? editedTagName.trim() : tag
      );
      setTags(updatedTags);
      setEditingTagIndex(-1);
      setEditedTagName('');
      alert('Tag updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditingTagIndex(-1);
    setEditedTagName('');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Box sx={{ width: '100%', maxWidth: '600px' }}>
        <Typography variant="h4" gutterBottom>Product Catalog</Typography>
        
        {/* Tabs for switching between Products and Manage Tags */}
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
          <Tab label="Products" />
          <Tab label="Manage Tags" />
        </Tabs>

        {tabIndex === 0 && (
          <Box>
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
        )}

        {tabIndex === 1 && (
          <Box>
            <Paper sx={{ padding: 3, marginBottom: 3 }}>
              <Typography variant="h6" gutterBottom>Manage Tags</Typography>
              <List>
                {tags.map((tag, index) => (
                  <ListItem key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    {editingTagIndex === index ? (
                      <>
                        <TextField
                          value={editedTagName}
                          onChange={(e) => setEditedTagName(e.target.value)}
                          sx={{ flexGrow: 1, marginRight: 2 }}
                        />
                        <IconButton onClick={handleSaveTag} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancelEdit} color="secondary">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" style={{ flexGrow: 1 }}>{tag}</Typography>
                        <IconButton onClick={() => handleEditTag(index)} color="primary" sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTag(tag)} color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Tag</Typography>
              <TextField
                label="Tag Name"
                fullWidth
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button variant="contained" color="primary" onClick={handleAddTag}>
                Add Tag
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ProductCatalog;
