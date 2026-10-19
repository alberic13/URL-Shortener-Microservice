require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Register API routes
app.use('/api', apiRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
}

module.exports = app;
