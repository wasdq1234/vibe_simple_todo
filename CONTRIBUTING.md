# 🤝 Contributing to Simple Todo App

Simple Todo App에 기여해주셔서 감사합니다! 이 가이드는 프로젝트에 효과적으로 기여하는 방법을 안내합니다.

## 📋 목차

1. [기여 방법](#기여-방법)
2. [개발 환경 설정](#개발-환경-설정)
3. [코드 스타일](#코드-스타일)
4. [Pull Request 가이드라인](#pull-request-가이드라인)
5. [이슈 리포팅](#이슈-리포팅)
6. [커뮤니티 가이드라인](#커뮤니티-가이드라인)

## 🚀 기여 방법

### 기여할 수 있는 영역

- 🐛 **버그 수정**: 이슈 트래커에서 버그 리포트 확인
- ✨ **새로운 기능**: 기능 요청 검토 및 구현
- 📖 **문서 개선**: 사용자 가이드, API 문서, 코멘트 개선
- 🧪 **테스트 추가**: 테스트 커버리지 향상
- 🎨 **UI/UX 개선**: 인터페이스 및 사용성 향상
- ♿ **접근성 개선**: 웹 접근성 표준 준수
- 🌐 **다국어 지원**: 번역 및 국제화

### 우선순위 라벨

- `good first issue`: 초보자에게 적합한 이슈
- `help wanted`: 도움이 필요한 이슈
- `priority: high`: 높은 우선순위
- `bug`: 버그 수정
- `enhancement`: 기능 개선
- `documentation`: 문서 관련

## 🛠️ 개발 환경 설정

### 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상 
- **Git**: 2.0 이상

### 로컬 설정

```bash
# 1. 저장소 포크 및 클론
git clone https://github.com/YOUR_USERNAME/simple-todo-app.git
cd simple-todo-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 새 브랜치 생성
git checkout -b feature/your-feature-name
```

### 유용한 개발 명령어

```bash
# 개발 서버 (Hot Reload)
npm run dev

# 프로덕션 빌드 테스트
npm run build
npm run start

# 타입 체크
npm run type-check

# 린팅
npm run lint
npm run lint:fix

# 테스트
npm run test
npm run test:watch
npm run test:coverage

# 컴포넌트 테스트
npm run test:components
```

## 📝 코드 스타일

### TypeScript/JavaScript

- **타입 안전성**: 모든 코드에 적절한 타입 지정
- **ESLint**: 프로젝트의 ESLint 규칙 준수
- **Prettier**: 코드 포매팅 자동화

```typescript
// ✅ 좋은 예
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

// ❌ 나쁜 예  
function TodoItem(props: any) {
  // 타입이 명시되지 않음
}
```

### React 컴포넌트

- **함수형 컴포넌트**: 클래스 컴포넌트 대신 함수형 사용
- **Hooks**: 적절한 Hook 사용 (useState, useEffect, useMemo 등)
- **Props 인터페이스**: 모든 컴포넌트에 명확한 Props 타입 정의

```typescript
// ✅ 권장 패턴
const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // 컴포넌트 로직...
  
  return (
    // JSX...
  );
};

export default TodoItem;
```

### CSS/Styling

- **Tailwind CSS**: 유틸리티 클래스 우선 사용
- **일관된 스페이싱**: Tailwind의 스페이싱 시스템 활용
- **반응형 디자인**: 모바일 우선 접근법

```jsx
// ✅ 좋은 예
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">

// ❌ 피해야 할 것
<div style={{display: 'flex', padding: '16px'}} className="custom-styles">
```

### 파일/폴더 구조

```
components/
├── ui/           # 재사용 가능한 UI 컴포넌트
├── features/     # 기능별 컴포넌트
└── layout/       # 레이아웃 컴포넌트

hooks/            # 커스텀 훅
lib/              # 유틸리티 함수 및 타입
__tests__/        # 테스트 파일
```

## 🔄 Pull Request 가이드라인

### PR 생성 전 체크리스트

- [ ] 최신 `main` 브랜치와 동기화
- [ ] 모든 테스트 통과 (`npm run test`)
- [ ] 린팅 오류 없음 (`npm run lint`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 빌드 성공 (`npm run build`)

### PR 제목 형식

```
<type>(<scope>): <description>

예시:
feat(todo): add drag-and-drop reordering
fix(storage): resolve localStorage quota exceeded error
docs(readme): update installation instructions
test(components): add TodoForm unit tests
```

### 타입 규칙

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `test`: 테스트 추가/수정
- `refactor`: 코드 리팩토링
- `style`: 스타일 변경 (포매팅, 세미콜론 등)
- `perf`: 성능 개선
- `chore`: 빌드 프로세스, 도구 설정 등

### PR 설명 템플릿

```markdown
## 변경사항 요약
<!-- 무엇을 변경했는지 간단히 설명 -->

## 변경 이유
<!-- 왜 이 변경이 필요한지 설명 -->

## 테스트된 환경
- [ ] Chrome
- [ ] Firefox  
- [ ] Safari
- [ ] Mobile

## 스크린샷/데모
<!-- UI 변경사항이 있는 경우 -->

## 체크리스트
- [ ] 코드가 프로젝트 스타일 가이드를 따름
- [ ] 스스로 코드 리뷰를 완료함
- [ ] 관련 문서를 업데이트함
- [ ] 새로운 기능에 대한 테스트를 추가함
- [ ] 모든 테스트가 통과함
```

### 리뷰 프로세스

1. **자동 검사**: CI/CD에서 테스트, 린팅, 빌드 확인
2. **코드 리뷰**: 메인테이너가 코드 품질, 로직, 스타일 검토
3. **테스트**: 다양한 환경에서 동작 확인
4. **승인 및 병합**: 모든 검사 통과 후 병합

## 🐛 이슈 리포팅

### 버그 리포트

**버그 리포트 템플릿:**

```markdown
## 🐛 버그 설명
<!-- 무엇이 잘못되었는지 명확하고 간결하게 설명 -->

## 🔄 재현 단계
1. '...'로 이동
2. '...'를 클릭
3. '...'까지 스크롤
4. 오류 확인

## 🎯 예상 동작
<!-- 무엇이 일어날 것으로 예상했는지 설명 -->

## 📱 환경
- OS: [Windows 10, macOS 12, Ubuntu 20.04]
- 브라우저: [Chrome 90, Firefox 88, Safari 14]
- 버전: [v1.0.0]

## 📷 스크린샷
<!-- 가능한 경우 스크린샷 첨부 -->

## 📋 추가 정보
<!-- 도움이 될 수 있는 기타 정보 -->
```

### 기능 요청

**기능 요청 템플릿:**

```markdown
## ✨ 기능 설명
<!-- 원하는 기능을 명확하게 설명 -->

## 🎯 문제 해결
<!-- 이 기능이 해결할 문제 설명 -->

## 💡 제안된 해결책
<!-- 기능이 어떻게 작동해야 하는지 설명 -->

## 🔄 대안 고려사항
<!-- 고려한 다른 해결책들 -->

## 📝 추가 컨텍스트
<!-- 기타 관련 정보, 스크린샷, 참고 자료 등 -->
```

## 👥 커뮤니티 가이드라인

### 행동 강령

- **존중**: 모든 기여자를 존중하고 포용적인 환경 조성
- **건설적 피드백**: 비판보다는 건설적인 제안 제공
- **협력**: 팀워크와 협력을 통한 문제 해결
- **학습**: 실수를 학습 기회로 활용

### 커뮤니케이션

- **명확성**: 명확하고 구체적인 의사소통
- **인내심**: 초보자에게 친절하고 도움이 되는 안내
- **전문성**: 기술적 토론에서 전문적인 태도 유지

### 지원받기

- 💬 **GitHub Discussions**: 일반적인 질문과 토론
- 🐛 **Issues**: 버그 리포트 및 기능 요청
- 📧 **이메일**: maintainer@your-app.com

## 🏆 기여자 인정

기여해주신 모든 분들의 노력을 인정하고 감사드립니다:

- **코드 기여자**: README의 기여자 섹션에 이름 추가
- **문서 개선**: 문서 크레딧에 포함
- **버그 리포트**: 이슈 및 릴리스 노트에서 인정
- **특별 기여**: 프로젝트에 중대한 영향을 준 기여에 대한 특별 인정

## 📚 추가 자료

- 📖 [개발 가이드](docs/development.md) - 상세한 개발 환경 설정
- 🧪 [테스팅 가이드](docs/testing.md) - 테스트 작성 및 실행
- 🏗️ [아키텍처 문서](docs/architecture.md) - 코드 구조 및 설계 원칙
- 🎨 [디자인 시스템](docs/design-system.md) - UI/UX 가이드라인

---

**기여해주셔서 감사합니다! 🎉**

질문이나 도움이 필요하시면 언제든지 이슈를 생성하거나 토론을 시작해주세요. 