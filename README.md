# 🚀 Simple Todo App

Next.js, TypeScript, Tailwind CSS로 개발된 현대적이고 사용하기 쉬운 할 일 관리 애플리케이션입니다.

![Todo App Screenshot](docs/images/app-preview.png)

## ✨ 주요 기능

### 📋 **할 일 관리**
- ✅ 할 일 추가, 수정, 삭제
- 🔄 완료 상태 토글
- ✏️ 인라인 편집 (더블클릭 또는 Enter키)
- 🎯 실시간 진행률 표시

### 🎨 **스마트 필터링**
- 📂 전체 / 진행 중 / 완료됨 필터
- 🧹 완료된 할 일 일괄 정리
- 📊 실시간 통계 및 진행률

### 💾 **데이터 관리**
- 📤 **내보내기**: JSON, CSV, TXT 형식 지원
- 📥 **가져오기**: 드래그 앤 드롭 파일 업로드
- 🔍 **실시간 검증**: 가져오기 시 데이터 유효성 검사
- 🏪 **로컬 저장소**: 브라우저에 자동 저장

### 🎭 **사용자 경험**
- 🌟 **부드러운 애니메이션**: Framer Motion 기반
- ♿ **완벽한 접근성**: 키보드 탐색, 스크린 리더 지원
- 📱 **반응형 디자인**: 모든 디바이스에서 완벽 동작
- 🚨 **오류 처리**: 우아한 오류 경계 및 복구

### 🔧 **고급 기능**
- 🌐 **최신 브라우저 API**: File System Access API 지원
- 📦 **성능 최적화**: 컴포넌트 메모화, 코드 분할
- 🛡️ **타입 안전성**: 완전한 TypeScript 지원

## 🚀 빠른 시작

### 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone https://github.com/your-username/simple-todo-app.git
cd simple-todo-app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📖 사용법

### 1️⃣ **할 일 추가**
1. 상단의 입력 필드에 할 일을 입력하세요
2. Enter키를 누르거나 "추가" 버튼을 클릭하세요
3. 새로운 할 일이 목록에 나타납니다

### 2️⃣ **할 일 관리**
- **완료 처리**: 체크박스를 클릭하여 완료/미완료 토글
- **편집**: 할 일 텍스트를 더블클릭하거나 Enter키로 편집 모드 진입
- **삭제**: 휴지통 아이콘을 클릭하여 삭제

### 3️⃣ **필터링 및 정리**
- **필터**: "전체", "진행 중", "완료됨" 버튼으로 할 일 필터링
- **정리**: "완료됨 정리" 버튼으로 완료된 할 일 일괄 삭제
- **진행률**: 상단에서 전체 진행률 확인

### 4️⃣ **데이터 가져오기/내보내기**

#### **내보내기**
1. 우상단의 설정(⚙️) 버튼 클릭
2. "데이터 내보내기" 선택
3. 원하는 형식 선택 (JSON/CSV/TXT)
4. 내보내기 옵션 설정:
   - 메타데이터 포함
   - 완료된 할 일 포함
   - 생성 날짜 포함
   - 읽기 쉬운 형식
5. "내보내기" 버튼 클릭

#### **가져오기**
1. 우상단의 설정(⚙️) 버튼 클릭
2. "데이터 가져오기" 선택
3. 파일을 드래그 앤 드롭하거나 "파일 선택" 클릭
4. 데이터 검증 결과 확인
5. "가져오기" 버튼 클릭

## ⌨️ 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Enter` | 할 일 추가 (입력 필드에서) |
| `Enter` | 편집 모드 진입 (할 일에서) |
| `Escape` | 편집 취소 |
| `Tab` | 다음 요소로 이동 |
| `Shift + Tab` | 이전 요소로 이동 |
| `Space` | 체크박스 토글 (포커스 시) |

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **애니메이션**: Framer Motion
- **아이콘**: Heroicons
- **저장소**: localStorage
- **테스팅**: Jest, React Testing Library

## 📁 프로젝트 구조

```
simple-todo-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 글로벌 스타일
├── components/            # React 컴포넌트
│   ├── TodoForm.tsx       # 할 일 입력 폼
│   ├── TodoList.tsx       # 할 일 목록
│   ├── TodoItem.tsx       # 개별 할 일
│   ├── TodoFilter.tsx     # 필터 컴포넌트
│   ├── ImportExportMenu.tsx # 가져오기/내보내기 메뉴
│   ├── ExportModal.tsx    # 내보내기 모달
│   ├── ImportModal.tsx    # 가져오기 모달
│   └── ErrorBoundary.tsx  # 오류 경계
├── hooks/                 # 커스텀 훅
│   └── useTodos.tsx       # 할 일 상태 관리
├── lib/                   # 유틸리티 및 타입
│   ├── types.ts           # TypeScript 타입
│   ├── storage.ts         # 저장소 서비스
│   └── utils.ts           # 헬퍼 함수
└── __tests__/            # 테스트 파일
```

## 🔧 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 테스트 실행
npm run test

# 테스트 (watch 모드)
npm run test:watch

# 린팅
npm run lint
```

## 🌐 브라우저 지원

- ✅ Chrome 80+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 80+

**고급 기능 (File System Access API)**:
- ✅ Chrome 86+
- ❌ Firefox (폴백 방식 사용)
- ❌ Safari (폴백 방식 사용)

## 🚀 배포

이 애플리케이션은 다양한 플랫폼에 배포할 수 있습니다. 각 플랫폼별 배포 방법을 안내합니다.

### 🌟 Vercel (추천)

가장 간단하고 권장되는 배포 방법입니다.

#### 자동 배포
```bash
# Vercel CLI 설치 (처음 한 번만)
npm i -g vercel

# 배포
npm run deploy
```

#### GitHub 연동 배포
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 자동 설정 확인 후 "Deploy" 클릭
5. 완료! 자동으로 도메인이 할당됩니다

#### 환경 변수 설정
Vercel Dashboard에서 다음 환경 변수를 설정하세요:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="Simple Todo App"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### 🔧 기타 플랫폼

#### Netlify
```bash
# 빌드
npm run build

# netlify CLI로 배포
npx netlify deploy --prod --dir=out
```

#### GitHub Pages
1. `.github/workflows/deploy.yml` 파일이 이미 준비되어 있습니다
2. Repository Settings > Pages에서 "GitHub Actions" 선택
3. `main` 브랜치에 push하면 자동 배포됩니다

#### 커스텀 서버
```bash
# 프로덕션 빌드
npm run build

# 서버 실행
npm run start
```

### 🔍 배포 확인

배포 후 다음 엔드포인트로 상태를 확인할 수 있습니다:

```bash
# Health Check
curl https://your-domain.vercel.app/api/health

# 로컬 테스트
npm run health
```

### 📊 성능 모니터링

배포된 애플리케이션의 성능을 모니터링하려면:

1. **Vercel Analytics**: Vercel Dashboard에서 자동으로 제공
2. **Bundle Analysis**: 
   ```bash
   npm run analyze
   ```
3. **Lighthouse CI**: GitHub Actions에서 자동 실행

## 🤝 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 만드세요: `git checkout -b feature/amazing-feature`
3. 변경사항을 커밋하세요: `git commit -m 'Add amazing feature'`
4. 브랜치에 푸시하세요: `git push origin feature/amazing-feature`
5. Pull Request를 열어주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙋‍♂️ 지원

문제가 발생했나요? 다음을 확인해보세요:

- 📖 [사용자 가이드](docs/user-guide.md)
- ❓ [FAQ](docs/faq.md)
- 🐛 [이슈 트래커](https://github.com/your-username/simple-todo-app/issues)

---

💡 **팁**: 이 애플리케이션은 로컬 저장소를 사용하므로 데이터가 브라우저에 저장됩니다. 정기적으로 데이터를 내보내기하여 백업하는 것을 권장합니다!