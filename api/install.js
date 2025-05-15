/**
 * API 모듈 설치 스크립트
 * 
 * API 디렉토리의 의존성을 설치합니다.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// API 디렉토리 경로
const apiDir = path.join(__dirname);

console.log('📦 API 모듈 의존성 설치 시작...');

try {
  // package.json이 있는지 확인
  if (fs.existsSync(path.join(apiDir, 'package.json'))) {
    // node_modules 디렉토리가 없으면 생성
    if (!fs.existsSync(path.join(apiDir, 'node_modules'))) {
      fs.mkdirSync(path.join(apiDir, 'node_modules'), { recursive: true });
    }
    
    // npm install 실행
    console.log('💻 npm install 실행 중...');
    execSync('npm install', { cwd: apiDir, stdio: 'inherit' });
    
    console.log('✅ API 모듈 의존성 설치 완료!');
  } else {
    console.error('❌ API 디렉토리에 package.json이 없습니다.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ API 모듈 의존성 설치 중 오류 발생:', error);
  process.exit(1);
} 