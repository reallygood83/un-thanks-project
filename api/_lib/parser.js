// 요청 본문 파서 - 서버리스 함수에서 요청 본문을 올바르게 파싱하기 위한 유틸리티

// 요청 본문 파싱 함수
export async function parseBody(req) {
  if (req.body) {
    // 이미 파싱된 경우 (일반적으로 Vercel 환경에서 자동 파싱)
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    
    // 문자열인 경우 JSON 파싱 시도
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch (error) {
        console.error('Body parsing error:', error);
        throw new Error('Invalid JSON body');
      }
    }
    
    // Buffer인 경우 문자열로 변환 후 JSON 파싱 시도
    if (Buffer.isBuffer(req.body)) {
      try {
        const bodyString = req.body.toString();
        return JSON.parse(bodyString);
      } catch (error) {
        console.error('Buffer body parsing error:', error);
        throw new Error('Invalid JSON body');
      }
    }
  }
  
  // 본문이 없거나 스트림인 경우 수동으로 읽기
  return new Promise((resolve, reject) => {
    const bodyParts = [];
    
    req.on('data', (chunk) => {
      bodyParts.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const bodyString = Buffer.concat(bodyParts).toString();
        
        if (!bodyString) {
          return resolve({});
        }
        
        const body = JSON.parse(bodyString);
        resolve(body);
      } catch (error) {
        console.error('Request body parsing error:', error);
        reject(new Error('Invalid JSON body'));
      }
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
  });
}