// UN 감사 편지 API - 서버리스 함수 MongoDB 연동 버전
const { connectToDatabase, sampleCountries, sampleLetters, validateLetterData } = require('./_lib/mongodb');
const letterService = require('./services/letterService');
const countryService = require('./services/countryService');

// API 핸들러 함수
module.exports = async (req, res) => {
  // 디버깅: 요청 전체 로깅
  console.log(`[API] ${req.method} ${req.url}`);
  console.log('[API] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[API] Host:', req.headers.host);
  console.log('[API] Origin:', req.headers.origin);
  
  // CORS 헤더 설정 - 모든 출처 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS 요청 (프리플라이트) 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Vercel 서버리스 함수 처리 확인
  console.log('[API] Vercel 서버리스 함수 진입');

  // URL 파라미터 추출
  let url;
  try {
    url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
    console.log('[API] 파싱된 URL:', url.toString());
    console.log('[API] 경로명:', url.pathname);
    console.log('[API] 쿼리문자열:', url.search);
  } catch (error) {
    console.error('[API] URL 파싱 오류:', error);
    url = { searchParams: { get: () => null }, pathname: req.url || '/' };
  }
  
  // 액션 파라미터 추출 (URL에서 또는 경로에서)
  let action = url.searchParams?.get('action');
  
  // URL 경로에서도 액션 추출 시도 (예: /api/submitLetter)
  if (!action && url.pathname) {
    const pathMatch = url.pathname.match(/\/api\/([^/?]+)/);
    if (pathMatch && pathMatch[1]) {
      action = pathMatch[1];
      console.log('[API] 경로에서 액션 추출:', action);
    }
  }
  
  // HTTP 메서드 기반으로 액션 유추
  if (!action) {
    if (req.method === 'POST') {
      action = 'submitLetter';
      console.log('[API] 메서드에서 액션 유추:', action);
    } else if (req.method === 'GET') {
      action = 'getLetters';
      console.log('[API] 메서드에서 액션 유추:', action);
    }
  }
  
  console.log('[API] 최종 액션 파라미터:', action);
  
  // API 라우팅 - action 파라미터 기반
  try {
    // 편지 목록 조회 (getLetters)
    if (action === 'getLetters') {
      const countryId = url.searchParams?.get('countryId');
      const page = parseInt(url.searchParams?.get('page')) || 1;
      const limit = parseInt(url.searchParams?.get('limit')) || 50;
      
      console.log('[API] 편지 목록 조회:', { countryId, page, limit });
      
      // 서비스 호출 (MongoDB 연동)
      const result = await letterService.getLetters(countryId, page, limit);
      
      return res.status(200).json(result);
    }
    
    // 편지 제출 (submitLetter)
    if ((action === 'submitLetter' || action === 'submitletter') && (req.method === 'POST')) {
      console.log('[API] 편지 제출 처리 시작');
      
      // 요청 본문 파싱
      let body = {};
      
      if (req.body) {
        // 객체인 경우 그대로 사용
        if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
          body = req.body;
        }
        // 문자열인 경우 JSON 파싱
        else if (typeof req.body === 'string') {
          try {
            body = JSON.parse(req.body);
          } catch (e) {
            console.error('[API] 문자열 파싱 오류:', e);
          }
        }
        // Buffer인 경우 문자열로 변환 후 JSON 파싱
        else if (Buffer.isBuffer(req.body)) {
          try {
            const bodyString = req.body.toString();
            body = JSON.parse(bodyString);
          } catch (e) {
            console.error('[API] Buffer 파싱 오류:', e);
          }
        }
      }
      
      // 본문이 파싱되지 않았으면 직접 읽기
      if (Object.keys(body).length === 0) {
        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          
          if (chunks.length > 0) {
            const rawBody = Buffer.concat(chunks).toString();
            try {
              body = JSON.parse(rawBody);
            } catch (e) {
              console.error('[API] 요청 본문 직접 파싱 오류:', e);
              console.log('[API] 원시 본문:', rawBody);
              
              return res.status(400).json({
                success: false,
                message: '요청 본문을 파싱할 수 없습니다',
                error: e.message
              });
            }
          }
        } catch (streamError) {
          console.error('[API] 스트림 읽기 오류:', streamError);
          
          return res.status(400).json({
            success: false,
            message: '요청 본문을 읽을 수 없습니다',
            error: streamError.message
          });
        }
      }
      
      console.log('[API] 파싱된 요청 본문:', {
        name: body.name,
        school: body.school,
        grade: body.grade,
        contentLength: body.letterContent?.length,
        countryId: body.countryId
      });
      
      // 필수 필드 검증
      if (!validateLetterData(body)) {
        console.log('[API] 필수 필드 누락');
        
        return res.status(400).json({
          success: false,
          message: '필수 항목이 누락되었습니다',
          requiredFields: ['name', 'letterContent', 'countryId'],
          receivedFields: Object.keys(body)
        });
      }
      
      // 서비스 호출 (MongoDB 저장)
      const result = await letterService.addLetter(body);
      
      // 결과 상태에 따라 응답
      return res.status(result.success ? 201 : 400).json(result);
    }
    
    // 국가 목록 조회 (getCountries)
    if (action === 'getCountries') {
      const region = url.searchParams?.get('region');
      const type = url.searchParams?.get('type');
      
      console.log('[API] 국가 목록 조회:', { region, type });
      
      // 서비스 호출
      const result = await countryService.getCountries(region, type);
      
      return res.status(200).json(result);
    }
    
    // 국가 상세 정보 조회 (getCountry)
    if (action === 'getCountry') {
      const id = url.searchParams?.get('id');
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: '국가 ID가 필요합니다'
        });
      }
      
      console.log('[API] 국가 상세 정보 조회:', { id });
      
      // 서비스 호출
      const result = await countryService.getCountryById(id);
      
      // 데이터 존재 여부에 따라 상태 코드 설정
      return res.status(result.success ? 200 : 404).json(result);
    }
    
    // 편지 통계 조회 (getStats)
    if (action === 'getStats') {
      console.log('[API] 편지 통계 조회');
      
      // 서비스 호출
      const result = await letterService.getLetterStats();
      
      return res.status(200).json(result);
    }
    
    // 건강 확인 (health)
    if (action === 'health') {
      // 간단한 MongoDB 연결 테스트
      try {
        const { db } = await connectToDatabase();
        const collections = await db.listCollections().toArray();
        
        return res.status(200).json({
          success: true,
          status: 'ok',
          version: '1.1.0',
          mongodb: 'connected',
          collections: collections.map(c => c.name),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(200).json({
          success: true,
          status: 'degraded',
          version: '1.1.0',
          mongodb: 'disconnected',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // 알 수 없는 액션이거나 액션이 없는 경우 기본 응답
    console.log('[API] 알 수 없는 액션 또는 기본 응답:', action);
    
    return res.status(200).json({
      success: true,
      message: 'UN 참전국 감사 편지 API (MongoDB 연동)',
      status: 'ok',
      data: sampleLetters, // 프론트엔드 호환성을 위해 항상 data 필드 포함
      availableActions: ['getLetters', 'submitLetter', 'getCountries', 'getCountry', 'getStats', 'health'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[API] 처리 오류:', error);
    
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};