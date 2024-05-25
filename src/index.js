const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { WebSocketServer } = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('./middleware/authMiddleware');
const Tweet = require('./models/Tweet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routes
const routes = require('./routes');
app.use('/api', routes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

/* WebSocket server setup start */
const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

let clients = {};

wsServer.on('connection', (connection) => {
  const userId = uuidv4();
  clients[userId] = connection;
  console.log(`${userId} connected.`);

  connection.on('close', () => {
    delete clients[userId];
    console.log(`${userId} disconnected.`);
  });
});

function broadcastMessage(json) {
  const data = JSON.stringify(json);
  for (let userId in clients) {
    let client = clients[userId];
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

app.post('/api/tweets', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const newTweet = new Tweet({ content, author: userId });
    await newTweet.save();
    broadcastMessage({ type: 'new_tweet', tweet: newTweet });
    res.status(201).json(newTweet);
  } catch (err) {
    res.status(500).json({ message: 'Error creating tweet', error: err });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
/* WebSocket server setup end */