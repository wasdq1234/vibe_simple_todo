# ❓ 자주 묻는 질문 (FAQ)

Simple Todo App 사용 중 자주 묻는 질문들과 답변입니다.

## 📱 기본 사용

### Q: 데이터가 어디에 저장되나요?
**A:** 데이터는 브라우저의 **로컬 저장소(localStorage)**에 저장됩니다. 
- ✅ 인터넷 연결 없이도 사용 가능
- ✅ 개인정보 보호 (외부 서버에 전송되지 않음)
- ⚠️ 브라우저 캐시 삭제 시 데이터 손실 가능 → 정기적 백업 권장

### Q: 다른 기기에서도 같은 데이터를 볼 수 있나요?
**A:** 현재 버전은 **기기별 저장**입니다.
- 각 브라우저/기기마다 독립적인 데이터
- **해결책**: 내보내기/가져오기 기능으로 데이터 이동
  1. 기기 A에서 데이터 내보내기 → 파일 저장
  2. 기기 B에서 해당 파일 가져오기

### Q: 최대 몇 개까지 할 일을 저장할 수 있나요?
**A:** 브라우저 제한에 따라 다릅니다:
- 일반적으로 **수천 개**의 할 일 저장 가능
- 대부분 브라우저: 5-10MB 로컬 저장소 제공
- 성능 최적화를 위해 완료된 할 일 정기적 정리 권장

### Q: 할 일을 실수로 삭제했어요. 복구할 수 있나요?
**A:** 현재 **실행 취소 기능은 없습니다**.
- **예방책**: 정기적인 데이터 내보내기로 백업
- **응급처치**: 브라우저를 새로고침하지 않았다면 페이지 새로고침으로 일시적 복구 가능 (보장되지 않음)

## 💾 데이터 관리

### Q: 어떤 파일 형식을 내보내기해야 하나요?
**A:** 용도에 따라 선택하세요:

| 형식 | 권장 용도 | 장점 |
|------|-----------|------|
| **JSON** | 다른 앱으로 이동, 프로그래밍 | 완전한 데이터 구조 보존 |
| **CSV** | Excel, 스프레드시트 | 표 형태로 보기/편집 |
| **TXT** | 읽기 전용, 인쇄 | 사람이 읽기 쉬운 형태 |

### Q: 내보내기한 파일을 다시 가져올 수 있나요?
**A:** **JSON 파일만 완전 호환**됩니다:
- ✅ JSON: 모든 데이터 완벽 복원
- ⚠️ CSV: 기본 데이터만 (일부 정보 손실 가능)  
- ❌ TXT: 가져오기 불가 (읽기 전용)

### Q: 가져오기 시 기존 데이터는 어떻게 되나요?
**A:** **기존 데이터에 추가**됩니다:
- 기존 할 일이 삭제되지 않음
- 새로운 할 일들이 추가로 생성됨
- 중복을 원하지 않으면 가져오기 전에 기존 데이터 정리 필요

### Q: 가져오기 시 "검증 실패" 오류가 나요.
**A:** 파일 형식을 확인해주세요:
1. **지원 형식**: JSON, CSV, TXT만 가능
2. **파일 내용**: 올바른 할 일 데이터 구조인지 확인
3. **인코딩**: UTF-8 인코딩 권장
4. **파일 크기**: 너무 큰 파일은 제한될 수 있음

## 🎨 인터페이스

### Q: 다크 모드가 있나요?
**A:** 현재 **라이트 모드만** 지원합니다.
- 추후 업데이트에서 다크 모드 추가 예정
- 브라우저의 다크 모드 설정 영향 없음

### Q: 글자 크기를 조정할 수 있나요?
**A:** 브라우저 확대/축소 기능을 사용하세요:
- **확대**: `Ctrl + +` (Windows) / `Cmd + +` (Mac)
- **축소**: `Ctrl + -` (Windows) / `Cmd + -` (Mac)
- **원래 크기**: `Ctrl + 0` (Windows) / `Cmd + 0` (Mac)

### Q: 모바일에서 사용할 수 있나요?
**A:** 네, **완전히 반응형**입니다:
- 📱 모바일: 터치 최적화 인터페이스
- 📔 태블릿: 적응형 레이아웃
- 🖥️ 데스크톱: 키보드 단축키 지원

## ⌨️ 키보드 사용

### Q: 마우스 없이 모든 기능을 사용할 수 있나요?
**A:** 네, **완전한 키보드 지원**입니다:
- `Tab` / `Shift+Tab`: 요소 간 이동
- `Enter`: 버튼 클릭 / 편집 모드
- `Space`: 체크박스 토글
- `Escape`: 취소 / 모달 닫기

### Q: 빠르게 할 일을 여러 개 추가하는 방법은?
**A:** **Enter 키 연속 사용**:
1. 입력 필드에 첫 번째 할 일 입력 → `Enter`
2. 자동으로 입력 필드 포커스 유지 → 바로 다음 할 일 입력
3. 계속 `Enter`로 연속 추가

### Q: 할 일 편집이 어려워요.
**A:** 두 가지 방법이 있습니다:
- **마우스**: 할 일 텍스트를 더블클릭
- **키보드**: Tab으로 할 일에 포커스 → `Enter` 키

## 🌐 브라우저 호환성

### Q: 어떤 브라우저에서 사용할 수 있나요?
**A:** 대부분의 **모던 브라우저**에서 동작합니다:

| 브라우저 | 최소 버전 | 고급 기능* |
|----------|-----------|------------|
| Chrome | 80+ | ✅ 완전 지원 |
| Firefox | 78+ | ⚠️ 부분 지원 |
| Safari | 14+ | ⚠️ 부분 지원 |
| Edge | 80+ | ✅ 완전 지원 |

*고급 기능 = File System Access API (향상된 파일 저장/열기)

### Q: Internet Explorer에서 동작하나요?
**A:** **지원하지 않습니다**.
- IE는 최신 웹 기술을 지원하지 않음
- Edge나 Chrome 등 모던 브라우저 사용 권장

### Q: 인터넷 연결이 필요한가요?
**A:** **최초 로딩 후에는 불필요**합니다:
- 첫 방문 시에만 인터넷 연결 필요
- 이후 **오프라인에서도 완전 동작**
- 데이터는 로컬에 저장되므로 인터넷 불필요

## 🛠️ 문제 해결

### Q: 앱이 느려지거나 반응하지 않아요.
**A:** 다음을 순서대로 시도해보세요:
1. **페이지 새로고침**: `F5` 또는 `Ctrl+R`
2. **브라우저 캐시 삭제**: 설정 → 개인정보 → 브라우징 데이터 삭제
3. **완료된 할 일 정리**: 너무 많은 데이터가 성능에 영향
4. **다른 브라우저 시도**: 브라우저별 차이 확인

### Q: 할 일이 저장되지 않아요.
**A:** 로컬 저장소 문제일 수 있습니다:
1. **시크릿/프라이빗 브라우징 모드**인지 확인 (저장 제한)
2. **저장소 공간** 확인 (브라우저 설정에서 확인)
3. **브라우저 설정**에서 로컬 저장소 허용 확인
4. **바이러스 백신/보안 프로그램**이 차단하는지 확인

### Q: 가져오기/내보내기가 작동하지 않아요.
**A:** 브라우저 설정을 확인하세요:
1. **팝업 차단** 해제 (다운로드 차단 가능)
2. **다운로드 설정** 확인
3. **자바스크립트 활성화** 확인
4. **파일 크기 제한** 확인 (너무 큰 파일)

## 📈 성능 최적화

### Q: 많은 할 일이 있는데 앱이 느려요.
**A:** 성능 최적화 방법:
1. **완료된 할 일 정리**: "완료됨 정리" 버튼 사용
2. **브라우저 메모리 정리**: 다른 탭 닫기
3. **정기적 데이터 백업**: 내보내기 후 데이터 정리
4. **필터 활용**: "진행 중"으로 필터링하여 화면 부담 줄이기

### Q: 데이터 백업은 얼마나 자주 해야 하나요?
**A:** 데이터 중요도에 따라:
- **매일 사용**: 주 1회 백업 권장
- **중요한 업무**: 매일 백업
- **간헐적 사용**: 월 1회 정도

## 🔒 보안 및 개인정보

### Q: 데이터가 외부로 전송되나요?
**A:** **전혀 전송되지 않습니다**:
- 모든 데이터는 브라우저 로컬에만 저장
- 서버나 외부 서비스로 전송 없음
- 완전한 개인정보 보호

### Q: 다른 사람이 내 할 일을 볼 수 있나요?
**A:** **공유 컴퓨터에서는 가능**합니다:
- 같은 브라우저를 사용하는 다른 사람이 접근 가능
- **개인 기기 사용 권장**
- 공유 컴퓨터 사용 후 브라우저 데이터 삭제 권장

---

## 🙋‍♂️ 더 궁금한 점이 있으신가요?

- 📖 [사용자 가이드](user-guide.md) - 상세한 사용법
- 🔧 [문제 해결 가이드](troubleshooting.md) - 기술적 문제
- 🐛 [GitHub 이슈](https://github.com/your-username/simple-todo-app/issues) - 버그 신고
- 💡 [GitHub 토론](https://github.com/your-username/simple-todo-app/discussions) - 기능 제안 