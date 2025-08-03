const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the "public" directory
app.use(express.static('public'));

// POST endpoint that accepts a message and returns a response from OpenAI
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  // Validate input
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Jeste\u015b pomocnym asystentem. Odpowiadaj po polsku.' },
        { role: 'user', content: message }
      ]
    };

    // Call the OpenAI Chat Completions API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    // Check if the API call was successful
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errData);
      return res.status(500).json({ error: 'OpenAI API error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
