# PSILO Architecture

## 1. 프로젝트 개요

PSILO는 그룹사 내 SI 프로젝트를 위한 일정 공유 및 협업 시스템이다. 핵심 목표는 프로젝트 중심의 일정 관리, 개인/그룹/프로젝트 채팅, 공지사항 실시간 전파를 하나의 플랫폼에서 제공하는 것이다.

이 시스템은 일반 협업 도구가 아니라 그룹사 조직 구조, 부서, 사용자 소속, 외주 인력 구분, 프로젝트별 권한 정책을 강하게 반영하는 SI 운영 시스템을 전제로 설계한다.

## 2. 목표 / 범위 / MVP

### 목표

- 그룹사별 로그인과 조직 기반 접근 통제 지원
- 개인/그룹/프로젝트 단위 일정 공유 및 실시간 반영
- 개인/그룹/프로젝트 채팅 지원
- 공지사항 실시간 배포 및 읽음 상태 관리
- 프로젝트별 기능 권한과 사용자별 권한 레벨 지원
- Docker 기반 개발/운영 배포 일원화

### 범위

- 관리자 웹: 조직, 계정, 역할, 프로젝트, 권한, 공지, 일정, 채팅 정책 관리
- 사용자 웹: 일정 조회/수정, 채팅, 공지 수신, 알림, 프로젝트 대시보드
- 관리자 API: 정책/권한/마스터 데이터 관리
- 사용자 API: 일정/채팅/공지 실행 처리
- 실시간 인프라: Socket 기반 이벤트 전달, Redis 기반 브로커 연동

### MVP

- 그룹사 코드 기반 로그인
- 그룹사/부서/계정/역할/프로젝트/프로젝트 멤버 관리
- 프로젝트별 권한 설정
- 공지 생성/발행/읽음 처리
- 개인/그룹/프로젝트 채팅
- 개인/그룹/프로젝트 일정 캘린더
- 실시간 알림 및 화면 갱신
- Docker Compose 기반 로컬 기동

## 3. 시스템 구성도

```text
[Admin Web]
    |
    v
[Admin API] -----> [PostgreSQL]
    |                  |
    |                  v
    |--------------> [Audit / Domain Data]
    |
    v
[Redis / Event Bus] <-------------------- [Worker]
    ^                                         |
    |                                         v
[User API] ------------------------------> [Notification / Async Jobs]
    |
    +----> [Socket.IO Gateway]
    |
    +----> [PostgreSQL]
    |
    v
[User Web (PWA)]

Deployment:
- docker compose
- services: admin-web, user-web, admin-api, user-api, worker, postgres, redis
```

### 구성 원칙

- 관리자 영역은 정책과 권한의 원천 시스템이다.
- 사용자 영역은 일정/채팅/공지의 실시간 소비 시스템이다.
- 동기 요청은 REST, 실시간 반영은 Socket.IO, 서비스 간 이벤트 전파는 Redis 기반으로 처리한다.

## 4. 도메인 모델

### 조직/사용자

- `tenant`: 그룹사
- `department`: 부서
- `account`: 사용자 계정
- `affiliation_type`: 고객사 / 수행사 / 외주개발사
- `global_role`: 관리자급 전역 역할
- `permission`: 기능 권한 정의

### 프로젝트/권한

- `project`: SI 프로젝트
- `project_member`: 프로젝트 참여자
- `project_role`: 프로젝트 내 역할
- `project_role_permission`: 프로젝트 역할별 기능 권한
- `project_member_permission_override`: 사용자별 개별 권한 예외

### 일정

- `calendar`: 일정 컨테이너
- `calendar_event`: 일정 엔터티
- `event_attendee`: 참석자
- `event_share_target`: 개인/부서/프로젝트/역할 공유 대상

### 채팅

- `chat_room`: DM / 그룹 / 프로젝트 채팅방
- `chat_member`: 채팅방 참여자
- `chat_message`: 메시지
- `chat_read_receipt`: 읽음 상태

### 공지

- `notice`: 공지사항
- `notice_target`: 대상 범위
- `notice_read_receipt`: 읽음 상태

### 운영

- `notification`: 사용자 알림
- `audit_log`: 관리자 및 보안 이벤트 로그
- `outbox_event`: 도메인 이벤트 저장 및 비동기 전달

## 5. 인증 / 인가 정책

### 인증

- 로그인 입력값은 `tenant_code + login_id + password`를 기본으로 한다.
- 인증 토큰은 `access token + rotating refresh token` 구조를 사용한다.
- 추후 SSO 연동이 가능하도록 tenant-aware 인증 구조로 설계한다.

### 인가

- 인가는 `전역 권한 + 프로젝트 권한`의 2단계 구조를 사용한다.
- 전역 권한은 조직, 계정, 프로젝트 생성 및 정책 관리에 사용한다.
- 프로젝트 권한은 일정, 공지, 채팅, 멤버 관리 등 실제 프로젝트 기능에 사용한다.
- 필요 시 사용자 단위 override를 허용한다.

### 정책 원칙

- UI 노출, REST API, WebSocket 구독 모두 동일 권한 기준으로 차단한다.
- 권한 변경 시 기존 세션도 재평가한다.
- 외주 사용자는 외주 식별 정보를 가지며 허용된 프로젝트 범위에서만 접근 가능하다.
- 그룹사 간 데이터는 완전 분리한다.

## 6. 실시간 이벤트 모델

### 전송 방식

- 명령/조회: REST API
- 실시간 반영: Socket.IO
- 내부 이벤트 전달: Redis Pub/Sub 또는 Redis Streams

### 구독 단위

- `tenant:{tenantId}`
- `project:{projectId}`
- `room:{roomId}`
- `account:{accountId}`

### 주요 이벤트

- `project.permission.updated`
- `project.member.added`
- `project.member.removed`
- `notice.published`
- `notice.read.updated`
- `calendar.event.created`
- `calendar.event.updated`
- `calendar.event.deleted`
- `chat.message.created`
- `chat.read.updated`

### 처리 원칙

- 서버는 권한 검증 후에만 구독을 허용한다.
- 권한 철회 시 해당 구독은 즉시 무효화한다.
- 클라이언트는 재연결 후 마지막 시퀀스 기준 delta sync를 수행한다.
- 읽음 상태, 미확인 수, 마지막 이벤트 시점은 서버 기준으로 정합성을 유지한다.

## 7. 권장 저장소 구조

```text
psiloroom/
  apps/
    admin-web/
    user-web/
    admin-api/
    user-api/
    worker/
  packages/
    shared-types/
    ui/
    config/
  docs/
    architecture.md
  infra/
    docker/
  AGENTS.md
  checklist.md
  docker-compose.yml
```

### 역할 분리 원칙

- `admin-web`: 관리자 화면
- `user-web`: 사용자 화면 및 PWA
- `admin-api`: 조직/권한/정책 관리
- `user-api`: 일정/채팅/공지 처리
- `worker`: 알림 발송, 이벤트 후처리, 비동기 작업
- `packages`: 공통 타입, UI, 설정 공유

## 8. 단계별 구현 로드맵

### 1단계: 기반 구성

- 모노레포 구조 생성
- Docker Compose 구성
- 공통 설정, 환경 변수, 코드 규칙 정리
- AGENTS 운영 문서와 QA 체크리스트 생성

### 2단계: 조직/인증/권한

- 그룹사, 부서, 계정, 역할 모델 구현
- tenant-aware 로그인 구현
- 전역 권한 및 프로젝트 권한 구조 구현

### 3단계: 관리자 기본 기능

- 관리자 웹/API의 조직, 계정, 프로젝트, 권한 CRUD
- 프로젝트 멤버십과 권한 부여 관리
- 감사 로그 기초 구축

### 4단계: 공지 기능

- 공지 생성, 발행, 대상 지정, 읽음 처리
- 실시간 공지 전파
- 사용자 Inbox 반영

### 5단계: 채팅 기능

- 개인/그룹/프로젝트 채팅방
- 메시지 송수신, 읽음 처리, 미읽음 수 계산
- 실시간 메시지 반영

### 6단계: 일정 기능

- 개인/그룹/프로젝트 캘린더
- 일정 CRUD, 참석자, 공유 대상
- 실시간 일정 갱신 및 충돌 처리 정책 적용

### 7단계: 안정화

- 알림, PWA, 재연결/복구 처리
- 통합 테스트, E2E, 성능 검증
- 운영 로그, 헬스체크, 장애 대응 보강

## 9. 이후 확장 방향

- 칸반 기반 테스트/진행관리 시스템 추가
- 외주개발자 평가 시스템 추가
- SSO 및 그룹웨어 연동
- 파일 첨부/문서 협업 기능 확장
- Electron 기반 데스크톱 앱 분기
- 운영 대시보드 및 통계/리포트 강화

## 구현 기준 요약

- 사용자 앱은 웹/PWA 우선으로 시작한다.
- 관리자와 사용자 백엔드는 분리한다.
- 권한 모델은 전역 + 프로젝트 + 사용자 override 구조를 사용한다.
- 실시간 기능은 Redis + Socket.IO를 기준으로 설계한다.
- Docker Compose로 전체 서비스를 기동 가능한 구조를 유지한다.
