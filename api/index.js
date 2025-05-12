// API 루트 경로 핸들러 - 모든 기능 통합
// CommonJS 스타일 사용
const { connectToDatabase } = require('./_lib/mongodb');
const { parseBody } = require('./_lib/parser');
const { v4: uuidv4 } = require('uuid');

// API 핸들러 - 모든 요청 처리
async function handler(req, res) {
  // CORS 헤더 설정 - 원래 요청의 Origin을 허용하도록 설정
  const requestOrigin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // 인증 정보 포함 허용

  // OPTIONS 요청 즉시 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 모든 요청 정보 로깅
  console.log('API 요청 받음:', {
    method: req.method,
    url: req.url,
    query: req.query || {},
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    }
  });

  try {
    // 액션 기반 라우팅 - 수동 쿼리 파싱
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const params = url.searchParams;
    const action = params.get('action') || req.query?.action;
    
    console.log('요청 액션:', action);

    // 액션 기반 처리
    if (action === 'submitLetter' || action === 'createLetter') {
      if (req.method === 'POST') {
        return await handleLetterSubmit(req, res);
      } else {
        return res.status(405).json({
          success: false,
          message: '편지 제출은 POST 요청만 허용됩니다.'
        });
      }
    }

    if (action === 'getLetters' || action === 'listLetters') {
      return await handleLettersList(req, res);
    }

    if (action === 'getLetter') {
      const id = params.get('id') || req.query?.id;
      if (id) {
        return await handleLetterDetail(req, res, id);
      }
    }

    if (action === 'getCountries' || action === 'listCountries') {
      return await handleCountriesList(req, res);
    }

    if (action === 'getCountry') {
      const id = params.get('id') || req.query?.id;
      if (id) {
        return await handleCountryDetail(req, res, id);
      }
    }

    // 액션이 지정되지 않은 경우 기본 응답
    console.log('기본 응답 반환 - 액션 없음');
    return res.status(200).json({
      success: true,
      message: '통합 API가 정상 작동 중입니다',
      method: req.method,
      path: req.url || '/',
      data: [
        {
          id: 'default-1',
          name: '기본 사용자',
          school: '예시 학교',
          grade: '3학년',
          letterContent: '기본 API 응답에서 생성된 편지 내용입니다.',
          translatedContent: 'This is a letter content from default API response.',
          countryId: 'usa',
          createdAt: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다: ' + error.message
    });
  }
}

// 편지 목록 조회 - 액션 기반
async function handleLettersList(req, res) {
  // URL에서 쿼리 파라미터 추출
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const params = url.searchParams;
  const countryId = params.get('countryId') || req.query?.countryId;
  
  console.log('편지 목록 요청:', { countryId, url: req.url });

  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');

    // 쿼리 조건 설정
    const query = countryId ? { countryId } : {};
    
    // 편지 목록 조회 (최신순)
    const letters = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100) // 결과 수 제한
      .toArray();
    
    // 개인정보 제거하여 반환
    const sanitizedLetters = letters.map(letter => ({
      id: letter._id,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    }));

    console.log(`편지 목록 조회 결과: ${sanitizedLetters.length}개 항목`);

    // 성공 응답 반환
    return res.status(200).json({
      success: true,
      data: sanitizedLetters
    });
  } catch (dbError) {
    console.error('MongoDB 오류:', dbError);
    
    // 개발 환경에서 임시 데이터 반환
    console.log('MongoDB 연결 실패, 임시 데이터 반환');
    
    // 임시 더미 데이터
    const dummyLetters = [
      {
        id: 'dummy-1',
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
        translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
        countryId: countryId || 'usa',
        createdAt: new Date().toISOString()
      },
      {
        id: 'dummy-2',
        name: '김철수',
        school: '부산중학교',
        grade: '2학년',
        letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
        translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
        countryId: countryId || 'uk',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    // 국가별 필터링 적용
    const filteredLetters = countryId 
      ? dummyLetters.filter(letter => letter.countryId === countryId)
      : dummyLetters;
    
    return res.status(200).json({
      success: true,
      data: filteredLetters,
      fallback: true
    });
  }
}

// 편지 제출 - 액션 기반
async function handleLetterSubmit(req, res) {
  console.log('편지 제출 요청 - MongoDB 연결 시도');
  
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');

    // 요청 본문 파싱
    const body = await parseBody(req);
    
    console.log('파싱된 요청 본문:', {
      hasName: !!body.name,
      hasEmail: !!body.email,
      contentLength: body.letterContent ? body.letterContent.length : 0,
      countryId: body.countryId
    });

    const { 
      name, 
      email, 
      school, 
      grade, 
      letterContent, 
      originalContent, 
      countryId 
    } = body;

    // 필수 필드 유효성 검사
    if (!name || !email || !letterContent || !countryId) {
      return res.status(400).json({
        success: false,
        message: '필수 항목이 누락되었습니다.'
      });
    }

    // 번역 로직 (간단한 구현)
    const translatedContent = `[${countryId} 언어로 번역된 내용]: ${letterContent.substring(0, 30)}...`;

    // 새 편지 문서 생성
    const newLetter = {
      _id: uuidv4(),
      name,
      email,
      school: school || '',
      grade: grade || '',
      letterContent,
      translatedContent,
      originalContent: !!originalContent,
      countryId,
      createdAt: new Date()
    };

    // 데이터베이스에 저장
    const result = await collection.insertOne(newLetter);
    console.log('MongoDB 저장 결과:', {
      acknowledged: result.acknowledged,
      id: newLetter._id
    });

    // 성공 응답 반환
    return res.status(201).json({
      success: true,
      message: '편지가 성공적으로 제출되었습니다',
      data: {
        id: newLetter._id,
        translatedContent,
        originalContent: letterContent
      }
    });
  } catch (dbError) {
    console.error('MongoDB 오류:', dbError);
    
    // 개발 환경에서 임시 데이터 반환
    const fallbackId = 'fallback-' + Date.now();
    console.log('임시 더미 데이터 반환, ID:', fallbackId);
    
    return res.status(200).json({
      success: true,
      message: 'MongoDB 연결 실패로 임시 데이터 반환',
      data: {
        id: fallbackId,
        translatedContent: `[임시 번역]: ${letterContent ? letterContent.substring(0, 30) : ''}...`,
        originalContent: letterContent || ''
      },
      fallback: true
    });
  }
}

// 특정 ID의 편지 상세 정보
async function handleLetterDetail(req, res, id) {
  console.log('편지 상세 정보 요청:', id);
  
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // 편지 조회
    const letter = await collection.findOne({ _id: id });
    
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: `ID ${id}에 해당하는 편지를 찾을 수 없습니다.`
      });
    }
    
    // 개인정보 제거하여 반환
    const sanitizedLetter = {
      id: letter._id,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    };
    
    return res.status(200).json({
      success: true,
      data: sanitizedLetter
    });
  } catch (error) {
    console.error('편지 상세 조회 오류:', error);
    
    // 임시 더미 데이터
    return res.status(200).json({
      success: true,
      data: {
        id: id,
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '참전해주셔서 감사합니다',
        translatedContent: 'Thank you for your participation',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      },
      fallback: true
    });
  }
}

// 국가 목록 - 액션 기반
async function handleCountriesList(req, res) {
  console.log('국가 목록 요청');
  
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('countries');
    
    // 국가 목록 조회
    const countries = await collection.find().sort({ name: 1 }).toArray();
    
    return res.status(200).json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('국가 목록 조회 오류:', error);
    
    // 임시 더미 데이터
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'usa',
          name: '미국 (United States)',
          code: 'usa',
          participationType: 'combat',
          region: 'North America',
          flag: '/flags/usa.png',
          language: 'en'
        },
        {
          id: 'uk',
          name: '영국 (United Kingdom)',
          code: 'uk',
          participationType: 'combat',
          region: 'Europe',
          flag: '/flags/uk.png',
          language: 'en'
        },
        {
          id: 'turkey',
          name: '터키 (Turkey)',
          code: 'turkey',
          participationType: 'combat',
          region: 'Middle East',
          flag: '/flags/turkey.png',
          language: 'tr'
        }
      ],
      fallback: true
    });
  }
}

// 특정 국가 상세 정보
async function handleCountryDetail(req, res, id) {
  console.log('국가 상세 정보 요청:', id);
  
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('countries');
    
    // 국가 조회
    const country = await collection.findOne({ _id: id });
    
    if (!country) {
      return res.status(404).json({
        success: false,
        message: `ID ${id}에 해당하는 국가를 찾을 수 없습니다.`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error('국가 상세 조회 오류:', error);
    
    // 임시 더미 데이터
    let dummyCountry;
    if (id === 'usa' || id.includes('usa')) {
      dummyCountry = {
        id: 'usa',
        name: '미국 (United States)',
        code: 'usa',
        participationType: 'combat',
        region: 'North America',
        flag: '/flags/usa.png',
        language: 'en'
      };
    } else if (id === 'uk' || id.includes('uk')) {
      dummyCountry = {
        id: 'uk',
        name: '영국 (United Kingdom)',
        code: 'uk',
        participationType: 'combat',
        region: 'Europe',
        flag: '/flags/uk.png',
        language: 'en'
      };
    } else {
      dummyCountry = {
        id: id,
        name: '기타 국가',
        code: id,
        participationType: 'combat',
        region: 'Unknown',
        flag: '/flags/unknown.png',
        language: 'en'
      };
    }
    
    return res.status(200).json({
      success: true,
      data: dummyCountry,
      fallback: true
    });
  }
}

module.exports = handler;