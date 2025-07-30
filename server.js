require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// --- Fetch User's Actors ---
app.post('/api/actors', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required.' });
  }

  try {
    const response = await axios.get('https://api.apify.com/v2/acts', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Use the tilde (~) format for actorId: username~actorName
    const actors = response.data.data.items.map(({ username, name }) => ({
      id: `${username}~${name}`,
      name
    }));

    res.json(actors);
  } catch (error) {
    console.error('Error fetching actors:', error.response?.data || error.message);
    const status = error.response ? error.response.status : 500;
    res.status(status).json({ error: 'Failed to fetch actors. Please check your API key and try again.' });
  }
});

// --- Get Actor Schema ---
app.post('/api/actor-schema', async (req, res) => {
  const { apiKey, actorId } = req.body;

  if (!apiKey || !actorId) {
    return res.status(400).json({ error: 'API key and Actor ID are required.' });
  }

  try {
    // *** FIXED: Use the /acts/ endpoint, consistent with the other calls ***
    const response = await axios.get(`https://api.apify.com/v2/acts/${actorId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    res.json(response.data.data.inputSchema);
  } catch (error) {
    console.error('Error fetching schema:', error.response?.data || error.message);
    const status = error.response ? error.response.status : 500;
    res.status(status).json({ error: 'Failed to fetch actor schema.' });
  }
});

// --- Run Actor and Return Results ---
app.post('/api/run-actor', async (req, res) => {
  const { apiKey, actorId, inputData } = req.body;

  if (!apiKey || !actorId || !inputData) {
    return res.status(400).json({ error: 'API key, Actor ID, and input data are required.' });
  }

  try {
    // Use correct /acts/ endpoint and tilde-formatted actor ID
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs?waitForFinish=120`,
      inputData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const runDetails = runResponse.data.data;

    if (runDetails.status !== 'SUCCEEDED') {
      return res.status(500).json({
        error: 'Actor execution failed.',
        details: runDetails
      });
    }

    const datasetId = runDetails.defaultDatasetId;
    const resultsResponse = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items`,
      {
        params: { format: 'json' },
        headers: { 'Authorization': `Bearer ${apiKey}` }
      }
    );

    res.json(resultsResponse.data);

  } catch (error)
    {
    const errorDetails = error.response ? error.response.data.error.message : 'An error occurred during actor execution.';
    console.error('Error running actor:', errorDetails);
    res.status(500).json({ error: 'An error occurred during actor execution.', details: errorDetails });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is listening on http://localhost:${PORT}`);
});