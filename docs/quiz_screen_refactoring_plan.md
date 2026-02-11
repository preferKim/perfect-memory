# 퀴즈 화면 공통화 설계안 (v2)

> 작성일: 2026-02-11
> 대상: CertificateQuizScreen, MathGameScreen, ScienceQuizScreen, SocialQuizScreen

## 핵심 결정 사항

| 항목 | 결정 |
|------|------|
| **데이터 포맷** | Type 1(`{ problem, options, answer }`)로 통일 |
| **Science/Social 기존 데이터** | JSON 파일 삭제, DB에 Type 1 포맷으로 재입력 |
| **JSON fallback** | 모두 제거, Supabase 전용으로 전환 |
| **타이머** | 모든 과목 공통 사용 |
| **힌트 토글** | 모든 과목 공통 사용 |
| **즐겨찾기** | 모든 과목 공통 사용 |
| **MathRenderer** | 모든 과목 공통 적용 (이슈 없음 확인) |

---

## MathRenderer 호환성 분석

MathRenderer(`src/components/MathRenderer.jsx`)는 `$` 기호로 감싼 텍스트만 수식으로 변환합니다.
`$`가 없는 일반 텍스트는 그대로 `<span>`으로 렌더링되므로, 과학/사회/자격증 등 수식이 없는 과목에 적용해도 **아무런 부작용이 없습니다.**

---

## 통일 데이터 포맷 (Type 1)

모든 과목의 DB `content` 필드를 아래 형태로 통일합니다:

```json
{
  "problem": "다음 중 생물이 살아가기 위해 꼭 필요한 것이 아닌 것은?",
  "options": ["물", "공기", "장난감", "빛"],
  "answer": "장난감",
  "hint": "생명 유지와 관련 없는 물건을 찾아보세요.",
  "explanation": "장난감은 생존에 필수적인 요소가 아닙니다."
}
```

> **중요**: 기존 Science/Social JSON의 `answerOptions: [{text, isCorrect, rationale}]` 포맷은 폐기됩니다. 기존 데이터는 삭제 후 새 포맷으로 재입력합니다.

---

## 공통 `QuizScreen` 컴포넌트 설계

### 아키텍처

```
App.jsx (라우팅)
  ├── CertificateQuizPage ──┐
  ├── MathQuizPage ──────────┤
  ├── ScienceQuizPage ───────┼──→ QuizScreen (공통 컴포넌트)
  └── SocialQuizPage ────────┘        ├── MathRenderer
                                      ├── useLearningProgress
         각 Page는 config 객체를       └── usePlayer
         QuizScreen에 주입
```

### Config 인터페이스

각 과목 래퍼는 아래 Config를 생성하여 `QuizScreen`에 전달합니다:

```javascript
const config = {
  // 필수
  subject: 'math',                    // XP 카테고리 & 과목 식별자
  title: '수학 퀴즈',                  // 화면 상단 제목
  courseCode: 'math_elementary_1',     // Supabase 쿼리용 코드
  backPath: '/math',                  // 뒤로가기 경로 (string 또는 -1)
  
  // 데이터 로딩 (커스텀 로딩 함수, 기본값 제공)
  loadQuestions: async (getQuestions) => {
    return await getQuestions(courseCode, { limit: 20, shuffle: true });
  },
  
  // 선택적 설정 (기본값 포함)
  questionsPerRound: 10,              // 기본 10문제
  timerSeconds: 1800,                 // 기본 30분 (0이면 타이머 비활성화)
  scoreMultiplier: 10,                // 점수 배율
  optionColumns: 2,                   // 선택지 열 수 (1 or 2)
  showPassFail: false,                // 합격/불합격 표시
  passThreshold: 0.6,                 // 합격 기준 (60%)
};
```

### `QuizScreen` 내장 기능 (모든 과목 공통)

| 기능 | 설명 |
|------|------|
| **타이머** | 설정된 시간으로 카운트다운, 0이면 숨김 |
| **힌트 토글** | `hint` 필드가 있으면 자동으로 힌트 버튼 표시 |
| **즐겨찾기 (Star)** | 로그인 사용자에게 항상 표시 |
| **MathRenderer** | 모든 텍스트(문제, 선택지, 해설)에 적용 |
| **Progress Bar** | 진행률 표시 |
| **자동 스크롤** | 해설 영역으로 자동 스크롤 |
| **세션 기록** | `startSession` / `endSession` / `recordAnswer` |
| **다시 풀기** | 결과 화면에서 재시작 |

---

## 각 과목별 래퍼 (최소 코드)

### CertificateQuizPage (~50줄)
가장 복잡한 래퍼. AWS/정보처리/전과목 등 `loadQuestions` 분기 로직을 포함합니다.

```javascript
const CertificateQuizPage = () => {
  const location = useLocation();
  const { subjectId } = location.state || { subjectId: 1 };
  
  // 과목별 courseCode, timer, questionsPerRound 결정
  const config = useMemo(() => {
    if (typeof subjectId === 'string' && subjectId.startsWith('AWS_')) {
      return {
        subject: 'certificate',
        title: `AWS 자격증`,
        courseCode: awsCourseMap[subjectId],
        backPath: '/certificate',
        timerSeconds: 3600,    // 1시간
        questionsPerRound: 20,
        showPassFail: true,
        loadQuestions: async (getQuestions) => { /* AWS 로직 */ },
      };
    }
    if (subjectId === 'all') {
      return { /* 전과목 로직: 5개 레벨에서 각 20문제 */ };
    }
    return { /* 단일 과목 로직 */ };
  }, [subjectId]);

  return <QuizScreen config={config} />;
};
```

### MathQuizPage (~25줄)

```javascript
const MathQuizPage = () => {
  const location = useLocation();
  const { difficulty, topicLevel } = location.state || {};
  
  const courseCode = difficulty === 'jsj50day'
    ? `math_jsj50day_${topicLevel}`
    : `math_${difficulty}_${topicLevel}`;

  return (
    <QuizScreen config={{
      subject: 'math',
      title: '수학 퀴즈',
      courseCode,
      backPath: difficulty === 'jsj50day' ? '/math/seungje' : -1,
      questionsPerRound: 10,
      timerSeconds: 1800,
      optionColumns: 2,
    }} />
  );
};
```

### ScienceQuizPage / SocialQuizPage (~15줄 각각)

```javascript
const ScienceQuizPage = () => {
  const { difficulty } = useParams();
  const difficultyMap = { easy: '초등', medium: '중등', hard: '고등' };

  return (
    <QuizScreen config={{
      subject: 'science',
      title: `과학 퀴즈 (${difficultyMap[difficulty]})`,
      courseCode: `science_${difficulty}`,
      backPath: '/science',
      questionsPerRound: 10,
      timerSeconds: 1800,
      optionColumns: 2,
    }} />
  );
};
```

---

## 파일 변경 목록

### 신규 생성

| 파일 | 설명 |
|------|------|
| `src/components/QuizScreen.jsx` | 공통 퀴즈 컴포넌트 (~350줄) |
| `src/screens/CertificateQuizPage.jsx` | Certificate 래퍼 (~50줄) |
| `src/screens/MathQuizPage.jsx` | Math 래퍼 (~25줄) |
| `src/screens/ScienceQuizPage.jsx` | Science 래퍼 (~15줄) |
| `src/screens/SocialQuizPage.jsx` | Social 래퍼 (~15줄) |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/App.jsx` | import 경로 변경 (4개) |

> **주의**: `fetchFromJson` 함수는 `GameScreen.jsx`(영어 퀴즈)에서 사용 중이므로 **제거하지 않습니다.** `useLearningContent.js`는 수정 불필요합니다.

### 삭제

| 파일 | 이유 |
|------|------|
| `src/screens/CertificateQuizScreen.jsx` | QuizScreen으로 대체 |
| `src/screens/MathGameScreen.jsx` | QuizScreen으로 대체 |
| `src/screens/ScienceQuizScreen.jsx` | QuizScreen으로 대체 |
| `src/screens/SocialQuizScreen.jsx` | QuizScreen으로 대체 |

### JSON 파일 정리

기존 JSON 파일은 삭제하되, 향후 문제 자동생성 시 참고할 수 있도록 **과목별 sample 파일**을 보존합니다:

| 보존 파일 | 원본 | 용도 |
|----------|------|------|
| `public/words/samples/science_sample.json` | `science_easy.json`에서 3~5문제 발췌 | 과학 문제 생성 포맷 참고용 |
| `public/words/samples/social_sample.json` | `social_easy.json`에서 3~5문제 발췌 | 사회 문제 생성 포맷 참고용 |
| `public/words/samples/math_sample.json` | `math_easy.json`에서 3~5문제 발췌 | 수학 문제 생성 포맷 참고용 |
| `public/words/samples/certificate_sample.json` | 기존 자격증 문제에서 3~5문제 발췌 | 자격증 문제 생성 포맷 참고용 |

> **참고**: sample 파일은 **Type 1 통일 포맷**(`{ problem, options, answer, hint, explanation }`)으로 작성하여, 향후 AI 문제 생성 시 프롬프트에 바로 활용할 수 있도록 합니다.

삭제 대상:

| 파일 | 이유 |
|------|------|
| `public/words/science_easy.json` | sample로 대체 |
| `public/words/science_medium.json` | sample로 대체 |
| `public/words/science_hard.json` | sample로 대체 |
| `public/words/social_easy.json` | sample로 대체 |
| `public/words/social_medium.json` | sample로 대체 |
| `public/words/social_hard.json` | sample로 대체 |
| `public/words/math_*.json` (해당되는 경우) | sample로 대체 |

---

## 코드량 비교

| 지표 | Before | After |
|------|--------|-------|
| **총 라인** | ~1,354줄 (4파일) | ~455줄 (5파일) |
| **중복률** | ~75% | ~0% |
| **새 과목 추가 비용** | ~300줄 복붙 | ~15줄 Config |
| **버그 수정** | 4군데 수정 | 1군데 수정 |

---

## 구현 순서

> 점진적 마이그레이션을 권장합니다. 한 화면씩 전환하며 동작 확인 후 다음으로 진행합니다.

1. **`QuizScreen.jsx` 공통 컴포넌트 생성**
   - State 관리, 핵심 로직, UI 구조 구현
   - 타이머, 힌트 토글, 즐겨찾기, MathRenderer 내장

2. **SocialQuizPage 전환** (가장 단순)
   - `SocialQuizPage.jsx` 래퍼 생성
   - `App.jsx` import 변경
   - 동작 확인

3. **ScienceQuizPage 전환** (Social과 동일 구조)

4. **MathQuizPage 전환**
   - courseCode 분기 로직 포함

5. **CertificateQuizPage 전환** (가장 복잡)
   - AWS/정보처리/전과목 분기 로직 포함

6. **정리**
   - 기존 4개 Screen 파일 삭제
   - JSON 파일 정리 (sample 생성 후 원본 삭제)

> **주의**: Science/Social 데이터 재입력은 별도 작업입니다. 공통 컴포넌트 전환과 분리하여 진행하는 것이 안전합니다. 공통 컴포넌트가 먼저 완성된 후, 데이터 마이그레이션 스크립트를 작성하여 DB에 Type 1 포맷으로 입력합니다.
