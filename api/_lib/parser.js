// 요청 본문 파서 - 서버리스 함수에서 요청 본문을 올바르게 파싱하기 위한 유틸리티

/**
 * HTTP 요청 본문을 파싱하는 함수
 * Vercel 서버리스 환경과 일반 Node.js 환경 모두 지원
 *
 * @param {Object} req - HTTP 요청 객체
 * @returns {Promise<Object>} 파싱된 JSON 객체
 */
async function parseBody(req) {
  try {
    // 디버깅 정보
    console.log('[Parser] 요청 본문 파싱 시작');
    console.log('[Parser] Body 타입:', typeof req.body);
    console.log('[Parser] Content-Type:', req.headers?.['content-type']);

    // 이미 파싱된 경우 (일반적으로 Vercel 환경에서 자동 파싱)
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      console.log('[Parser] 이미 파싱된 객체 발견');

      // 빈 객체인지 확인
      if (Object.keys(req.body).length === 0) {
        console.log('[Parser] 빈 객체, 추가 파싱 필요할 수 있음');
      } else {
        console.log('[Parser] 유효한 객체 반환');
        return req.body;
      }
    }

    // 문자열인 경우 JSON 파싱 시도
    if (req.body && typeof req.body === 'string') {
      console.log('[Parser] 문자열 본문 파싱 시도');
      try {
        // 빈 문자열 체크
        if (!req.body.trim()) {
          console.log('[Parser] 빈 문자열 반환');
          return {};
        }

        const parsedBody = JSON.parse(req.body);
        console.log('[Parser] 문자열에서 파싱 성공');
        return parsedBody;
      } catch (error) {
        console.error('[Parser] 문자열 JSON 파싱 오류:', error);
        console.log('[Parser] 원본 문자열:', req.body.substr(0, 100) + '...');
      }
    }

    // Buffer인 경우 문자열로 변환 후 JSON 파싱 시도
    if (req.body && Buffer.isBuffer(req.body)) {
      console.log('[Parser] Buffer 본문 파싱 시도');
      try {
        const bodyString = req.body.toString();

        // 빈 문자열 체크
        if (!bodyString.trim()) {
          console.log('[Parser] Buffer에서 변환된 빈 문자열');
          return {};
        }

        const parsedBody = JSON.parse(bodyString);
        console.log('[Parser] Buffer에서 파싱 성공');
        return parsedBody;
      } catch (error) {
        console.error('[Parser] Buffer JSON 파싱 오류:', error);
      }
    }

    // for await...of 방식으로 스트림 읽기 시도
    console.log('[Parser] for-await 방식으로 스트림 읽기 시도');
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      if (chunks.length === 0) {
        console.log('[Parser] 스트림에서 청크 없음');
        return {};
      }

      const rawBody = Buffer.concat(chunks).toString();

      // 빈 body 체크
      if (!rawBody || !rawBody.trim()) {
        console.log('[Parser] 스트림에서 빈 본문');
        return {};
      }

      try {
        const parsedBody = JSON.parse(rawBody);
        console.log('[Parser] 스트림에서 JSON 파싱 성공');
        return parsedBody;
      } catch (jsonError) {
        console.error('[Parser] 스트림 JSON 파싱 오류:', jsonError);
        console.log('[Parser] 스트림 원시 데이터:', rawBody.substr(0, 100) + '...');
      }
    } catch (streamError) {
      console.error('[Parser] 스트림 읽기 오류:', streamError);
    }

    // 이벤트 기반 방식으로 스트림 읽기 시도 (최후의 방법)
    console.log('[Parser] 이벤트 기반 방식으로 스트림 읽기 시도');
    return new Promise((resolve, reject) => {
      const bodyParts = [];

      req.on('data', (chunk) => {
        bodyParts.push(chunk);
      });

      req.on('end', () => {
        try {
          if (bodyParts.length === 0) {
            console.log('[Parser] 이벤트 방식에서 청크 없음');
            return resolve({});
          }

          const bodyString = Buffer.concat(bodyParts).toString();

          if (!bodyString || !bodyString.trim()) {
            console.log('[Parser] 이벤트 방식에서 빈 본문');
            return resolve({});
          }

          try {
            const parsedBody = JSON.parse(bodyString);
            console.log('[Parser] 이벤트 방식에서 JSON 파싱 성공');
            resolve(parsedBody);
          } catch (jsonError) {
            console.error('[Parser] 이벤트 JSON 파싱 오류:', jsonError);
            console.log('[Parser] 이벤트 원시 데이터:', bodyString.substr(0, 100) + '...');
            resolve({}); // 오류 발생해도 빈 객체 반환하여 계속 진행
          }
        } catch (error) {
          console.error('[Parser] 이벤트 처리 오류:', error);
          resolve({}); // 오류 발생해도 빈 객체 반환
        }
      });

      req.on('error', (error) => {
        console.error('[Parser] 요청 이벤트 오류:', error);
        resolve({}); // 오류 발생해도 빈 객체 반환
      });

      // 타임아웃 설정
      setTimeout(() => {
        console.log('[Parser] 타임아웃 발생, 빈 객체 반환');
        resolve({});
      }, 5000);
    });
  } catch (generalError) {
    console.error('[Parser] 파싱 중 일반 오류:', generalError);
    return {}; // 어떤 오류가 발생해도 빈 객체 반환
  }
}

// 간략한 버전 - 오류를 최소화하여 항상 객체 반환
async function parseBodySafe(req) {
  try {
    return await parseBody(req);
  } catch (error) {
    console.error('[Parser] Safe 파싱 오류:', error);
    return {}; // 항상 객체 반환
  }
}

// CommonJS 모듈 내보내기
module.exports = {
  parseBody,
  parseBodySafe
};