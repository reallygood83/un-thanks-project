// 가장 간단한 테스트 API
module.exports = async (req, res) => {
  res.status(200).json({ 
    message: 'Simple test works',
    time: new Date().toISOString() 
  });
};