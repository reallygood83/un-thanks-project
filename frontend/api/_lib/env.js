// 환경 변수 로드
require('dotenv').config();

module.exports = {
  // MongoDB 설정
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://unthanks:unthanks2025@cluster0.mongodb.net/unthanks-db?retryWrites=true&w=majority',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'unthanks-db',
};