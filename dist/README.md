# 🎨 AI 차트 생성기 - IBChart 스타일

OpenAI API를 활용하여 데이터를 분석하고 IBChart 스타일의 아름다운 차트를 자동으로 생성하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **다양한 파일 형식 지원**: 이미지, 엑셀, PDF 등 모든 형식의 파일 업로드 가능
- **AI 기반 데이터 분석**: OpenAI GPT-4를 사용한 지능형 데이터 분석
- **IBChart 스타일 적용**: 전문적인 차트 디자인과 색상 스키마
- **차트 타입 선택**: 막대, 선, 파이, 영역 차트 등 다양한 차트 타입 지원
- **스타일 옵션**: 컬러 및 모노크롬(그레이) 스타일 선택
- **실시간 수정**: 피드백을 통한 차트 수정 및 재생성
- **이미지 다운로드**: 생성된 차트를 PNG 이미지로 다운로드

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. OpenAI API 키 설정

환경변수로 OpenAI API 키를 설정하세요:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

또는 `.env` 파일을 생성하여 설정:

```bash
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```

### 3. 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

서버가 실행되면 `http://localhost:3000`에서 애플리케이션에 접근할 수 있습니다.

## 📁 프로젝트 구조

```
chart-generator/
├── public/
│   └── index.html          # 메인 웹 페이지
├── uploads/                 # 업로드된 파일 저장소
├── generated-charts/        # 생성된 차트 HTML 파일들
├── server.js               # Express 서버 및 API
├── package.json            # 프로젝트 의존성
└── README.md              # 프로젝트 설명서
```

## 🎯 사용 방법

### 1. 파일 업로드
- 파일 선택 버튼을 클릭하거나 드래그 앤 드롭으로 파일을 업로드
- 이미지, 엑셀, PDF 등 모든 형식의 파일 지원

### 2. 차트 설정
- **차트 타입**: 드롭다운에서 선택하거나 직접 입력
- **스타일**: 컬러 또는 모노크롬(그레이) 선택

### 3. 차트 생성
- "차트 만들기" 버튼을 클릭하여 AI가 데이터를 분석하고 차트 생성
- 생성된 차트는 하단에 표시됩니다

### 4. 차트 수정
- 피드백 섹션에 수정 의견을 입력
- "차트 수정하기" 버튼을 클릭하여 수정된 차트 생성

### 5. 이미지 다운로드
- 생성된 차트의 "차트 이미지 다운로드" 버튼을 클릭하여 PNG 이미지로 다운로드

## 🔧 기술 스택

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI**: OpenAI GPT-4 API
- **차트 라이브러리**: ECharts
- **파일 업로드**: Multer
- **스타일링**: CSS Grid, Flexbox, CSS Variables

## 📊 지원하는 차트 타입

- **막대 차트 (Bar Chart)**: 범주별 데이터 비교
- **선 차트 (Line Chart)**: 시간에 따른 변화 추이
- **파이 차트 (Pie Chart)**: 전체 대비 비율 표시
- **영역 차트 (Area Chart)**: 누적 데이터 시각화
- **사용자 정의**: 원하는 차트 타입을 직접 입력

## 🎨 스타일 옵션

- **컬러**: 밝고 생동감 있는 컬러 스키마
- **모노크롬**: 전문적이고 깔끔한 그레이 톤 스키마

## 🔒 보안 고려사항

- 업로드된 파일은 서버의 `uploads/` 디렉토리에 임시 저장
- 생성된 차트는 `generated-charts/` 디렉토리에 저장
- OpenAI API 키는 환경변수로 관리하여 보안 강화

## 🐛 문제 해결

### OpenAI API 오류
- API 키가 올바르게 설정되었는지 확인
- API 사용량 한도 확인
- 네트워크 연결 상태 확인

### 파일 업로드 오류
- 파일 크기 제한 확인
- 파일 형식 지원 여부 확인
- 서버 디렉토리 권한 확인

### 차트 생성 오류
- 데이터 분석 결과 확인
- 차트 타입 설정 확인
- 브라우저 콘솔 오류 메시지 확인

## 📝 라이선스

MIT License

## 🤝 기여하기

1. 이 저장소를 포크
2. 새로운 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**AI 차트 생성기**로 아름다운 데이터 시각화를 경험해보세요! 🎉
