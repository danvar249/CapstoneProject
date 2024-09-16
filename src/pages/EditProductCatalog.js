import React, { useState } from 'react';
import { TextField, Button, Container, Typography, List, ListItem, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

function EditProductCatalog() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productTag, setProductTag] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const handleAddProduct = () => {
    if (editIndex !== null) {
      const updatedProducts = products.map((product, index) =>
        index === editIndex ? { name: productName, tag: productTag } : product
      );
      setProducts(updatedProducts);
      setEditIndex(null);
    } else {
      setProducts([...products, { name: productName, tag: productTag }]);
    }
    setProductName('');
    setProductTag('');
  };

  const handleEditProduct = (index) => {
    setEditIndex(index);
    setProductName(products[index].name);
    setProductTag(products[index].tag);
  };

  const handleDeleteProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Edit Product Catalog
      </Typography>
      <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
        <TextField
          label="Product Name"
          variant="outlined"
          fullWidth
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          style={{ marginBottom: '20px' }}
          required
        />
        <TextField
          label="Product Tag"
          variant="outlined"
          fullWidth
          value={productTag}
          onChange={(e) => setProductTag(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          {editIndex !== null ? <span>Save Product</span> : <span>Add Product</span>}
        </Button>
      </form>

      <List style={{ marginTop: '20px' }}>
        {products.map((product, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <div style={{ flexGrow: 1 }}>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="textSecondary">Tag: {product.tag}</Typography>
              </div>
              <IconButton onClick={() => handleEditProduct(index)} color="primary">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteProduct(index)} color="secondary">
                <DeleteIcon />
              </IconButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Container>
  );
}

export default EditProductCatalog;
