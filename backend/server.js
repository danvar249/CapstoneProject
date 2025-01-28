// Import required modules
const express = require('express');
const cors = require('cors');
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
const {
  getAllContacts,
  initializeClient,
  getClientState,
  getChats,
  getMessagesForChat,
  getEncodedQrCode,
} = require('./whatsapp');

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

app.get('/customer/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await CustomerProfiles.findById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// app.get('/conversations', async (req, res) => {
//   try {
//     const conversations = await Conversations.aggregate([
//       {
//         $lookup: {
//           from: 'customer_profiles',  // Collection to join
//           localField: 'customer',    // Field in conversations collection
//           foreignField: '_id',       // Field in customer_profiles collection
//           as: 'customerDetails'      // Alias for the joined data
//         }
//       },
//       {
//         $unwind: '$customerDetails' // Flatten the customerDetails array
//       },
//       {
//         $lookup: {
//           from: 'tags',              // Collection to join
//           localField: 'messages.tags', // Field in messages array
//           foreignField: '_id',       // Field in tags collection
//           as: 'resolvedTags'         // Alias for the resolved tags
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           messages: 1,
//           'customerDetails.name': 1,
//           'customerDetails.contact': 1,
//           resolvedTags: 1            // Include resolved tag names
//         }
//       }
//     ]);

// Map resolved tag names into messages
//     const enrichedConversations = conversations.map(conversation => ({
//       ...conversation,
//       tags: conversation.resolvedTags.map(tag => tag.name), // Extract tag names
//     }));

//     res.status(200).json(enrichedConversations);
//   } catch (err) {
//     console.error('Error fetching conversations with tags:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


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
    const state = await getClientState();
    res.status(200).json({
      clientState: state,
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ error: 'Failed to check connection status.' });
  }
});

// Endpoint to fetch QR code for WhatsApp login
app.get('/whatsapp/qr', async (req, res) => {
  try {
    const encodedQr = await getEncodedQrCode();
    if (encodedQr) {
      res.status(200).json({ qr: encodedQr });
    } else {
      res.status(404).json({ error: 'QR code not available.' });
    }
  } catch (error) {
    console.error('Error fetching encoded QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});


app.get('/whatsapp/chats', async (req, res) => {
  try {
    const chats = await getChats();
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats.' });
  }
});

app.get('/whatsapp/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const { limit } = req.query;
  const messageLimit = parseInt(limit, 10) || 50;

  try {
    const messages = await getMessagesForChat(chatId, messageLimit);
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
    await client.sendMessage(`${phoneNumber}@c.us`, message);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// Endpoint to fetch all contacts
app.get('/whatsapp/contacts', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});