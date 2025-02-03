const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const DB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoplinkdb.vunvl.mongodb.net/shoplinkDB?retryWrites=true&w=majority`;

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define schemas
const tagSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true }
}, { timestamps: true });

const analyticsSchema = new mongoose.Schema({
    tags_sorted_by_engagement: [{
        tag: { type: mongoose.Schema.Types.ObjectId, ref: 'Tags', required: true },
        engagement: { type: Number, required: true },
    }],
}, { timestamps: true });

const broadcastSchema = new mongoose.Schema({
    message: { type: String, required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // ✅ User ID
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customer_profiles', required: true },
    messages: [{
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        classifications: [{ name: { type: String }, confidence: { type: Number } }], // ✅ Classification from Google NLP
    }],
}, { timestamps: true });


const customerInterestsSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "customer_profiles", required: true },
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "tags" }],
}, { timestamps: true });

const customerProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'tags' },
    stock: { type: Number, default: 0 },
}, { timestamps: true });


const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    userPass: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Create models
const Tags = mongoose.model('tags', tagSchema);
const Analytics = mongoose.model('analytics', analyticsSchema);
const Broadcasts = mongoose.model('broadcasts', broadcastSchema);
const Conversations = mongoose.model('conversations', conversationSchema);
const CustomerInterests = mongoose.model('customer_interests', customerInterestsSchema);
const CustomerProfiles = mongoose.model('customer_profiles', customerProfileSchema);
const Products = mongoose.model('products', productSchema);
const Users = mongoose.model('users', userSchema);
const modelMapping = {
    tags: Tags,
    users: Users,
    analytics: Analytics,
    broadcasts: Broadcasts,
    conversations: Conversations,
    customer_profiles: CustomerProfiles,
    customer_interests: CustomerInterests,
    products: Products,
};

const getModel = (collection) => modelMapping[collection];
module.exports = {
    Analytics,
    Broadcasts,
    Conversations,
    CustomerInterests,
    CustomerProfiles,
    Products,
    Tags,
    Users,
    getModel
};