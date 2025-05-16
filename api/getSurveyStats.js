/**
 * 설문 결과 통계 API 엔드포인트
 * 특정 설문에 대한 응답 통계를 제공합니다.
 */

const { MongoClient, ObjectId } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[getSurveyStats] API 호출:', req.method, req.url);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    // URL에서 설문 ID 추출
    const path = req.url.split('?')[0];
    console.log('[getSurveyStats] 원본 경로:', path);
    
    let surveyId = '';
    
    // URL 경로에서 ID 추출 시도 (다양한 패턴 처리)
    if (path.includes('/getSurveyStats/')) {
      // 마지막 슬래시 이후의 모든 문자를 ID로 간주
      const parts = path.split('/');
      surveyId = parts[parts.length - 1];
    }
    
    // ID가 추출되지 않았으면 쿼리 파라미터에서 시도
    if (!surveyId && req.query && req.query.id) {
      surveyId = req.query.id;
    }
    
    console.log(`[getSurveyStats] 추출된 설문 ID: "${surveyId}"`);
    
    if (!surveyId) {
      return res.status(400).json({
        success: false,
        error: '설문 ID가 필요합니다.'
      });
    }
    
    // 비밀번호 확인 (쿼리 파라미터에서)
    const adminPassword = req.query && req.query.password;
    console.log(`[getSurveyStats] 관리자 비밀번호 제공 여부: ${!!adminPassword}`);
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[getSurveyStats] MongoDB 연결 시도');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[getSurveyStats] MongoDB 연결 성공');
      
      const db = client.db(DB_NAME);
      const surveysCollection = db.collection('surveys');
      const responsesCollection = db.collection('survey_responses');
      
      // 설문이 존재하는지 확인
      let survey;
      
      try {
        // ObjectId로 조회 시도
        const objectId = new ObjectId(surveyId);
        survey = await surveysCollection.findOne({ _id: objectId });
      } catch (e) {
        console.log('[getSurveyStats] ObjectId 변환 실패, 문자열 ID로 시도:', e.message);
        // 문자열 ID로 조회 시도
        survey = await surveysCollection.findOne({ _id: surveyId });
      }
      
      // 비밀번호 검증
      let isAuthenticated = false;
      
      if (survey && adminPassword) {
        console.log('[getSurveyStats] 관리자 비밀번호 검증 시도');
        // 하드코딩된 관리자 비밀번호 확인
        if (adminPassword === '19500625') {
          isAuthenticated = true;
          console.log('[getSurveyStats] 관리자 인증 성공');
        } else {
          console.log('[getSurveyStats] 관리자 인증 실패');
        }
      }
      
      // 설문이 없을 경우 오류 반환
      if (!survey) {
        console.log('[getSurveyStats] 설문을 찾을 수 없음');
        return res.status(404).json({
          success: false,
          error: '해당 설문을 찾을 수 없습니다.'
        });
      }
      
      // 해당 설문에 대한 모든 응답 조회
      let allResponses = [];
      
      // 설문의 실제 ID 타입 확인
      const actualSurveyId = survey._id;
      console.log('[getSurveyStats] 설문의 실제 ID:', actualSurveyId);
      console.log('[getSurveyStats] 설문 ID 타입:', typeof actualSurveyId);
      console.log('[getSurveyStats] 요청된 surveyId:', surveyId);
      
      // 디버깅: 모든 응답 조회
      const allResponsesDebug = await responsesCollection.find({}).toArray();
      console.log('[getSurveyStats] 전체 응답 수:', allResponsesDebug.length);
      if (allResponsesDebug.length > 0) {
        console.log('[getSurveyStats] 첫 번째 응답의 surveyId:', allResponsesDebug[0].surveyId);
        console.log('[getSurveyStats] 첫 번째 응답의 surveyId 타입:', typeof allResponsesDebug[0].surveyId);
      }
      
      try {
        // 설문의 실제 ID를 사용하여 조회
        const responses = await responsesCollection.find({ surveyId: actualSurveyId }).toArray();
        console.log(`[getSurveyStats] surveyId(${actualSurveyId})로 조회된 응답 수: ${responses.length}`);
        allResponses = responses;
        
        // 추가로 다른 ID 형식으로도 시도
        if (allResponses.length === 0) {
          // 문자열 ID로 시도
          const stringResponses = await responsesCollection.find({ surveyId: surveyId }).toArray();
          console.log(`[getSurveyStats] 문자열 ID로 조회된 응답 수: ${stringResponses.length}`);
          if (stringResponses.length > 0) {
            allResponses = stringResponses;
          }
        }
        
        // ObjectId로도 시도
        if (allResponses.length === 0 && typeof surveyId === 'string') {
          try {
            const objectId = new ObjectId(surveyId);
            const objIdResponses = await responsesCollection.find({ surveyId: objectId }).toArray();
            console.log(`[getSurveyStats] ObjectId로 조회된 응답 수: ${objIdResponses.length}`);
            if (objIdResponses.length > 0) {
              allResponses = objIdResponses;
            }
          } catch (e) { 
            console.log('[getSurveyStats] ObjectId 변환 실패:', e.message);
          }
        }
        
        // actualSurveyId를 문자열로 변환해서도 시도
        if (allResponses.length === 0) {
          const stringActualId = String(actualSurveyId);
          const stringActualResponses = await responsesCollection.find({ surveyId: stringActualId }).toArray();
          console.log(`[getSurveyStats] 문자열 변환 actualSurveyId로 조회된 응답 수: ${stringActualResponses.length}`);
          if (stringActualResponses.length > 0) {
            allResponses = stringActualResponses;
          }
        }
        
        // 중복 제거
        const seen = new Set();
        allResponses = allResponses.filter(resp => {
          const id = resp._id.toString();
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        
        console.log(`[getSurveyStats] 중복 제거 후 총 응답 수: ${allResponses.length}`);
      } catch (e) {
        console.error('[getSurveyStats] 응답 조회 오류:', e);
        allResponses = [];
      }
      
      // 디버깅: 첫 번째 응답 구조 출력
      if (allResponses.length > 0) {
        console.log('[getSurveyStats] 첫 번째 응답 예시:', JSON.stringify(allResponses[0]).slice(0, 300) + '...');
      }
      
      // 응답이 없는 경우 빈 결과 반환
      if (allResponses.length === 0) {
        console.log('[getSurveyStats] 응답이 없음 - 빈 결과 반환');
        
        // 빈 통계 데이터 생성
        const questionStats = [];
        
        if (survey.questions && Array.isArray(survey.questions)) {
          survey.questions.forEach(question => {
            const questionId = question.id;
            const questionStat = { questionId };
            
            // 질문 유형에 따른 빈 데이터 생성
            if (question.type === 'singleChoice' || question.type === 'multipleChoice') {
              const distribution = {};
              
              if (question.options && Array.isArray(question.options)) {
                // 모든 옵션을 0으로 초기화
                question.options.forEach(option => {
                  distribution[option] = 0;
                });
              }
              
              questionStat.answerDistribution = distribution;
            } else if (question.type === 'text') {
              questionStat.answerDistribution = [];
            }
            
            questionStats.push(questionStat);
          });
        }
        
        // 최종 응답 구조
        const result = {
          survey: survey,
          analytics: {
            totalResponses: 0,
            questionStats: questionStats,
            aiSummary: "아직 응답이 없습니다."
          }
        };
        
        console.log('[getSurveyStats] 응답 반환: 빈 데이터');
        
        return res.status(200).json({
          success: true,
          data: result
        });
      }
      
      // 실제 응답 데이터 처리
      console.log('[getSurveyStats] 실제 응답 처리 시작');
      
      // 질문별 통계 데이터 생성
      const questionStats = [];
      
      if (survey.questions && Array.isArray(survey.questions)) {
        survey.questions.forEach(question => {
          const questionId = question.id;
          console.log(`[getSurveyStats] 질문 처리: ${questionId} - ${question.text}`);
          
          // 응답 데이터 분석
          if (question.type === 'singleChoice' || question.type === 'multipleChoice') {
            // 선택형 질문의 분포 계산
            const distribution = {};
            
            // 초기값 설정
            if (question.options && Array.isArray(question.options)) {
              question.options.forEach(option => {
                distribution[option] = 0;
              });
            }
            
            // 전체 응답 분석
            allResponses.forEach((response, responseIndex) => {
              // 응답 데이터가 있는지 확인 (다양한 형식 지원)
              const answerData = response.responses || response.answers || {};
              
              if (responseIndex === 0) {
                console.log(`[getSurveyStats] === 첫 번째 응답 분석 ===`);
                console.log(`[getSurveyStats] response 전체:`, JSON.stringify(response));
                console.log(`[getSurveyStats] answerData 키들:`, Object.keys(answerData));
                console.log(`[getSurveyStats] 찾고 있는 questionId: "${questionId}" (타입: ${typeof questionId})`);
                
                // 각 키의 타입도 확인
                Object.keys(answerData).forEach(key => {
                  console.log(`[getSurveyStats] answerData["${key}"] = ${answerData[key]} (타입: ${typeof key})`);
                });
              }
              
              // 직접 속성으로 접근
              let answer = null;
              
              // 다양한 경로로 답변 찾기
              if (typeof answerData === 'object' && answerData !== null) {
                // 먼저 정확한 questionId 확인
                if (answerData[questionId] !== undefined) {
                  // 직접 매핑된 경우
                  answer = answerData[questionId];
                  console.log(`[getSurveyStats] 직접 매핑으로 찾음: ${questionId} = ${answer}`);
                } else if (Array.isArray(answerData)) {
                  // answers 배열인 경우
                  const foundAnswer = answerData.find(a => a.questionId === questionId);
                  if (foundAnswer) {
                    answer = foundAnswer.value;
                    console.log(`[getSurveyStats] 배열에서 찾음: ${questionId} = ${answer}`);
                  }
                } else {
                  // 모든 키를 순회하면서 다양한 방법으로 매칭 시도
                  for (const key in answerData) {
                    // 대소문자 구분 없이 비교
                    if (key.toLowerCase() === questionId.toLowerCase()) {
                      answer = answerData[key];
                      console.log(`[getSurveyStats] 대소문자 무시 매칭: ${key} = ${answer}`);
                      break;
                    }
                    
                    // 문자열 비교
                    if (String(key) === String(questionId)) {
                      answer = answerData[key];
                      console.log(`[getSurveyStats] 문자열 변환 매칭: ${key} = ${answer}`);
                      break;
                    }
                  }
                }
              }
              
              if (answer !== undefined && answer !== null) {
                console.log(`[getSurveyStats] 질문 ${questionId}에 대한 답변 찾음: ${typeof answer === 'object' ? JSON.stringify(answer) : answer}`);
                
                if (Array.isArray(answer)) {
                  // 다중 선택인 경우
                  answer.forEach(option => {
                    distribution[option] = (distribution[option] || 0) + 1;
                  });
                } else if (typeof answer === 'string' || typeof answer === 'number') {
                  // 단일 선택인 경우
                  const answerStr = String(answer);
                  distribution[answerStr] = (distribution[answerStr] || 0) + 1;
                }
              }
            });
            
            // 데이터 추가
            questionStats.push({
              questionId,
              answerDistribution: distribution
            });
            
            console.log(`[getSurveyStats] 질문 ${questionId} 통계:`, distribution);
          } else if (question.type === 'text') {
            // 텍스트 응답 수집
            const textResponses = [];
            
            allResponses.forEach(response => {
              const answers = response.responses || response.answers || {};
              
              // 다양한 경로로 답변 찾기
              let answer = null;
              if (typeof answers === 'object') {
                if (answers[questionId] !== undefined) {
                  answer = answers[questionId];
                } else if (Array.isArray(answers)) {
                  const foundAnswer = answers.find(a => a.questionId === questionId);
                  if (foundAnswer) {
                    answer = foundAnswer.value;
                  }
                }
              }
              
              if (answer && typeof answer === 'string' && answer.trim()) {
                textResponses.push(answer.trim());
              }
            });
            
            // 데이터 추가
            questionStats.push({
              questionId,
              answerDistribution: textResponses
            });
            
            console.log(`[getSurveyStats] 질문 ${questionId} 텍스트 응답 수: ${textResponses.length}`);
          }
        });
      }
      
      // 최종 결과 구조
      const result = {
        survey: survey,
        analytics: {
          totalResponses: allResponses.length,
          questionStats: questionStats,
          aiSummary: "이 설문에 대한 AI 분석은 아직 준비되지 않았습니다."
        },
        // 관리자 인증 여부 추가
        isAuthenticated: isAuthenticated
      };
      
      // 관리자인 경우 추가 정보 제공
      if (isAuthenticated) {
        result.adminData = {
          totalResponses: allResponses.length,
          responses: allResponses, // 실제 응답 데이터
          createdAt: survey.createdAt,
          updatedAt: survey.updatedAt
        };
      }
      
      console.log(`[getSurveyStats] 최종 응답: 설문 제목 "${survey.title}", 총 응답수 ${allResponses.length}, 질문 통계 수 ${questionStats.length}, 관리자 인증: ${isAuthenticated}`);
      
      return res.status(200).json({
        success: true,
        data: result
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[getSurveyStats] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[getSurveyStats] 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
}; 