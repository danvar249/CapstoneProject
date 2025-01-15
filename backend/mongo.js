const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const DB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoplinkdb.vunvl.mongodb.net/shoplinkDB?retryWrites=true&w=majority`;

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define schemas

const analyticsSchema = new mongoose.Schema({
    tags_sorted_by_engagement: [{
        tag: { type: mongoose.Schema.Types.ObjectId, ref: 'Tags', required: true },
        engagement: { type: Number, required: true },
    }],
}, { timestamps: true });

const broadcastSchema = new mongoose.Schema({
    message: { type: String, required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
    messages: [{
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        tag: { type: mongoose.Schema.Types.ObjectId, ref: 'Tags' },
    }],
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerProfiles', required: true },
}, { timestamps: true });

const customerInterestSchema = new mongoose.Schema({
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tags' }],
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerProfiles', required: true },
}, { timestamps: true });

const customerProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: Number, required: true },
    email: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Tags' },
    stock: { type: Number, default: 0 },
}, { timestamps: true });

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    userPass: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Create models
const Analytics = mongoose.model('analytics', analyticsSchema);
const Broadcasts = mongoose.model('broadcasts', broadcastSchema);
const Conversations = mongoose.model('conversations', conversationSchema);
const CustomerInterests = mongoose.model('customer_interests', customerInterestSchema);
const CustomerProfiles = mongoose.model('customer_profiles', customerProfileSchema);
const Products = mongoose.model('products', productSchema);
const Tags = mongoose.model('tags', tagSchema);
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