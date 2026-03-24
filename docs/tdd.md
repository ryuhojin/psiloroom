# PSILO TDD Guide

## 목적

PSILO는 인증, 권한, 테넌시, 실시간 동기화가 핵심인 시스템이다. 그래서 구현보다 테스트 계약을 먼저 고정하는 방식을 기본 원칙으로 사용한다.

## 기본 원칙

- 모든 기능 작업은 `red -> green -> refactor` 순서를 따른다.
- 생산 코드보다 테스트 파일이 먼저 존재해야 한다.
- 버그 수정은 재현 테스트 없이 완료로 보지 않는다.
- 인증, 권한, 테넌시, 실시간 이벤트는 테스트 없는 병합을 허용하지 않는다.
- UI 변경은 최소 1개의 컴포넌트 테스트 또는 시각화 테스트를 동반한다.

## 단계별 적용

### 1. 도메인 모델

- 엔터티와 규칙을 먼저 테스트로 고정한다.
- 예시:
  - 사용자는 최소 1개 그룹사 소속이어야 한다.
  - 외주 사용자는 외주 식별값이 있어야 한다.
  - 프로젝트 권한이 없으면 기능 권한도 부여될 수 없다.

### 2. 서비스 / 유스케이스

- 실패 시나리오를 먼저 작성한다.
- 예시:
  - 권한 없는 공지 생성 실패
  - 프로젝트 멤버만 일정 수정 가능
  - 공지 대상 계산이 역할 소속을 반영

### 3. API

- 요청/응답 계약과 상태코드를 먼저 고정한다.
- 필수 확인:
  - `400` payload validation
  - `401` 인증 실패
  - `403` 권한 실패
  - 정상 응답 shape

### 4. 실시간

- 이벤트 계약과 수신 대상을 먼저 고정한다.
- 필수 확인:
  - 누가 이벤트를 받는가
  - 누가 이벤트를 받지 못하는가
  - 재연결 시 상태 복구가 되는가

### 5. UI / 시각화

- 권한 가드, 초기 진입 흐름, 핵심 요약 카드부터 테스트한다.
- 컴포넌트 테스트와 Playwright 시각화 스모크를 함께 사용한다.

## 우선순위

1. 인증 / 인가 계약 테스트
2. 조직 / 계정 / 프로젝트 권한 모델 테스트
3. 일정 조회 범위와 수정 권한 테스트
4. 공지 대상 계산과 전파 테스트
5. 채팅 참여 권한과 읽음 상태 테스트
6. 운영 헬스체크와 환경 변수 실패 테스트

## 완료 조건

- 새 API는 계약 테스트와 실패 테스트를 같이 가진다.
- 새 UI는 렌더링 테스트와 권한 가드 또는 시각화 테스트를 같이 가진다.
- 실시간 기능은 수신 성공과 미수신 시나리오를 모두 가진다.
- 루트 테스트 명령과 시각화 테스트가 모두 통과한다.

## 현재 스캐폴드 기준 테스트 세트

- `apps/admin-api/test/app.e2e-spec.ts`
- `apps/user-api/test/app.e2e-spec.ts`
- `apps/admin-web/src/__tests__/admin-shell.test.tsx`
- `apps/user-web/src/__tests__/user-shell.test.tsx`
- `tests/e2e/admin-login.spec.ts`
- `tests/e2e/user-workspace.spec.ts`

현재 green 처리된 핵심 시나리오는 아래와 같다.
- 관리자 로그인 payload validation
- 관리자 tenant 목록 인증 강제
- 관리자 cross-tenant project 조회 차단
- 사용자 로그인 payload validation
- 사용자 inbox 인증 강제
- 사용자 project scope 밖 notice 조회 차단
- 사용자 소켓 무인증 연결 차단
- 사용자 비멤버 project 구독 차단
- 관리자 보호 라우트 비로그인 리다이렉트
- 사용자 보호 라우트 비로그인 리다이렉트

## 다음 단계에서 추가할 테스트

- cross-tenant project access 차단 테스트
- project permission calendar update 차단 테스트
- notice targeting audience 계산 테스트
- chat message non-member broadcast 차단 테스트
- reconnect 후 unread state 복구 테스트
