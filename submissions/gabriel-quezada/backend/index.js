const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store
const db = {
  accounts: [],
  products: [],
  salesTeams: [],
  salesPipeline: []
};

// Data loading function
const loadCSV = (filename, arrayReference) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'data', filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return resolve();
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => arrayReference.push(data))
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Initialize server
const startServer = async () => {
  try {
    console.log('Loading CSV data...');
    await Promise.all([
      loadCSV('accounts.csv', db.accounts),
      loadCSV('products.csv', db.products),
      loadCSV('sales_teams.csv', db.salesTeams),
      loadCSV('sales_pipeline.csv', db.salesPipeline)
    ]);
    console.log('CSV data loaded successfully!');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    dataStats: {
      accountsCount: db.accounts.length,
      productsCount: db.products.length,
      salesTeamsCount: db.salesTeams.length,
      salesPipelineCount: db.salesPipeline.length
    }
  });
});

startServer();
