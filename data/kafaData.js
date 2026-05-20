// ============================================================
//  KAFA DATA  —  2027학년도 제79기 공군사관생도 모집요강 기준
// ============================================================

const KAFA = {
  year: 2027, generation: 79,
  quota: {
    total: 235,
    priority: { ratio: 0.80, count: 188 },
    final:    { ratio: 0.20, count: 47  },
    types: {
      general:   { name: '일반우선 전형',           count: 81 },
      principal: { name: '고교학교장추천 전형',      count: 82 },
      special1:  { name: '특별전형Ⅰ',               count: 15 },
      special2:  { name: '특별전형Ⅱ (우주·신기술)', count: 10 },
    }
  },
  scoring: {
    general:   { exam1:300,  physical:'합/불', fitness:150, interview:450, gpa:100, total:1000, bonus:5 },
    principal: { exam1:'합/불', physical:'합/불', fitness:150, interview:650, gpa:200, total:1000, bonus:5 },
    final:     { exam1:'합/불', physical:'합/불', fitness:150, interview:450, suneung:400, total:1000 },
  },
  // 등급별 점수표 (index 0 미사용, 1~9등급)
  gpaGradeScore: {
    general:   [null,100,97,94,91,88,85,82,79,76],
    principal: [null,200,194,188,182,176,170,164,158,152],
  },
  koreanHistoryBonus: { '심화1급':5, '심화2급':3.5, '심화3급':2, '미제출':0 },
  exam1Subjects: {
    korean:  { name:'국어', score:100, time:50,  questions:30, range:'독서·문학 (공통)' },
    english: { name:'영어', score:100, time:50,  questions:30, range:'영어Ⅰ·Ⅱ (듣기 제외)' },
    math:    { name:'수학', score:100, time:100, questions:30, range:'수학Ⅰ·Ⅱ + 선택과목' },
  },
};

const ANALYSIS_THRESHOLD = {
  general:   { safe:850, target:750, risky:650 },
  principal: { safe:870, target:780, risky:680 },
};
