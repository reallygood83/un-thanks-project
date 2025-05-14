// Simple health check endpoint
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const time = new Date().toISOString();
  
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    endpoint: req.url,
    method: req.method,
    time: time,
    env: process.env.NODE_ENV || 'unknown'
  });
};