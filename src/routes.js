const express = require('express');
const authController = require('./controllers/authController');
const tweetController = require('./controllers/tweetController');
const authMiddleware = require('./middleware/authMiddleware');

const router = express.Router();

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Tweet routes
router.post('/tweets', authMiddleware, tweetController.createTweet);
router.get('/tweets', tweetController.getTweets);
router.delete('/tweets/:id', authMiddleware, tweetController.deleteTweet);

module.exports = router;