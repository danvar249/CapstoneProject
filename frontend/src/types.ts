// Define Message Type with Classifications
export interface Message {
    id: string; // Unique message ID
    from: string; // Sender's identifier (e.g., phone number)
    fromMe: boolean; // Indicates if the message was sent by the user
    body: string; // Message content
    timestamp: string; // Timestamp in ISO format
    classifications: string[]; // List of classifications
}

// Define Chat Type with Messages
export interface Chat {
    id: string; // Unique chat identifier
    name?: string; // Optional chat name
    lastMessage: string | null;
    unreadCount: number;
}

export interface Product {
    _id: string;              // Unique MongoDB ID
    name: string;             // Product Name
    price: string;            // Product Price (stored as string)
    category: {
        _id: string;          // Category ID (ObjectId)
        name: string;         // Category Name
    } | null;                 // Can be null if no category
    stock: number;            // Available stock count
    createdAt: string;        // ISO Timestamp
    updatedAt: string;        // ISO Timestamp
}
