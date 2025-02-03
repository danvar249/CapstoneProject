import React, { useEffect, useState } from "react";
import {
    Typography,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    IconButton,
    Box,
    Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "../utils/axios";
import { Product } from "../types"; // ✅ Import Product Type

const ProductCatalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newProductData, setNewProductData] = useState({ name: "", price: "", category: "", stock: 0 });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get<Product[]>("/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleAddProduct = async () => {
        if (!newProductData.name || !newProductData.price || !newProductData.category) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const response = await axios.post<Product>("/add-product", newProductData);
            setProducts([...products, response.data]);
            setNewProductData({ name: "", price: "", category: "", stock: 0 });
            alert("Product added successfully!");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product");
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProductData({
            name: product.name,
            price: product.price,
            category: product.category?._id || "",
            stock: product.stock,
        });
    };

    const handleSaveEdit = async () => {
        if (!editingProduct) return;

        try {
            const response = await axios.put<Product>(`/edit-product/${editingProduct._id}`, newProductData);
            setProducts(products.map((p) => (p._id === editingProduct._id ? response.data : p)));
            setEditingProduct(null);
            alert("Product updated successfully!");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await axios.delete(`/delete-product/${id}`);
            setProducts(products.filter((product) => product._id !== id));
            alert("Product deleted successfully!");
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Grid container spacing={2} sx={{ width: "100%", maxWidth: "1200px" }}>
                {/* ✅ Scrollable Products List */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ padding: 3, height: "500px", overflowY: "auto" }}>
                        <Typography variant="h6" gutterBottom>
                            Current Products
                        </Typography>
                        <List>
                            {products.map((product) => (
                                <ListItem
                                    key={product._id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "10px",
                                        borderBottom: "1px solid #ddd",
                                    }}
                                >
                                    {editingProduct?._id === product._id ? (
                                        <>
                                            <TextField
                                                value={newProductData.name}
                                                onChange={(e) =>
                                                    setNewProductData({ ...newProductData, name: e.target.value })
                                                }
                                                sx={{ flexGrow: 1, marginRight: 2 }}
                                            />
                                            <IconButton onClick={handleSaveEdit} color="primary">
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton onClick={() => setEditingProduct(null)} color="secondary">
                                                <CancelIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body1">
                                                    <strong>Name:</strong> {product.name}
                                                </Typography>
                                                <Typography variant="body1">
                                                    <strong>Price:</strong> {product.price}
                                                </Typography>
                                                <Typography variant="body1">
                                                    <strong>Category:</strong>{" "}
                                                    {product.category?.name || "N/A"}
                                                </Typography>
                                                <Typography variant="body1">
                                                    <strong>Stock:</strong> {product.stock}
                                                </Typography>
                                            </Box>
                                            <IconButton onClick={() => handleEditProduct(product)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteProduct(product._id)} color="secondary">
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* ✅ Product Form */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Add New Product
                        </Typography>
                        <TextField label="Name" fullWidth value={newProductData.name} onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })} sx={{ marginBottom: 2 }} />
                        <TextField label="Price" fullWidth value={newProductData.price} onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })} sx={{ marginBottom: 2 }} />
                        <TextField label="Category" fullWidth value={newProductData.category} onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })} sx={{ marginBottom: 2 }} />
                        <Button variant="contained" color="primary" onClick={handleAddProduct}>Add Product</Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductCatalog;
