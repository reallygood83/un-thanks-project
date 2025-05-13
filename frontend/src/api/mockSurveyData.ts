import { Survey, SurveyResponse, SurveyResults } from '../types/survey';

// 테스트용 임시 설문 데이터
export const mockSurveys: Survey[] = [
  {
    _id: '1',
    title: '미래 통일 한국의 모습에 대한 설문',
    description: '이 설문은 학생들이 생각하는 미래 통일 한국의 모습과 기대에 대해 조사합니다. 여러분의 생각과 의견을 자유롭게 남겨주세요.',
    questions: [
      {
        id: 'q1',
        text: '통일 한국의 가장 큰 장점은 무엇이라고 생각하나요?',
        type: 'text',
        required: true
      },
      {
        id: 'q2',
        text: '통일이 된다면 가장 먼저 방문하고 싶은 북한 지역은 어디인가요?',
        type: 'multipleChoice',
        options: ['평양', '백두산', '금강산', '개성', '신의주', '원산', '기타'],
        required: true
      },
      {
        id: 'q3',
        text: '통일 한국이 어떤 나라가 되었으면 좋겠나요? 자유롭게 서술해주세요.',
        type: 'text',
        required: true
      },
      {
        id: 'q4',
        text: '통일 후 남북한 문화 통합에 있어 가장 중요한 것은 무엇이라고 생각하나요?',
        type: 'multipleChoice',
        options: ['언어 차이 극복', '교육 제도 통합', '문화 예술 교류', '생활 방식 이해', '역사 인식 공유'],
        required: true
      },
      {
        id: 'q5',
        text: '통일이 한반도에 가져올 평화 수준을 1-10 사이로 평가한다면?',
        type: 'scale',
        required: true
      }
    ],
    isActive: true,
    createdAt: new Date('2025-05-01')
  },
  {
    _id: '2',
    title: '학생들의 통일 교육 경험 조사',
    description: '학교에서 받은 통일 교육의 경험과 효과, 그리고 개선 방안에 대한 여러분의 의견을 조사합니다.',
    questions: [
      {
        id: 'q1',
        text: '학교에서 통일 교육을 받은 경험이 있나요?',
        type: 'multipleChoice',
        options: ['예, 자주 받았습니다', '가끔 받았습니다', '거의 받지 않았습니다', '전혀 받지 않았습니다'],
        required: true
      },
      {
        id: 'q2',
        text: '가장 기억에 남는 통일 교육 활동은 무엇인가요?',
        type: 'text',
        required: false
      },
      {
        id: 'q3',
        text: '통일 교육이 남북 관계와 통일에 대한 이해에 도움이 된 정도를 평가해주세요.',
        type: 'scale',
        required: true
      },
      {
        id: 'q4',
        text: '어떤 방식의 통일 교육이 가장 효과적이라고 생각하나요?',
        type: 'multipleChoice',
        options: ['영상 시청', '북한 이탈 주민과의 대화', '토론 활동', '체험 학습', '게임 및 퀴즈', '독서 및 글쓰기'],
        required: true
      },
      {
        id: 'q5',
        text: '통일 교육에서 더 다루어졌으면 하는 주제가 있다면 무엇인가요?',
        type: 'text',
        required: false
      }
    ],
    isActive: true,
    createdAt: new Date('2025-05-03')
  },
  {
    _id: '3',
    title: '통일 후 사회 변화에 대한 기대',
    description: '통일 이후 한국 사회에 예상되는 변화와 미래상에 대한 학생들의 의견을 조사합니다.',
    questions: [
      {
        id: 'q1',
        text: '통일 후 우리 사회에 가장 큰 변화가 있을 것으로 예상되는 분야는?',
        type: 'multipleChoice',
        options: ['경제', '문화/예술', '교육', '국제 관계', '환경', '교통/인프라'],
        required: true
      },
      {
        id: 'q2',
        text: '통일 한국의 경제 발전 가능성을 어떻게 평가하나요?',
        type: 'scale',
        required: true
      },
      {
        id: 'q3',
        text: '통일 후 남북한 주민들 간의 사회 통합에 걸릴 것으로 예상되는 시간은?',
        type: 'multipleChoice',
        options: ['5년 이내', '5-10년', '10-20년', '20-30년', '30년 이상'],
        required: true
      },
      {
        id: 'q4',
        text: '통일 한국이 국제 사회에서 어떤 역할을 할 수 있을까요?',
        type: 'text',
        required: true
      },
      {
        id: 'q5',
        text: '통일 후 가장 기대되는, 또는 걱정되는 사회 변화는 무엇인가요?',
        type: 'text',
        required: true
      }
    ],
    isActive: false,
    createdAt: new Date('2025-04-20')
  }
];

// 응답 저장을 위한 임시 저장소
let mockResponses: SurveyResponse[] = [];

// 임시로 surveyApi의 일부 함수를 모의 구현하는 함수들
export const mockGetAllSurveys = async (): Promise<Survey[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockSurveys);
    }, 500);
  });
};

export const mockGetSurveyById = async (id: string): Promise<Survey> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const survey = mockSurveys.find(s => s._id === id);
      if (survey) {
        resolve(survey);
      } else {
        reject(new Error('Survey not found'));
      }
    }, 500);
  });
};

export const mockSubmitResponse = async (
  surveyId: string,
  responseData: { respondentInfo: any, answers: any[] }
): Promise<{ responseId: string }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const responseId = `resp_${Date.now()}`;
      
      mockResponses.push({
        _id: responseId,
        surveyId,
        respondentInfo: responseData.respondentInfo,
        answers: responseData.answers,
        createdAt: new Date()
      });
      
      resolve({ responseId });
    }, 800);
  });
};

export const mockGetSurveyResults = async (surveyId: string): Promise<SurveyResults> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const survey = await mockGetSurveyById(surveyId);
        const responses = mockResponses.filter(r => r.surveyId === surveyId);
        
        // 간단한 모의 분석 결과 생성
        const totalResponses = responses.length;
        
        // 간단한 질문별 통계
        const questionStats = survey.questions.map(question => {
          const allAnswers = responses
            .map(r => r.answers.find(a => a.questionId === question.id)?.value)
            .filter(Boolean);
          
          let answerDistribution: any = {};
          
          if (question.type === 'multipleChoice' && question.options) {
            // 선택지별 카운트
            question.options.forEach(option => {
              answerDistribution[option] = allAnswers.filter(a => a === option).length;
            });
          } else if (question.type === 'scale') {
            // 척도 평균
            const sum = allAnswers.reduce((acc: number, val: number) => acc + val, 0);
            answerDistribution = {
              average: totalResponses > 0 ? sum / totalResponses : 0,
              counts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({
                value: n,
                count: allAnswers.filter(a => a === n).length
              }))
            };
          } else {
            // 텍스트 응답의 경우 단순 리스트
            answerDistribution = allAnswers;
          }
          
          return {
            questionId: question.id,
            questionText: question.text,
            answerDistribution
          };
        });
        
        const result: SurveyResults = {
          survey,
          responses,
          analytics: {
            totalResponses,
            questionStats,
            aiSummary: totalResponses > 0 
              ? '이 AI 요약은 실제 Gemini API 통합 시 제공될 예정입니다.'
              : undefined
          }
        };
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 800);
  });
};

// 개발 목적으로 surveyApi 객체를 모킹한 버전
export const mockSurveyApi = {
  getAllSurveys: mockGetAllSurveys,
  getSurveyById: mockGetSurveyById,
  submitResponse: mockSubmitResponse,
  getSurveyResults: mockGetSurveyResults
};