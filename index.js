//servidor
const express = require('express');
const app = express();
const axios = require('axios');
const querystring = require('querystring');
const port = process.env.PORT || 5355;
require('dotenv').config();

app.listen(port, () => console.log(`Escutando na porta ${port}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb'}));

app.post('/public', async (request, response) => {
    console.log('I got a request!');
    const data = request.body;
    console.log(data);
    //TRADUTOR API
    // Replace [yourAuthKey] with your actual DeepL API authorization key
    const deepLAuthKey = process.env.API_KEY;

    // User Inputs
    const sourceLang = 'PT';
    const targetLang = 'EN-US';

    // Function to translate the text
    async function translateText(text, sourceLang, targetLang) {
        try {
            // Prepare the request data
            const requestData = querystring.stringify({
                text: text,
                source_lang: sourceLang,
                target_lang: targetLang,
                context: "civil engineering drawing",
                preserve_formatting: true,
                tag_handling: "html"
            });

            // Make a POST request to the DeepL API
            const response = await axios.post(
                'https://api-free.deepl.com/v2/translate',
                requestData,
                {
                    headers: {
                        Authorization: `DeepL-Auth-Key ${deepLAuthKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            // Extract the translated text from the API response
            const translatedText = response.data.translations;
            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    try {
        // Run the translation process
        const translatedText = await translateText(data, sourceLang, targetLang);
        response.json({
            status: 'sucesso',
            texto: translatedText
        });
    } catch (error) {
        // Handle translation error
        console.error('Translation error:', error);
        response.status(500).json({
            status: 'erro',
            mensagem: 'Erro na tradução',
            erro: error.message
        });
    }
});