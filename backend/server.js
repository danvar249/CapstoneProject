// Import required modules
const express = require('express');
const session = require("express-session");
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { getModel } = require('./mongo');
const {
  Tags,
  Analytics,
  Broadcasts,
  Conversations,
  CustomerInterests,
  CustomerProfiles,
  Products,
  Users, } = require('./mongo');


// Import WhatsApp-related functionality
const whatsapp = require('./whatsapp');
const { classifyText } = require('./textClassifier');

const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();
const server = http.createServer(app); //http server

// Initialize WebSocket server and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});



app.use(cors());
app.use(express.json());
// ✅ Session Middleware (Stores session using `userId`)
app.use(session({
  secret: "superSecretKey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set `true` for HTTPS
}));

// ✅ Store latest QR code
let latestQrCode = null;

// ✅ WebSockets - Handle Real-time Events
io.on('connection', (socket) => {
  console.log('🔌 New client connected');
  if (!whatsapp.getClient())
    whatsapp.initializeClient();
  whatsapp.attachEvents(socket);
  socket.on("whatsappClientState", async () => {
    const client = await whatsapp.getClient();
    let state = "LOADING";
    try {
      if (client) {
        state = await client?.getState();
        console.log('state: ', state);
      }
    } catch (error) {
      console.log("Error emmitting: ", error)
    }
    socket.emit("WA_ClientState", state || "LOADING");
  })

  socket.on("getQr", async () => {
    const latestQr = whatsapp.getLatestQrCode();
    socket.emit("qrCode", latestQr);
  })
  // Upon connection, send a welcome message
  socket.emit('message', 'Welcome to ShopLINK!');

  // Listen for activity 
  socket.on('activity', (name) => {
    socket.broadcast.emit('activity', name)
  })

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

app.post('/', async (req, res) => {
  res.status(200).send('Welcome to ShopLINK Server!');
});

app.post('/login', async (req, res) => {
  const { userName, userPass } = req.body
  try {
    const user = await Users.findOne({ userName, userPass });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Store session data
    req.session.userId = user._id.toString();

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      userName: user.userName,
      role: user.role,
    });
  } catch (err) {
    console.error('Error during login:', err); // Log the error for debugging
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


app.post('/classify', async (req, res) => {
  const { userId, phoneNumber, messages } = req.body;
  const customer = await CustomerProfiles.findOne({ number: phoneNumber });
  if (!customer) {
    return res.status(401).json({ error: 'Customer not found' });
  }

  const classifiedMsg = []
  const tags = new Set();

  // ✅ Step 1: Collect unique tags from messages
  for (const msg of messages) {
    if (msg.fromMe)
      continue;
    const classification = await classifyText(msg.body)
    if (classification !== 'Uncategorized') {
      classification.categories.forEach(category => {
        tags.add(category.name)
      });
      classifiedMsg.push(
        {
          text: msg.body,
          timestamp: msg.timestamp,
          classifications: classification.categories
        }
      )
    }
  }
  if (tags.size > 0) {
    try {
      // ✅ Step 2: Insert new tags into the `Tags` collection (ignore duplicates)
      const tagDocs = [...tags].map((tag) => ({ name: tag }));
      await Tags.insertMany(tagDocs, { ordered: false }).catch(() => { });

      // ✅ Step 3: Retrieve tag IDs from `Tags` collection
      const tagDocsInDB = await Tags.find({ name: { $in: [...tags] } });
      const tagIds = tagDocsInDB.map((tag) => tag._id);

      // ✅ Step 4: Upsert (Insert or Update) `CustomerInterests`
      await CustomerInterests.updateOne(
        { customer: customer._id }, // Find by customer ID
        { $addToSet: { interests: { $each: tagIds } } }, // Add only new tags
        { upsert: true, new: true } // ✅ Upsert ensures creation if doesn't exist
      );

      console.log("✅ Customer interests updated with new tags.");
    } catch (error) {
      console.error("❌ Error adding tags to customer:", error);
    }
  }
  if (classifiedMsg.length > 0) {
    try {
      const customerId = customer._id;
      await Conversations.updateOne(
        { userId, customerId }, // Find by user & customer ID
        { $push: { messages: { $each: classifiedMsg } } }, // Add new messages
        { upsert: true } // ✅ Create if it doesn’t exist
      );

      console.log("✅ Conversation updated with new messages.");
    } catch (error) {
      console.error("❌ Error updating conversation:", error);
    }
  }
});

// ✅ Endpoint to add a new customer
app.post('/addCustomer', async (req, res) => {
  const { userId, name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "Name and phone number are required." });
  }

  try {

    // ✅ Create new customer
    const customer = new CustomerProfiles({
      name: name,
      number: number,
    });

    await customer.save();
    console.log(`✅ New customer added: ${name} (${number})`);
    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ Error adding customer:", error);
    res.status(500).json({ error: "Failed to add customer." });
  }
});

app.post("/customers/by-tags", async (req, res) => {
  const { tags } = req.body;

  if (!tags || tags.length === 0) {
    return res.json([]);
  }

  try {
    // ✅ Find customers who have these interests and populate customer details
    const customerInterests = await CustomerInterests.find()
      .populate("interests", "name") // ✅ Get tag names
      .populate("customer", "name number"); // ✅ Get customer name & number

    const filteredCustomers = customerInterests
      .filter(entry => entry.interests.some(tag => tags.includes(tag.name))) // ✅ Match tag names
      .map(entry => entry.customer); // ✅ Extract customer details

    res.json(filteredCustomers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers." });
  }
});

app.get('/customer/:number', async (req, res) => {
  const { number } = req.params;
  try {
    const customer = await CustomerProfiles.findOne({ number: number });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    // ✅ Find the customer interests and populate tags
    const customerInterests = await CustomerInterests.findOne({ customer: customer._id })
      .populate("interests", "name"); // ✅ Get only the `name` field from Tags

    // ✅ Format response to include interests
    res.json({
      ...customer.toObject(),
      interests: customerInterests ? customerInterests.interests.map(tag => tag.name) : [],
    });

  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


app.get('/:collection', async (req, res) => {
  const { collection } = req.params;
  const filters = req.query; // Capture query parameters as filters
  const Model = getModel(collection);

  if (!Model) {
    return res.status(404).json({ error: `Collection '${collection}' not found.` });
  }

  try {
    const data = await Model.find(filters); // Apply filters to the query
    res.json(data);
  } catch (err) {
    console.error(`Error fetching data from '${collection}':`, err);
    res.status(500).json({ error: `Error fetching data from '${collection}'.` });
  }
});

// WhatsApp-specific endpoints

// Endpoint to check connection status
app.get('/whatsapp/state', async (req, res) => {
  try {
    const client = whatsapp.getClient();
    if (client) {
      const state = await client.getState();
      res.status(200).json({
        clientState: state,
      });
    }
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ error: 'Failed to check connection status.' });
  }
});


app.get('/whatsapp/chats', async (req, res) => {
  try {
    const chats = await whatsapp.getChats();
    res.status(200).json(chats);

  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats.' });
  }
});

app.get('/whatsapp/chats/:chatId/messages', async (req, res) => {
  const userId = req.headers.authorization?.split("Bearer ")[1];
  const { chatId } = req.params;
  const { limit } = req.query;
  const messageLimit = parseInt(limit, 10) || 50;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter.' });
  }
  try {
    const messages = await whatsapp.getMessagesForChat(chatId, userId, messageLimit);
    res.status(200).json(messages);
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    res.status(500).json({ error: `Failed to fetch messages for chat ${chatId}.` });
  }
});


// Endpoint to send a message
app.post('/whatsapp/send-message', async (req, res) => {
  const { phoneNumber, message } = req.body;
  try {
    await whatsapp.sendMessage(phoneNumber, message);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});
app.post("/whatsapp/send-broadcast", async (req, res) => {
  const { customers, message } = req.body;

  if (!customers || customers.length === 0 || !message) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }

  try {
    // ✅ Send message to each customer
    for (const c of customers) {
      console.log(c);
      await whatsapp.sendMessage(c.number, message);

    }
    const broad = new Broadcasts({ message: message, recipients: { $each: customers.map((c) => c._id) } })
    res.status(200).json({ success: true, message: "Broadcast sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send broadcast." });
  }
});
app.post("/add-product", async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = new Products({ name, price, category, stock });
    await newProduct.save();

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Endpoint to fetch all contacts
app.get('/whatsapp/contacts', async (req, res) => {
  try {
    const contacts = await whatsapp.getAllContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Failed to log out" });
    res.json({ message: "Logged out successfully" });
  });
});


// Endpoint to logout from WhatsApp
app.post('/whatsapp/logout', async (req, res) => {
  await whatsapp.logoutClient(req, res);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


