const { LanguageServiceClient } = require('@google-cloud/language');

require('dotenv').config();

const client = new LanguageServiceClient();

const classifyText = async (text) => {
    try {
        console.log('🔍 Classifying text:', text);
        const document = { content: text, type: 'PLAIN_TEXT' };
        const classificationModelOptions = {
            v2Model: {
                contentCategoriesVersion: 'V2',
            },
        };

        const [classification] = await client.classifyText({ document, classificationModelOptions });
        // console.log(`Catagories for text ${text}:`)
        // classification.categories.forEach(category => {
        //     console.log(`Name: ${category.name}, Confidence: ${category.confidence}`);
        // });

        return classification;
    } catch (error) {
        console.error('❌ Error classifying text:', error);
        return 'Uncategorized';
    }
};

module.exports = { classifyText };
