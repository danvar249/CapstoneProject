// Import necessary modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB Atlas connection using environment variables
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoplinkdb.vunvl.mongodb.net/?retryWrites=true&w=majority`;

// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB using Mongoose!"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Define a sample Mongoose schema and model
const DataSchema = new mongoose.Schema({
  name: String,
  value: Number,
});
const DataModel = mongoose.model("Data", DataSchema);

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // To allow cross-origin requests
app.use(express.json()); // To parse incoming JSON requests

// API endpoint to fetch data
app.get("/api/data", async (req, res) => {
  try {
    const data = await DataModel.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API endpoint to add data
app.post("/api/data", async (req, res) => {
  try {
    const { name, value } = req.body;
    const newData = new DataModel({ name, value });
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
  }
});

// Serve the frontend
app.get("/", (req, res) => {
  res.send("Welcome to shoplink server");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
