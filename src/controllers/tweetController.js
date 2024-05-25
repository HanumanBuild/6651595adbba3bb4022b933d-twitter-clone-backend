const Tweet = require('../models/Tweet');

exports.createTweet = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const newTweet = new Tweet({ content, author: userId });
    await newTweet.save();

    res.status(201).json(newTweet);
  } catch (err) {
    res.status(500).json({ message: 'Error creating tweet', error: err });
  }
};

exports.getTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find().populate('author', 'username').sort({ createdAt: -1 });
    res.status(200).json(tweets);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tweets', error: err });
  }
};

exports.deleteTweet = async (req, res) => {
  const tweetId = req.params.id;
  const userId = req.user.userId;

  try {
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    if (tweet.author.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await tweet.remove();
    res.status(200).json({ message: 'Tweet deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting tweet', error: err });
  }
};