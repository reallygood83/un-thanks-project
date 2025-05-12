export interface ParticipatingCountry {
  id: string;
  nameKo: string; // Korean name
  nameEn: string; // English name
  supportType: 'combat' | 'medical' | 'material' | 'intent';
  flagCode: string; // ISO country code for flag display
  troops?: number; // Total troops sent
  period?: {
    start: string;
    end: string;
  };
  casualties?: {
    killed: number;
    wounded: number;
    missing: number;
  };
  contributions: string;
  background: string;
  relationship: string;
  imageUrl?: string;
}

export const PARTICIPATING_COUNTRIES: ParticipatingCountry[] = [
  {
    id: 'usa',
    nameKo: '미국',
    nameEn: 'United States of America',
    supportType: 'combat',
    flagCode: 'us',
    troops: 1789000,
    period: {
      start: '1950.6.27',
      end: '1953.7.27'
    },
    casualties: {
      killed: 36574,
      wounded: 103284,
      missing: 8177
    },
    contributions: '육해공군 및 해병대 포함 연인원 약 178만 9천 명의 병력을 파병하여 전쟁의 전 과정에 걸쳐 결정적인 역할을 수행했다. 인천상륙작전, 서울 수복, 평양 탈환 등 주요 전투를 이끌었으며, 가장 많은 인명 피해를 입었다.',
    background: '6.25 전쟁 발발 직후 가장 먼저 지원 의사를 밝혔으며, 유엔군 창설과 작전을 주도했다. 제2차 세계대전 이후 국제 질서를 주도하는 강대국으로 부상했으며, 자유민주주의 가치를 중요시한다.',
    relationship: '6.25 전쟁 참전을 통해 대한민국과 혈맹 관계를 맺었으며, 1953년 한미상호방위조약을 체결하여 현재까지 대한민국의 안보에 핵심적인 역할을 하고 있다. 경제, 문화 등 다양한 분야에서 긴밀한 협력 관계를 유지하고 있다.'
  },
  {
    id: 'uk',
    nameKo: '영국',
    nameEn: 'United Kingdom',
    supportType: 'combat',
    flagCode: 'gb',
    troops: 56000,
    period: {
      start: '1950.6.29',
      end: '1957'
    },
    casualties: {
      killed: 1109,
      wounded: 2674,
      missing: 1060
    },
    contributions: '미국 다음으로 많은 연인원 약 5만 6천 명의 병력을 파병했다. 영연방군의 핵심 일원으로서 육군 2개 보병여단, 해군 함정 17척, 해병 특공대 등을 파견하여 임진강 설마리 전투, 가평 전투 등에서 중공군과 치열한 전투를 벌였다.',
    background: '입헌군주제와 의회민주주의의 발상지이며, 산업혁명을 통해 근대 세계를 선도했다.',
    relationship: '1883년 조선과 수교한 이래 오랜 외교 관계를 이어오고 있으며, 6.25 전쟁 참전을 통해 우호 관계가 더욱 공고해졌다. 현재 \'포괄적·창조적 동반자 관계\'를 넘어 \'글로벌 전략적 동반자 관계\'로 발전하고 있다.'
  },
  {
    id: 'turkey',
    nameKo: '터키',
    nameEn: 'Turkey',
    supportType: 'combat',
    flagCode: 'tr',
    troops: 21212,
    period: {
      start: '1950.10.17',
      end: '1954.7'
    },
    casualties: {
      killed: 1005,
      wounded: 2068,
      missing: 407
    },
    contributions: '미국, 영국, 캐나다에 이어 네 번째로 많은 연인원 약 2만 1천 명의 병력을 파병했다. 특히 1개 여단 규모의 지상군은 군우리 전투, 금양장리 전투 등에서 혁혁한 공을 세웠으며, 용맹함으로 명성이 높았다.',
    background: '동서양 문화의 교차로에 위치하며, 오스만 제국의 오랜 역사를 가지고 있다. 터키군의 참전 결정에는 당시 NATO 가입을 희망했던 정치적 배경도 작용한 것으로 알려져 있다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 \"피로 맺어진 형제의 나라\"라는 각별한 유대감을 형성했으며, 이는 2002년 한일 월드컵 당시 터키 국민들의 한국팀 응원에서도 잘 나타났다. 양국은 정치, 경제, 문화 등 다방면에서 활발한 교류를 이어가고 있다.'
  },
  {
    id: 'canada',
    nameKo: '캐나다',
    nameEn: 'Canada',
    supportType: 'combat',
    flagCode: 'ca',
    troops: 26791,
    period: {
      start: '1950.7.28',
      end: '1957.6'
    },
    casualties: {
      killed: 516,
      wounded: 1212,
      missing: 33
    },
    contributions: '연인원 약 26,791명의 육, 해, 공군을 파병했다. 가평전투 등에서 많은 활약을 했다.',
    background: '북미 대륙에 위치한 연방제 국가로, 영연방의 일원이다. 다문화주의와 사회적 관용을 중시하는 정책으로 알려져 있다.',
    relationship: '6.25 전쟁 이후 한국과 우호 관계를 유지하며, 무역, 투자, 교육 등 다양한 분야에서 교류하고 있다.'
  },
  {
    id: 'australia',
    nameKo: '호주',
    nameEn: 'Australia',
    supportType: 'combat',
    flagCode: 'au',
    troops: 17164,
    period: {
      start: '1950.7.1',
      end: '1957.8'
    },
    casualties: {
      killed: 340,
      wounded: 1216,
      missing: 29
    },
    contributions: '연인원 약 17,164명의 육, 해, 공군을 파병했다. 영연방군의 일원으로 참전했다.',
    background: '영연방의 일원으로, 아시아-태평양 지역에서 중요한 역할을 하는 민주주의 국가이다.',
    relationship: '6.25 전쟁 이후 한국과 협력 관계를 유지해왔으며, 2014년에는 한-호주 자유무역협정(FTA)을 체결했다.'
  },
  {
    id: 'philippines',
    nameKo: '필리핀',
    nameEn: 'Philippines',
    supportType: 'combat',
    flagCode: 'ph',
    troops: 7420,
    period: {
      start: '1950.9.19',
      end: '1955.5'
    },
    casualties: {
      killed: 112,
      wounded: 299,
      missing: 57
    },
    contributions: '연인원 약 7,420명의 1개 대대전투단을 파병했다. 아시아 국가 중에서 유엔군에 참전했다.',
    background: '동남아시아에 위치한 도서국가로, 미국과 긴밀한 관계를 유지해왔다.',
    relationship: '6.25 전쟁 이후 한국과 우호적인 관계를 유지하며, 특히 많은 필리핀 노동자들이 한국에서 일하고 있다.'
  },
  {
    id: 'thailand',
    nameKo: '태국',
    nameEn: 'Thailand',
    supportType: 'combat',
    flagCode: 'th',
    troops: 6326,
    period: {
      start: '1950.10.22',
      end: '1972.6'
    },
    casualties: {
      killed: 136,
      wounded: 1139,
      missing: 5
    },
    contributions: '연인원 약 6,326명의 육, 해, 공군을 파병했다. 아시아 국가 중에서는 육해공군 모두 파견한 특징이 있다.',
    background: '동남아시아의 중심에 위치한 입헌군주국이다. 냉전 시기 미국과 긴밀한 관계를 유지했다.',
    relationship: '6.25 전쟁 이후 한국과 우호적인 관계를 유지하며, 경제 및 문화 교류가 활발하다.'
  },
  {
    id: 'netherlands',
    nameKo: '네덜란드',
    nameEn: 'Netherlands',
    supportType: 'combat',
    flagCode: 'nl',
    troops: 5322,
    period: {
      start: '1950.7.19',
      end: '1955.1'
    },
    casualties: {
      killed: 124,
      wounded: 645,
      missing: 3
    },
    contributions: '연인원 약 5,322명의 1개 보병대대와 해군을 파병했다. 횡성전투 등에서 활약했다.',
    background: '서유럽에 위치한 입헌군주국으로, 국제평화와 자유무역을 중시한다.',
    relationship: '6.25 전쟁 이후 한국과 경제, 문화 등 다방면에서 교류하고 있다.'
  },
  {
    id: 'colombia',
    nameKo: '콜롬비아',
    nameEn: 'Colombia',
    supportType: 'combat',
    flagCode: 'co',
    troops: 5100,
    period: {
      start: '1951.5.8',
      end: '1954.10'
    },
    casualties: {
      killed: 213,
      wounded: 448,
      missing: 69
    },
    contributions: '연인원 약 5,100명의 1개 보병대대와 해군을 파병했다. 중남미에서 유일하게 전투병을 파견한 국가다.',
    background: '남아메리카 북부에 위치한 공화국으로, 당시 미국과의 관계 강화를 위해 참전을 결정했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 특별한 관계를 맺었으며, 이후 경제 및 문화 교류가 지속되고 있다.'
  },
  {
    id: 'greece',
    nameKo: '그리스',
    nameEn: 'Greece',
    supportType: 'combat',
    flagCode: 'gr',
    troops: 10255,
    period: {
      start: '1950.11',
      end: '1958.5'
    },
    casualties: {
      killed: 186,
      wounded: 617,
      missing: 0
    },
    contributions: '연인원 약 10,255명의 \'스파르타 대대\'와 공군을 파병했다. 미 제1기병사단에 배속되어 장진호 전투와 해리고지 전투 등에서 활약했으며, 산악지형에서의 작전 능력이 뛰어났다.',
    background: '유럽 남동부에 위치한 공화국으로, 서구 문명의 발상지이다. 그리스 내전에서 공산주의를 물리친 경험이 있었으며, 이를 바탕으로 6.25 전쟁에 참전했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 우호 관계를 맺었으며, 특히 전쟁 중 한국 고아들을 돕는 등 인도주의적 활동을 많이 펼쳤다. 이후 경제, 문화 등 다양한 분야에서 교류하고 있다.'
  },
  {
    id: 'new-zealand',
    nameKo: '뉴질랜드',
    nameEn: 'New Zealand',
    supportType: 'combat',
    flagCode: 'nz',
    troops: 6000,
    period: {
      start: '1950.7',
      end: '1957.7'
    },
    casualties: {
      killed: 45,
      wounded: 79,
      missing: 1
    },
    contributions: '연인원 약 6,000명의 \'케이포스\'를 파병했다. 영 연방 27보병여단에 합류하여 가평전투, 마량산 전투 등에서 활약했다.',
    background: '영연방의 일원으로, 남태평양에 위치한 섬나라이다. 제2차 세계대전 이후 국제 평화를 지키기 위한 노력에 동참했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 외교 관계를 맺었으며, 이후 교역과 관광 등 다양한 분야에서 교류가 이루어지고 있다.'
  },
  {
    id: 'france',
    nameKo: '프랑스',
    nameEn: 'France',
    supportType: 'combat',
    flagCode: 'fr',
    troops: 3421,
    period: {
      start: '1950.10',
      end: '1953.7'
    },
    casualties: {
      killed: 269,
      wounded: 1008,
      missing: 18
    },
    contributions: '연인원 약 3,421명의 \'프랑스 대대\'를 파병했다. 미 제2보병사단에 배속되어 원주 전투, 쌍터널 전투, 치평리 전투, 단장의 능선 전투 등에서 활약했다.',
    background: '서유럽에 위치한 공화국으로, 계몽주의와 자유, 평등, 박애의 가치를 중시한다. 당시에는 인도차이나 전쟁 중이었음에도 6.25 전쟁에 참전했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 외교 관계를 맺었으며, 이후 경제, 문화, 과학기술 등 다양한 분야에서 협력하고 있다.'
  },
  {
    id: 'belgium',
    nameKo: '벨기에',
    nameEn: 'Belgium',
    supportType: 'combat',
    flagCode: 'be',
    troops: 3498,
    period: {
      start: '1951.1',
      end: '1955.6'
    },
    casualties: {
      killed: 101,
      wounded: 350,
      missing: 5
    },
    contributions: '연인원 약 3,498명의 \'벨기에 대대\'를 파병했다. 영연방 군대와 함께 참전하여 많은 전투에서 활약했다.',
    background: '서유럽에 위치한 입헌군주국으로, 유럽 연합의 주요 구성원이다. 국제 평화 유지 활동에 적극적으로 참여하는 전통을 가지고 있다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 외교 관계를 맺었으며, 이후 통상, 문화 등 다양한 분야에서 협력하고 있다.'
  },
  {
    id: 'south-africa',
    nameKo: '남아프리카 연방',
    nameEn: 'South Africa',
    supportType: 'combat',
    flagCode: 'za',
    troops: 826,
    period: {
      start: '1950.11',
      end: '1953.10'
    },
    casualties: {
      killed: 34,
      wounded: 74,
      missing: 8
    },
    contributions: '연인원 약 826명의 공군을 파병했다. 제2차 비행전대를 구성하여 공군 작전에 참여했다.',
    background: '아프리카 최남단에 위치한 국가로, 영연방의 일원이다. 당시에는 아파르트헤이트 정책을 시행 중이었지만, 국제사회의 일원으로서 6.25 전쟁에 참전했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 외교 관계를 맺었으며, 민주화 이후 더욱 활발한 교류가 이루어지고 있다.'
  },
  {
    id: 'luxembourg',
    nameKo: '룩셈부르크',
    nameEn: 'Luxembourg',
    supportType: 'combat',
    flagCode: 'lu',
    troops: 87,
    period: {
      start: '1951.1',
      end: '1953.7'
    },
    casualties: {
      killed: 2,
      wounded: 13,
      missing: 0
    },
    contributions: '연인원 약 87명의 \'룩셈부르크 소대\'를 파병했다. 벨기에 대대에 합류하여 참전했다.',
    background: '서유럽에 위치한 작은 대공국으로, 벨기에, 네덜란드와 함께 베네룩스 3국으로 알려져 있다. 작은 국가임에도 국제 평화 유지를 위해 참전을 결정했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 외교 관계를 맺었으며, 비록 규모는 작지만 상호 존중의 관계를 유지하고 있다.'
  },
  {
    id: 'india',
    nameKo: '인도',
    nameEn: 'India',
    supportType: 'medical',
    flagCode: 'in',
    contributions: '제60 낙하 야전 구급대 의료진 약 627명을 파견했다.',
    background: '남아시아 최대 국가로, 비동맹 외교정책을 추구했으나 인도주의적 차원에서 의료지원을 결정했다.',
    relationship: '6.25 전쟁 당시 의료지원을 통해 한국과 인연을 맺었으며, 이후 경제, IT 분야에서 협력이 확대되고 있다.'
  },
  {
    id: 'sweden',
    nameKo: '스웨덴',
    nameEn: 'Sweden',
    supportType: 'medical',
    flagCode: 'se',
    period: {
      start: '1950.9.28',
      end: '1957.4'
    },
    contributions: '적십자 야전병원 의료진 약 1,124명을 파견했다. 의료지원국 중 가장 오래 활동했다.',
    background: '북유럽의 중립국으로, 인도주의적 목적으로 의료 지원을 결정했다.',
    relationship: '6.25 전쟁 당시 의료지원을 통해 한국과 인연을 맺었으며, 이후 교역, 투자 등 경제 협력이 활발하게 이루어지고 있다.'
  },
  {
    id: 'denmark',
    nameKo: '덴마크',
    nameEn: 'Denmark',
    supportType: 'medical',
    flagCode: 'dk',
    period: {
      start: '1951.3',
      end: '1953.7'
    },
    contributions: '적십자 병원선 \'유틀란디아\'호를 파견했다. 당시 세계 최고 수준의 병원선으로 많은 부상자들을 치료했다.',
    background: '북유럽에 위치한 입헌군주국으로, 인도주의적 목적으로 의료 지원을 결정했다.',
    relationship: '6.25 전쟁 당시 의료지원을 통해 한국과 인연을 맺었으며, 이후 환경, 에너지, 조선 등 다양한 분야에서 협력이 이루어지고 있다.'
  },
  {
    id: 'norway',
    nameKo: '노르웨이',
    nameEn: 'Norway',
    supportType: 'medical',
    flagCode: 'no',
    period: {
      start: '1951.7',
      end: '1954.10'
    },
    contributions: '노르웨이-스웨덴 적십자 이동외과병원(NORMASH)를 파견했다. 약 90,000명의 환자를 치료했다.',
    background: '북유럽에 위치한 입헌군주국으로, 인도주의적 목적으로 의료 지원을 결정했다.',
    relationship: '6.25 전쟁 당시 의료지원을 통해 한국과 인연을 맺었으며, 이후 해운, 조선, 수산업 등의 분야에서 협력이 이루어지고 있다.'
  },
  {
    id: 'italy',
    nameKo: '이탈리아',
    nameEn: 'Italy',
    supportType: 'medical',
    flagCode: 'it',
    period: {
      start: '1951.11',
      end: '1955.1'
    },
    contributions: '적십자 야전병원 의료진을 파견했다. 약 300명의 의료진이 참여했다.',
    background: '남유럽에 위치한 공화국으로, 제2차 세계대전 패전국이었지만 인도주의적 목적으로 의료 지원을 결정했다.',
    relationship: '6.25 전쟁 당시 의료지원을 통해 한국과 인연을 맺었으며, 이후 문화, 패션, 자동차 등 다양한 분야에서 교류가 이루어지고 있다.'
  },
  {
    id: 'germany',
    nameKo: '독일(서독)',
    nameEn: 'West Germany',
    supportType: 'medical',
    flagCode: 'de',
    period: {
      start: '1954.3',
      end: '1959.3'
    },
    contributions: '적십자 병원을 파견했다. 부산에 설치되었으며, 주로 재활 치료와 의학 교육에 기여했다.',
    background: '제2차 세계대전 패전국으로 당시에는 동서독으로 분단된 상태였다. 서독은 국제사회로의 복귀를 위해 인도주의적 지원을 결정했다.',
    relationship: '6.25 전쟁 당시 의료지원을 통해 한국과 인연을 맺었으며, 이후 통일 경험 공유, 과학기술, 자동차 등 다양한 분야에서 긴밀한 협력이 이루어지고 있다.'
  },
  {
    id: 'ethiopia',
    nameKo: '에티오피아',
    nameEn: 'Ethiopia',
    supportType: 'combat',
    flagCode: 'et',
    troops: 3518,
    period: {
      start: '1951.5.7',
      end: '1965.1'
    },
    casualties: {
      killed: 122,
      wounded: 536,
      missing: 0
    },
    contributions: '연인원 약 3,518명의 1개 보병대대 \'칵뉴부대\'를 파병했다. 아프리카에서 유일하게 전투병을 파견한 국가이다.',
    background: '아프리카 동부에 위치한 고대 문명국으로, 하일레 셀라시에 황제의 결단으로 참전을 결정했다.',
    relationship: '6.25 전쟁 참전을 계기로 한국과 특별한 관계를 맺었으며, 이후 개발협력 등의 분야에서 교류가 이어지고 있다.'
  },
];