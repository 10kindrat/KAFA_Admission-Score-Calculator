// ============================================================
// calculator.js — 내신 계산 로직
// ============================================================

const Calculator = (() => {

  const SEMESTERS = [
    { id: 's1_1', label: '1학년 1학기' },
    { id: 's1_2', label: '1학년 2학기' },
    { id: 's2_1', label: '2학년 1학기' },
    { id: 's2_2', label: '2학년 2학기' },
    { id: 's3_1', label: '3학년 1학기' },
    { id: 's3_2', label: '3학년 2학기 (졸업생)' },
  ];

  let subjects = {};
  let studentType = 'current';

  function createSubject(name='', grade=2, unit=3) { return { name, grade, unit }; }

  function init() {
    SEMESTERS.filter(s=>s.id!=='s3_2').forEach(s => { subjects[s.id] = [createSubject()]; });
    renderAll();
    document.getElementById('student-type')?.addEventListener('change', e => {
      studentType = e.target.value;
      toggleGradSem();
    });
  }

  function toggleGradSem() {
    const block = document.getElementById('semester-s3_2');
    if (!block) return;
    if (studentType === 'graduate') {
      block.style.display = 'block';
      if (!subjects['s3_2']) subjects['s3_2'] = [createSubject()];
    } else {
      block.style.display = 'none';
      delete subjects['s3_2'];
    }
  }

  function renderAll() {
    const container = document.getElementById('gpa-semesters');
    if (!container) return;
    container.innerHTML = '';
    SEMESTERS.forEach(sem => {
      const block = buildSemBlock(sem);
      if (sem.id === 's3_2') {
        block.id = 'semester-s3_2';
        block.style.display = studentType === 'graduate' ? 'block' : 'none';
      }
      container.appendChild(block);
    });
  }

  function buildSemBlock(sem) {
    if (!subjects[sem.id]) subjects[sem.id] = [createSubject()];
    const block = document.createElement('div');
    block.className = 'card';
    block.style.marginBottom = '14px';
    block.innerHTML = `
      <div class="flex-between" style="margin-bottom:10px">
        <div class="card-title" style="margin-bottom:0;font-size:14px">${sem.label}</div>
        <button class="btn btn-outline btn-sm" onclick="Calculator.addSubject('${sem.id}')">+ 추가</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 80px 72px 30px;gap:7px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid var(--border)">
        <span style="font-size:11px;font-weight:600;color:var(--muted)">과목명</span>
        <span style="font-size:11px;font-weight:600;color:var(--muted);text-align:center">등급</span>
        <span style="font-size:11px;font-weight:600;color:var(--muted);text-align:center">이수단위</span>
        <span></span>
      </div>
      <div id="rows-${sem.id}"></div>
    `;
    const rc = block.querySelector(`#rows-${sem.id}`);
    subjects[sem.id].forEach((_, i) => rc.appendChild(buildRow(sem.id, i)));
    return block;
  }

  function buildRow(semId, idx) {
    const s = subjects[semId][idx];
    const row = document.createElement('div');
    row.style = 'display:grid;grid-template-columns:1fr 80px 72px 30px;gap:7px;margin-bottom:7px;align-items:center';
    row.innerHTML = `
      <input type="text" placeholder="과목명" value="${s.name}" oninput="Calculator.update('${semId}',${idx},'name',this.value)" />
      <select onchange="Calculator.update('${semId}',${idx},'grade',+this.value)">
        ${[1,2,3,4,5,6,7,8,9].map(g=>`<option value="${g}"${g===s.grade?' selected':''}>${g}등급</option>`).join('')}
      </select>
      <input type="number" min="1" max="8" value="${s.unit}" oninput="Calculator.update('${semId}',${idx},'unit',+this.value||1)" />
      <button onclick="Calculator.removeSubject('${semId}',${idx})" style="width:28px;height:28px;border-radius:50%;background:#fce8e8;color:var(--red);border:none;cursor:pointer;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
    `;
    return row;
  }

  function update(semId, idx, key, val) {
    if (subjects[semId]?.[idx]) subjects[semId][idx][key] = val;
  }

  function addSubject(semId) {
    if (!subjects[semId]) subjects[semId] = [];
    subjects[semId].push(createSubject());
    renderAll();
  }

  function removeSubject(semId, idx) {
    subjects[semId].splice(idx, 1);
    if (!subjects[semId].length) subjects[semId] = [createSubject()];
    renderAll();
  }

  function calculate() {
    const type = document.getElementById('exam-type-calc')?.value || 'general';
    const scoreMap = KAFA.gpaScore[type === 'principal' ? 'principal' : 'general'];
    const activeSems = studentType === 'graduate'
      ? SEMESTERS.map(s=>s.id)
      : SEMESTERS.filter(s=>s.id!=='s3_2').map(s=>s.id);

    let totalScore = 0, totalUnits = 0, subjectCount = 0;
    let gradeSum = 0;

    activeSems.forEach(semId => {
      (subjects[semId] || []).forEach(s => {
        if (!s.name.trim() || !s.grade || !s.unit) return;
        totalScore += scoreMap[s.grade] * s.unit;
        gradeSum   += s.grade * s.unit;
        totalUnits += s.unit;
        subjectCount++;
      });
    });

    if (totalUnits === 0) { alert('하나 이상의 과목을 입력하세요.'); return null; }

    const avgScore = Math.round(totalScore / totalUnits * 100) / 100;
    const maxScore = type === 'principal' ? 200 : 100;
    const avgGrade = (gradeSum / totalUnits).toFixed(2);
    const pct = (avgScore / maxScore * 100).toFixed(1);
    const result = { avgScore, maxScore, avgGrade, pct, subjectCount, totalUnits, type };
    showResult(result);
    Storage.saveLastGPAResult(result);
    return result;
  }

  function showResult(r) {
    const box = document.getElementById('gpa-result');
    if (!box) return;
    const ag = parseFloat(r.avgGrade);
    let verdict, vClass, comment;
    if (ag<=1.5)      { verdict='최상위권'; vClass='verdict-safe';   comment='내신 측면에서는 모든 전형 지원 가능한 수준입니다.' }
    else if (ag<=2.2) { verdict='우수';    vClass='verdict-safe';   comment='우수한 성적입니다. 면접·체력을 함께 관리하세요.' }
    else if (ag<=3.0) { verdict='양호';    vClass='verdict-ok';     comment='양호한 수준. 일반우선 전형에서 1차시험으로 보완이 필요합니다.' }
    else if (ag<=4.0) { verdict='주의';    vClass='verdict-risk';   comment='내신 향상이 필요합니다. 남은 학기에 집중하세요.' }
    else              { verdict='위험';    vClass='verdict-danger'; comment='내신 개선이 시급합니다. 종합선발(수능) 병행 준비를 권장합니다.' }

    box.innerHTML = `
      <div class="flex" style="gap:14px;margin-bottom:12px;flex-wrap:wrap;align-items:flex-start">
        <div><div class="result-score-big">${r.avgScore}</div><div class="result-label">/ ${r.maxScore}점 만점</div></div>
        <div><div class="verdict ${vClass}">${verdict}</div><div class="text-muted mt8">가중평균 등급: <strong>${r.avgGrade}</strong></div></div>
      </div>
      <div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:${r.pct}%"></div></div>
      <div class="text-sm text-muted mt8">과목수 ${r.subjectCount}개 · 이수단위 합 ${r.totalUnits}</div></div>
      <div class="info info-blue" style="margin-top:10px;margin-bottom:0">${comment}</div>
    `;
    box.classList.add('show');
  }

  return { init, update, addSubject, removeSubject, calculate };
})();


// ============================================================
// fitness.js — 체력 점수 계산
// ============================================================

const Fitness = (() => {
  function calculate() {
    const isMale   = document.getElementById('fit-gender')?.value === 'male';
    const runMin   = parseInt(document.getElementById('run-min')?.value) || 0;
    const runSec   = parseInt(document.getElementById('run-sec')?.value) || 0;
    const situp    = parseInt(document.getElementById('situp-count')?.value) || 0;
    const pushup   = parseInt(document.getElementById('pushup-count')?.value) || 0;
    const totalSec = runMin * 60 + runSec;

    if (totalSec === 0 && situp === 0 && pushup === 0) { alert('기록을 입력해주세요.'); return null; }

    const runResult   = getRunScore(totalSec, isMale);
    const situpScore  = getSitupScore(situp, isMale);
    const pushupScore = getPushupScore(pushup, isMale);
    const total       = runResult.disqualified ? null : +(runResult.score + situpScore + pushupScore).toFixed(1);

    const r = { isMale, run:{min:runMin,sec:runSec,totalSec,score:runResult.score,disqualified:runResult.disqualified}, situp:{count:situp,score:situpScore}, pushup:{count:pushup,score:pushupScore}, total };
    showResult(r);
    Storage.saveFitness({ total, runScore: runResult.score, situpScore, pushupScore });
    return r;
  }

  function showResult(r) {
    const box = document.getElementById('fitness-result');
    if (!box) return;
    const pct = r.total ? (r.total/150*100).toFixed(1) : 0;
    let verdict='', vClass='';
    if (!r.run.disqualified && r.total) {
      if (r.total>=130)      { verdict='매우 우수'; vClass='verdict-safe'; }
      else if (r.total>=110) { verdict='우수';     vClass='verdict-safe'; }
      else if (r.total>=90)  { verdict='보통';     vClass='verdict-ok'; }
      else                   { verdict='미흡';     vClass='verdict-risk'; }
    }
    box.innerHTML = `
      <table class="tbl" style="margin-bottom:12px">
        <thead><tr><th>종목</th><th class="c">기록</th><th class="c">점수</th><th class="c">만점</th></tr></thead>
        <tbody>
          <tr><td>오래달리기</td><td class="c">${r.run.min}분 ${String(r.run.sec).padStart(2,'0')}초</td>
            <td class="c ${r.run.disqualified?'':'num'}" style="${r.run.disqualified?'color:var(--red);font-weight:700':''}">${r.run.disqualified?'불합격':r.run.score}</td><td class="c">65점</td></tr>
          <tr><td>윗몸일으키기</td><td class="c">${r.situp.count}개</td><td class="c num">${r.situp.score}</td><td class="c">45점</td></tr>
          <tr><td>팔굽혀펴기</td><td class="c">${r.pushup.count}개</td><td class="c num">${r.pushup.score}</td><td class="c">40점</td></tr>
          <tr style="background:var(--sky-light)"><td><strong>총점</strong></td><td class="c">—</td>
            <td class="c" style="font-size:20px;font-weight:900;color:var(--sky-dark)">${r.run.disqualified?'불합격':r.total}</td><td class="c"><strong>150점</strong></td></tr>
        </tbody>
      </table>
      ${r.total&&!r.run.disqualified?`
        <div class="flex" style="gap:10px;align-items:center;flex-wrap:wrap">
          <div class="verdict ${vClass}">${verdict}</div>
          <div class="text-muted text-sm">150점 기준 ${pct}%</div>
        </div>
        <div class="progress-wrap mt8"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>
      `:''}
      ${r.run.disqualified?`<div class="info info-red" style="margin-top:10px;margin-bottom:0">⛔ 오래달리기 기준 미달 — <strong>불합격</strong> 처리됩니다.<br>남자: 7분 32초 이상 / 여자: 7분 30초 이상이면 불합격입니다.</div>`:''}
    `;
    box.classList.add('show');
  }

  return { calculate };
})();


// ============================================================
// analysis.js — 합격 가능성 분석
// ============================================================

const Analysis = (() => {
  function calculate() {
    const examType     = document.getElementById('ana-exam-type')?.value || 'general';
    const exam1Raw     = parseFloat(document.getElementById('ana-exam1')?.value);
    const gpaRaw       = parseFloat(document.getElementById('ana-gpa')?.value);
    const fitRaw       = parseFloat(document.getElementById('ana-fitness')?.value);
    const interRaw     = parseFloat(document.getElementById('ana-interview')?.value);
    const hsatGrade    = document.getElementById('ana-hsat')?.value || '미제출';
    const gpaGradeRaw  = parseFloat(document.getElementById('ana-gpa-grade')?.value) || 3;
    const hasInterview = !isNaN(interRaw);

    const hsatBonus    = KAFA.hsat[hsatGrade] || 0;
    const exam1Score   = isNaN(exam1Raw) ? 0 : exam1Raw;
    const gpaScore     = isNaN(gpaRaw) ? 0 : gpaRaw;
    const fitScore     = isNaN(fitRaw) ? 0 : fitRaw;
    const interScore   = hasInterview ? interRaw : 0;

    let myTotal = 0, breakdown = [];

    if (examType === 'general') {
      myTotal = Math.min(exam1Score,300) + Math.min(fitScore,150) + (hasInterview?Math.min(interScore,450):0) + Math.min(gpaScore,100) + hsatBonus;
      breakdown = [
        {label:'1차시험',   score:Math.min(exam1Score,300), max:300},
        {label:'학생부',    score:Math.min(gpaScore,100),   max:100},
        {label:'체력검정',  score:Math.min(fitScore,150),   max:150},
        {label:'면접',      score:hasInterview?Math.min(interScore,450):'미입력', max:450},
        {label:'한국사 가산',score:hsatBonus,                max:5},
      ];
    } else if (examType === 'principal') {
      myTotal = Math.min(fitScore,150) + (hasInterview?Math.min(interScore,650):0) + Math.min(gpaScore,200) + hsatBonus;
      breakdown = [
        {label:'학생부',    score:Math.min(gpaScore,200),   max:200},
        {label:'체력검정',  score:Math.min(fitScore,150),   max:150},
        {label:'면접',      score:hasInterview?Math.min(interScore,650):'미입력', max:650},
        {label:'한국사 가산',score:hsatBonus,                max:5},
      ];
    } else {
      const csatRaw = parseFloat(document.getElementById('ana-csat')?.value)||0;
      myTotal = Math.min(fitScore,150) + (hasInterview?Math.min(interScore,450):0) + Math.min(csatRaw,400);
      breakdown = [
        {label:'체력검정',  score:Math.min(fitScore,150), max:150},
        {label:'면접',      score:hasInterview?Math.min(interScore,450):'미입력', max:450},
        {label:'수능',      score:Math.min(csatRaw,400),  max:400},
      ];
    }

    let verdict, vClass, advice, recType;
    if (!hasInterview) {
      const nonInterMax = examType==='general'?550:examType==='principal'?350:550;
      const r = myTotal/nonInterMax;
      if (r>=0.88)      { verdict='안정권 가능성'; vClass='verdict-safe'; }
      else if (r>=0.75) { verdict='적정권';        vClass='verdict-ok'; }
      else if (r>=0.60) { verdict='주의';          vClass='verdict-risk'; }
      else              { verdict='위험';          vClass='verdict-danger'; }
      advice = '⚠️ 면접 미포함 예비 분석입니다. 면접(450~650점)이 최대 배점이므로 참고용으로만 활용하세요.';
    } else {
      if (myTotal>=880)      { verdict='안정권'; vClass='verdict-safe'; }
      else if (myTotal>=780) { verdict='적정권'; vClass='verdict-ok'; }
      else if (myTotal>=670) { verdict='주의권'; vClass='verdict-risk'; }
      else                   { verdict='위험권'; vClass='verdict-danger'; }
      advice = '실제 커트라인은 해당 연도 지원자 수준에 따라 달라집니다. 반드시 참고용으로만 활용하세요.';
    }

    if (gpaGradeRaw<=2.0)      recType = '📋 고교학교장추천 전형 우선 고려 (학생부 200점 배점)';
    else if (gpaGradeRaw<=3.5) recType = '📋 일반우선 전형 + 종합선발(수능) 병행 준비 권장';
    else                       recType = '📋 내신 향상 후 일반우선 전형 / 수능 집중 준비 권장';

    showResult({ myTotal, verdict, vClass, advice, recType, breakdown, hasInterview });
  }

  function showResult(r) {
    const box = document.getElementById('analysis-result');
    if (!box) return;
    box.innerHTML = `
      <div class="flex" style="gap:14px;margin-bottom:14px;flex-wrap:wrap;align-items:flex-start">
        <div><div class="result-score-big">${Math.round(r.myTotal)}</div><div class="result-label">/ 1,000점 기준</div></div>
        <div class="verdict ${r.vClass}">${r.verdict}</div>
      </div>
      <table class="tbl" style="margin-bottom:12px">
        <thead><tr><th>항목</th><th class="c">내 점수</th><th class="c">만점</th></tr></thead>
        <tbody>${r.breakdown.map(b=>`<tr><td>${b.label}</td><td class="c ${typeof b.score==='number'?'num':''}">${b.score}</td><td class="c">${b.max}점</td></tr>`).join('')}</tbody>
      </table>
      <div class="info info-gold" style="margin-bottom:8px">${r.advice}</div>
      <div class="info info-blue" style="margin-bottom:0">${r.recType}</div>
    `;
    box.classList.add('show');
  }

  return { calculate };
})();


// ============================================================
// storage.js
// ============================================================

const Storage = (() => {
  const s = (k,d) => { try { localStorage.setItem(k,JSON.stringify(d)); } catch(e){} };
  const l = (k)   => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch(e){return null;} };
  return {
    saveLastGPAResult: d => s('cc_gpar',d),
    getLastGPAResult:  ()=> l('cc_gpar'),
    saveFitness:       d => s('cc_fit',d),
    loadFitness:       ()=> l('cc_fit'),
    saveAnalysis:      d => s('cc_ana',d),
  };
})();


// ============================================================
// tabs.js
// ============================================================

const Tabs = (() => {
  function init(navSel, panelSel) {
    const btns   = document.querySelectorAll(navSel);
    const panels = document.querySelectorAll(panelSel);
    function activate(target) {
      btns.forEach(b=>b.classList.toggle('active', b.dataset.tab===target));
      panels.forEach(p=>p.classList.toggle('active', p.id===target));
    }
    btns.forEach(b => b.addEventListener('click', () => {
      activate(b.dataset.tab);
      history.replaceState(null,'',`#${b.dataset.tab}`);
    }));
    const hash = location.hash.replace('#','');
    const found = [...btns].find(b=>b.dataset.tab===hash);
    if (found) activate(hash);
    else if (btns[0]) activate(btns[0].dataset.tab);
  }
  return { init };
})();


// ============================================================
// body-check 헬퍼
// ============================================================

function checkBody() {
  const heightRaw = parseFloat(document.getElementById('body-height')?.value);
  const weightRaw = parseFloat(document.getElementById('body-weight')?.value);
  const division  = document.getElementById('body-division')?.value || 'pilot';
  const gender    = document.getElementById('body-gender')?.value   || 'male';
  const vision    = document.getElementById('body-vision')?.value   || 'normal';
  const box       = document.getElementById('body-result');
  if (!box) return;

  if (isNaN(heightRaw)||isNaN(weightRaw)) { alert('키와 몸무게를 입력해주세요.'); return; }

  const heightInt = Math.floor(heightRaw);
  const bmi = heightRaw>0 ? (weightRaw/(heightRaw/100)**2) : 0;
  const bmiFloor = Math.floor(bmi*10)/10; // 소수점 둘째자리 이하 버림

  let lines = [];

  if (division === 'pilot') {
    // 조종: 신장 162~196, BMI 19~27.5
    if (heightRaw < 162 || heightRaw > 196) {
      lines.push({ cls:'info-red', text:`⛔ 조종분야 신장 기준(162~196cm) 미달/초과입니다. 신장 ${heightRaw}cm는 불합격 기준입니다.` });
    } else {
      const entry = BODY_PILOT.table[heightInt];
      if (entry) {
        const [minW, maxW] = entry;
        if (weightRaw < minW)      lines.push({ cls:'info-red',   text:`⛔ 체중 미달입니다. ${heightInt}cm 기준 최소 ${minW}kg 이상이어야 합니다. (현재 ${weightRaw}kg)` });
        else if (weightRaw > maxW) lines.push({ cls:'info-red',   text:`⛔ 체중 초과입니다. ${heightInt}cm 기준 최대 ${maxW}kg 이하이어야 합니다. (현재 ${weightRaw}kg)` });
        else                       lines.push({ cls:'info-green', text:`✅ 조종분야 신장·체중 기준을 충족합니다. (${heightInt}cm 기준 ${minW}~${maxW}kg)` });
      }
    }
  } else {
    // 비조종: BMI 등급 판정
    const minH = gender==='male' ? 159 : 152;
    const maxH = gender==='male' ? 204 : 185;
    if (heightRaw < minH || heightRaw > maxH) {
      lines.push({ cls:'info-red', text:`⛔ 비조종분야 신장 기준(${minH}~${maxH}cm) 미달/초과입니다.` });
    } else {
      let grade = '';
      if (bmiFloor>=20&&bmiFloor<25)       grade='1급';
      else if (bmiFloor>=18.5&&bmiFloor<20) grade='2급';
      else if (bmiFloor>=25&&bmiFloor<30)  grade='2급';
      else if (bmiFloor>=17&&bmiFloor<18.5) grade='3급';
      else if (bmiFloor>=30&&bmiFloor<33)  grade='3급';
      else                                  grade='4급(불합격 가능)';
      const gradeClass = grade.startsWith('1')?'info-green':grade.startsWith('4')?'info-red':'info-gold';
      lines.push({ cls: gradeClass, text:`BMI ${bmiFloor.toFixed(1)} → 신체등급 <strong>${grade}</strong>` });
    }
  }

  // 시력 안내
  if (vision==='below04') {
    lines.push({ cls:'info-gold', text:'👁 나안시력 0.4 이하: 굴절교정술 조건부 합격 가능 (교정시력 1.0 이상, 굴절 ±6.50D 이하 등 조건 충족 필요)' });
  } else if (vision==='corrected') {
    lines.push({ cls:'info-blue', text:'👓 교정시력 1.0 이상: 조종분야 합격 가능 기준입니다. 신체검사 전 렌즈 제거 기간을 반드시 준수하세요.' });
  } else {
    lines.push({ cls:'info-green', text:'👁 나안시력 정상 범위입니다.' });
  }

  box.innerHTML = `
    <div class="disclaimer" style="margin-bottom:12px">⚠️ 이 판정은 공식 신체검사가 아닙니다. 참고용으로만 활용하며, 실제 합격 여부는 공군사관학교 공식 신체검사 결과로 결정됩니다.</div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:10px">BMI: ${bmiFloor.toFixed(2)} (신장 ${heightRaw}cm / 체중 ${weightRaw}kg)</div>
    ${lines.map(l=>`<div class="info ${l.cls}" style="margin-bottom:8px">${l.text}</div>`).join('')}
  `;
  box.classList.add('show');
}
