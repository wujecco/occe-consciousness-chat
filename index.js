const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

// Initialize Express app 
const app = express();
// Use provided PORT from environment or fallback to 3000
const port = process.env.PORT || 3000;
// Read the OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
    // Call the OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Jeste\u015b pomocnym asystentem. Odpowiadaj po polsku.' },
          { role: 'user', content: message }
        ]
      })
    });

    // Check if the API call was successful
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errData);
      return res.status(500).json({ error: 'OpenAI API error' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '';
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
