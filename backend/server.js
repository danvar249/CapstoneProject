// Import required modules
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
// const QRCode = require('qrcode');
const path = require('path');
const { getModel } = require('./mongo');
const { Analytics,
  Broadcasts,
  Conversations,
  CustomerInterests,
  CustomerProfiles,
  Products,
  Tags,
  Users, } = require('./mongo');


// Import WhatsApp-related functionality
// const whatsapp = require('./whatsapp');
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

// Initialize WhatsApp client and pass `io` for WebSocket communication
// whatsapp.initializeClient(io);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))


// ✅ Store latest QR code
// let latestQrCode = null;

// // ✅ Subscribe to WhatsApp QR Code Events and Emit to Clients
// whatsapp.getClient().on("qr", async (qr) => {
//   console.log("📡 New QR Code received from WhatsApp");
//   try {
//     latestQrCode = await QRCode.toDataURL(qr); // ✅ Convert to Data URI
//     io.emit("qrCode", latestQrCode);
//   } catch (error) {
//     console.error("❌ Error generating QR code:", error);
//   }
// });

// ✅ Subscribe to WhatsApp State Changes and Emit to Clients
// whatsapp.getClient().on("change_state", (newState) => {
//   console.log(`📢 WhatsApp State Changed: ${newState}`);
//   io.emit("WA_ClientState", { clientState: newState });
// });

// whatsapp.getClient().on("message", (message) => {
//   console.log(`Message received from ${message.from}: ${message.body}`);
//   io.emit('incomingMessage', message);
// });

// ✅ WebSockets - Handle Real-time Events
io.on('connection', (socket) => {
  console.log('🔌 New client connected');

  // // ✅ Send latest QR **only if requested**
  // socket.on("requestLatestQr", () => {
  //   if (latestQrCode) {
  //     console.log("📡 Sending stored QR code to client");
  //     socket.emit("qrCode", latestQrCode);
  //   }
  // });

  // socket.on("whatsappClientState", async () => {
  //   const state = await whatsapp.getClient().getState();
  //   console.log(state);
  //   socket.emit("WA_ClientState", { clientState: state });
  // })

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
    const user = await Users.findOne({ userName });
    if (!user || user.userPass !== userPass) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

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
// ✅ Endpoint to add a new customer
app.post('/addCustomer', async (req, res) => {
  const { userId, name, number, messages } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter.' });
  }

  if (!name || !number) {
    return res.status(400).json({ error: "Name and phone number are required." });
  }

  try {

    // ✅ Create new customer
    const customer = new CustomerProfiles({
      name: name,
      number: number,
    });

    const result = await customer.save();
    console.log(`✅ New customer added: ${name} (${number})`);

    const classifiedMsg = []

    for(const msg of messages){
      if(msg.fromMe)
        continue;
      const classification = await classifyText(msg.body)
      if(classification !== 'Uncategorized'){
        classifiedMsg.push(
          {
            text: msg.body,
            timestamp: msg.timestamp,
            classifications: classification.categories
          }
        )
      }
    }
    const conversation = {
      userId: userId,
      customerId: result._id,
      messages: classifiedMsg
    };
    // add customer conversation to db
    conv = new Conversations(conversation)

    await conv.save();
    console.log(`✅ New conversation added: ${name} (${number})`);


    res.status(200).json(customer);
  } catch (error) {
    console.error("❌ Error adding customer:", error);
    res.status(500).json({ error: "Failed to add customer." });
  }
});

app.get('/customer/:number', async (req, res) => {
  const { number } = req.params;
  try {
    const customer = await CustomerProfiles.findOne({ number: number });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
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
// app.get('/whatsapp/state', async (req, res) => {
//   try {
//     const state = await whatsapp.getClient().getState();
//     res.status(200).json({
//       clientState: state,
//     });
//   } catch (error) {
//     console.error('Error checking connection status:', error);
//     res.status(500).json({ error: 'Failed to check connection status.' });
//   }
// });


// app.get('/whatsapp/chats', async (req, res) => {
//   try {
//     const chats = await whatsapp.getChats();
//     res.status(200).json(chats);

//   } catch (error) {
//     console.error('Error fetching chats:', error);
//     res.status(500).json({ error: 'Failed to fetch chats.' });
//   }
// });

// app.get('/whatsapp/chats/:chatId/messages', async (req, res) => {
//   const userId = req.headers.authorization?.split("Bearer ")[1];
//   const { chatId } = req.params;
//   const { limit } = req.query;
//   const messageLimit = parseInt(limit, 10) || 50;

//   if (!userId) {
//     return res.status(400).json({ error: 'Missing userId parameter.' });
//   }
//   try {
//     const messages = await whatsapp.getMessagesForChat(chatId, userId, messageLimit);
//     res.status(200).json(messages);
//   } catch (error) {
//     console.error(`Error fetching messages for chat ${chatId}:`, error);
//     res.status(500).json({ error: `Failed to fetch messages for chat ${chatId}.` });
//   }
// });


// Endpoint to send a message
// app.post('/whatsapp/send-message', async (req, res) => {
//   const { phoneNumber, message } = req.body;
//   try {
//     await whatsapp.sendMessage(`${phoneNumber}@c.us`, message);
//     res.status(200).json({ success: true, message: 'Message sent successfully!' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send message.' });
//   }
// });

// // Endpoint to fetch all contacts
// app.get('/whatsapp/contacts', async (req, res) => {
//   try {
//     const contacts = await whatsapp.getAllContacts();
//     res.status(200).json(contacts);
//   } catch (error) {
//     console.error('Error fetching contacts:', error);
//     res.status(500).json({ error: 'Failed to fetch contacts.' });
//   }
// });

// // Endpoint to logout from WhatsApp
// app.post('/whatsapp/logout', async (req, res) => {
//   await whatsapp.logoutClient(req, res);
// });

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
