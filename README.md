# Cadet Compass

사관학교 입시 준비생을 위한 **입시 분석 & 정보 플랫폼**

현재 공군사관학교를 중심으로 개발 중이며,  
향후 육군사관학교 / 해군사관학교 / 국군간호사관학교까지 확장 예정입니다.

---

## 🔗 Live Demo
https://10kindrat.github.io/KAFA_Admission-Score-Calculator/

---

## 🎯 프로젝트 목적

사관학교 입시는 일반 대학 입시와 달리:

- 체력 점수 존재
- 1차 시험 존재
- 신체 조건 기준 존재
- 전형 구조 복잡
- 정보가 흩어져 있음

➡ 이를 한 곳에서 계산 + 분석 + 정리할 수 있는 플랫폼을 만들기 위해 시작했습니다.

---

## ⚙️ 주요 기능

### 📊 1. 입시 점수 계산기
- 내신 점수 환산
- 체력 점수 계산
- 1차 시험 점수 입력
- 최종 합산 점수 계산

---

### 📈 2. 합격 가능성 분석
- 점수 기반 자동 분류
  - 안정권
  - 적정권
  - 위험권
  - 도전권
- 전형별 추천 분석

---

### 🏃 3. 체력 점수 시스템
- 1.5km 달리기
- 팔굽혀펴기
- 윗몸일으키기
- 종목별 점수 및 총점 계산

---

### 📅 4. 입시 정보 페이지
- 모집 일정
- 전형 구조
- 시험 범위
- 신체 기준
- FAQ

---

## 📊 추가 기능 (UI/UX 라이브러리)

프로젝트에는 다음 라이브러리를 활용 예정입니다:

- 📊 Chart.js → 점수 시각화
- 🎞 AOS → 스크롤 애니메이션
- 🔔 Toastify → 알림 UI
- 💬 Tippy.js → 설명 툴팁
- 📅 FullCalendar → 일정 캘린더

---

## 🧠 기술 스택

- HTML5
- CSS3
- JavaScript (Vanilla)
- GitHub Pages

---

## 📁 프로젝트 구조

```text
index.html
calculator.html
info.html

/css
  main.css
  calculator.css
  info.css

/js
  calculator.js
  fitness.js
  analysis.js
  storage.js

/data
  kafaData.js
  fitnessData.js
  scheduleData.js

/assets
  icons/
  images/
