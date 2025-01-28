const { LanguageServiceClient } = require('@google-cloud/language');

// Initialize Google Cloud NLP Client
const nlpClient = new LanguageServiceClient();

/**
 * Analyze entities in a given text.
 * @param {string} text - The text to analyze.
 * @returns {Promise<Object>} - Extracted entities with their metadata.
 */
const analyzeEntities = async (text) => {
  if (!text) {
    throw new Error('Text input is required.');
  }

  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Analyze entities using Google NLP API
  const [result] = await nlpClient.analyzeEntities({ document });
  const entities = result.entities.map(entity => ({
    name: entity.name,
    type: entity.type,
    salience: entity.salience,
    metadata: entity.metadata,
  }));

  return entities;
};

/**
 * Categorize a message based on entities.
 * @param {Array} entities - List of entities extracted from the text.
 * @returns {string} - The category of the message.
 */
const categorizeMessage = (entities) => {
  if (entities.some(entity => entity.type === 'CONSUMER_GOOD')) {
    return 'Product Inquiry';
  } else if (entities.some(entity => entity.type === 'LOCATION')) {
    return 'Location Inquiry';
  } else if (entities.some(entity => entity.type === 'PERSON')) {
    return 'Personal Inquiry';
  }
  return 'General Inquiry';
};

// Export the functions
module.exports = { analyzeEntities, categorizeMessage };
