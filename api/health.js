// Health check endpoint
module.exports = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
};