import { ICountry } from '../models/country';

// 참전국 데이터 (초기 데이터)
export const countryData: Partial<ICountry>[] = [
  {
    name: '미국 (United States)',
    code: 'usa',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/usa.png',
    language: 'en',
    description: '미국은 한국전쟁에서 가장 많은 병력을 파견한 국가로, UN군의 중추적 역할을 담당했습니다.',
    statistics: {
      soldiers: 1789000,
      casualties: 36574,
      startDate: new Date('1950-07-01'),
      endDate: new Date('1953-07-27')
    },
    history: '미국은 한국전쟁 발발 직후 UN 안보리 결의안에 따라 한국에 지상군을 파견했으며, 더글라스 맥아더 장군이 UN군 사령관을 맡았습니다. 미국은 인천상륙작전을 포함한 주요 작전을 주도했으며, 전쟁 전반에 걸쳐 가장 많은 병력과 물자를 지원했습니다.',
    relations: '한미동맹은 한국전쟁을 통해 형성되었으며, 이후 한국의 경제 발전과 안보에 중요한 역할을 했습니다. 현재까지도 주한미군이 주둔하며 한반도의 평화와 안정에 기여하고 있습니다.'
  },
  {
    name: '영국 (United Kingdom)',
    code: 'uk',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/uk.png',
    language: 'en',
    description: '영국은 미국에 이어 두 번째로 많은 병력을 파견한 유럽 국가입니다.',
    statistics: {
      soldiers: 56000,
      casualties: 1078,
      startDate: new Date('1950-08-29'),
      endDate: new Date('1953-07-27')
    },
    history: '영국은 1950년 8월 29일 영연방 제27여단을 한국에 파견했습니다. 영국군은 임진강 전투와 같은 주요 전투에 참전했으며, 특히 글로스터 대대의 설마리 전투는 유명합니다.',
    relations: '한국과 영국은 전쟁 이후 꾸준히 외교, 경제, 문화 교류를 발전시켜왔으며, 2013년에는 양국 수교 130주년을 맞이했습니다.'
  },
  {
    name: '터키 (Turkey)',
    code: 'turkey',
    participationType: 'combat',
    region: 'Middle East',
    flag: '/flags/turkey.png',
    language: 'tr',
    description: '터키는 미국 다음으로 많은 병력을 파견한 국가로, 군인들의 용맹함으로 유명합니다.',
    statistics: {
      soldiers: 21212,
      casualties: 741,
      startDate: new Date('1950-10-17'),
      endDate: new Date('1953-07-27')
    },
    history: '터키는 1950년 10월 19일 제1여단을 한국에 파견했습니다. 특히 금성지구 전투와 네바다 전초기지 전투에서 터키군의 용맹함이 돋보였습니다.',
    relations: '한국과 터키는 "피로 맺어진 형제국"이라 불리며, 양국은 전쟁 이후 군사, 경제, 문화 등 다양한 분야에서 협력 관계를 유지하고 있습니다.'
  },
  {
    name: '호주 (Australia)',
    code: 'australia',
    participationType: 'combat',
    region: 'Oceania',
    flag: '/flags/australia.png',
    language: 'en',
    description: '호주는 전쟁 발발 초기부터 해·공군 및 지상군을 파견한 국가입니다.',
    statistics: {
      soldiers: 17000,
      casualties: 339,
      startDate: new Date('1950-07-28'),
      endDate: new Date('1953-07-27')
    },
    history: '호주는 1950년 7월 28일 해군 함정을 파견한 것을 시작으로, 9월에는 공군, 그리고 1952년에는 지상군을 추가로 파견했습니다. 호주군은 가평전투와 마리양지 전투에서 큰 전공을 세웠습니다.',
    relations: '한국과 호주는 전쟁 이후 꾸준한 교류를 통해 무역, 투자, 교육 분야에서 협력을 강화해왔으며, 2014년에는 한-호주 자유무역협정(FTA)이 발효되었습니다.'
  },
  {
    name: '캐나다 (Canada)',
    code: 'canada',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/canada.png',
    language: 'en',
    description: '캐나다는 육해공군을 모두 파견하여 UN군의 일원으로 참전했습니다.',
    statistics: {
      soldiers: 26791,
      casualties: 516,
      startDate: new Date('1950-07-12'),
      endDate: new Date('1953-07-27')
    },
    history: '캐나다는 1950년 7월 12일 해군 구축함 3척을 파견했으며, 이후 공군과 육군 부대도 참전했습니다. 특히 캐나다 제25여단은 가평전투에서 중공군의 공세를 막아내는 데 기여했습니다.',
    relations: '한국과 캐나다는 전후 경제 및 문화 교류를 확대해왔으며, 2015년에는 한-캐나다 자유무역협정이 발효되어 양국 관계가 더욱 강화되었습니다.'
  },
  {
    name: '태국 (Thailand)',
    code: 'thailand',
    participationType: 'combat',
    region: 'Asia',
    flag: '/flags/thailand.png',
    language: 'th',
    description: '태국은 아시아에서 가장 먼저 한국전에 참전한 국가 중 하나입니다.',
    statistics: {
      soldiers: 6326,
      casualties: 129,
      startDate: new Date('1950-11-07'),
      endDate: new Date('1955-03-01')
    },
    history: '태국은 1950년 11월 7일 육군 대대를 파견했으며, 이후 해군 함정과 공군 수송기도 지원했습니다. 태국군은 주로 수도사단과 함께 작전을 수행했습니다.',
    relations: '한국과 태국은 전쟁 이후 꾸준한 우호 관계를 유지해왔으며, 무역, 투자, 문화, 관광 등 다양한 분야에서 교류하고 있습니다.'
  },
  {
    name: '필리핀 (Philippines)',
    code: 'philippines',
    participationType: 'combat',
    region: 'Asia',
    flag: '/flags/philippines.png',
    language: 'fil',
    description: '필리핀은 아시아에서 한국전에 지상군을 파견한 국가 중 하나입니다.',
    statistics: {
      soldiers: 7420,
      casualties: 112,
      startDate: new Date('1950-09-19'),
      endDate: new Date('1953-07-27')
    },
    history: '필리핀은 1950년 9월 19일 제10대대전투단을 파견했습니다. 필리핀군은 주로 유엔군의 일원으로 백마고지, 오성산 등에서 전투를 벌였습니다.',
    relations: '한국과 필리핀은 전쟁 이후 경제, 문화,, 인적 교류가 활발하게 이루어지고 있으며, 양국 간 교역량도 꾸준히 증가하고 있습니다.'
  },
  {
    name: '네덜란드 (Netherlands)',
    code: 'netherlands',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/netherlands.png',
    language: 'nl',
    description: '네덜란드는 유럽 국가 중 한국전에 참전한 국가입니다.',
    statistics: {
      soldiers: 5322,
      casualties: 124,
      startDate: new Date('1950-11-23'),
      endDate: new Date('1954-12-31')
    },
    history: '네덜란드는 1950년 11월 23일 대대 규모의 지상군을 파견했습니다. 네덜란드군은 주로 영연방 제28여단에 배속되어 활동했으며, 임진강과 화천 지역 전투에 참여했습니다.',
    relations: '한국과 네덜란드는 교역, 투자, 문화 교류를 통해 협력 관계를 유지하고 있으며, 네덜란드는 한국의 중요한 유럽 내 무역 파트너 중 하나입니다.'
  },
  {
    name: '콜롬비아 (Colombia)',
    code: 'colombia',
    participationType: 'combat',
    region: 'South America',
    flag: '/flags/colombia.png',
    language: 'es',
    description: '콜롬비아는 남미에서 유일하게 한국전에 지상군을 파견한 국가입니다.',
    statistics: {
      soldiers: 5100,
      casualties: 196,
      startDate: new Date('1951-06-15'),
      endDate: new Date('1953-07-27')
    },
    history: '콜롬비아는 1951년 6월 15일 프리게이트함과 보병대대를 파견했습니다. 콜롬비아군은 금화산과 김화지구 전투에서 활약했습니다.',
    relations: '한국과 콜롬비아는 전쟁 이후 긴밀한 관계를 유지해왔으며, 2016년에는 양국간 자유무역협정이 발효되어 교역이 확대되고 있습니다.'
  },
  {
    name: '그리스 (Greece)',
    code: 'greece',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/greece.png',
    language: 'el',
    description: '그리스는 유럽 국가 중 한국전에 참전한 국가입니다.',
    statistics: {
      soldiers: 4992,
      casualties: 192,
      startDate: new Date('1950-12-09'),
      endDate: new Date('1955-05-01')
    },
    history: '그리스는 1950년 12월 9일 대대 규모의 지상군을 파견했습니다. 그리스군은 스코츠 고지, 해리 고지, 노리 고지 등의 전투에 참여했습니다.',
    relations: '한국과 그리스는 전쟁 이후 우호 관계를 유지하고 있으며, 무역, 해운, 관광 분야에서 협력이 이루어지고 있습니다.'
  }
];

export default countryData;