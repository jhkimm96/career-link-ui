# Career Link — Frontend

구직자, 기업, 관리자가 사용하는 채용 플랫폼 Career Link의 프론트엔드입니다. Next.js App Router와 React, TypeScript, Material UI로 구성했습니다.

[백엔드 저장소](https://github.com/hha6571/career-link) · [개인 기여와 기술 기록](https://jiheeportfolio.vercel.app/projects/career-link)

## 제공하는 화면

| 사용자 | 주요 화면 |
| --- | --- |
| 구직자 | 채용 공고 조회, 이력서와 자소서 작성·관리, 지원 내역, 공고 스크랩 |
| 기업 | 기업 등록과 프로필, 채용 공고 등록·수정, 지원자 관리, 기업 회원 관리 |
| 관리자 | 회원·기업·공고 관리, 메뉴와 공통코드 관리, 공지사항과 FAQ |

로그인, 회원가입, 소셜 로그인 후속 처리와 계정 복구 화면도 포함합니다. 위 목록은 팀 프로젝트 전체 화면이며, 모든 기능이 저장소 소유자 한 사람의 기여를 뜻하지 않습니다.

## 본인 담당 범위

김지희는 Next.js 프론트엔드 초기 셋업과 함께, 프로젝트 전반에서 권한별 메뉴 관리와 공통코드 등 어드민 기반, 지원자 이력서·자소서·스크랩 CRUD를 담당했습니다.

인증과 리프레시 토큰 로테이션 등 공동 작업자가 주로 담당한 기능은 개인 구현 성과와 구분합니다. 상세한 담당 범위와 관련 기록은 [포트폴리오](https://jiheeportfolio.vercel.app/projects/career-link)에 정리했습니다.

## 기술 구성

- Next.js 15, React 18, TypeScript
- Material UI, MUI X, Emotion, Tailwind CSS
- Axios, Day.js

정확한 버전과 나머지 의존성은 [`package.json`](package.json)을 확인합니다.

## 구조

| 경로 | 역할 |
| --- | --- |
| [`src/app/`](src/app/) | 공고·인증 화면과 구직자·기업·관리자 마이페이지 |
| [`src/components/form/`](src/components/form/) | 이력서, 자소서, 공고 등 입력 폼 |
| [`src/components/layouts/`](src/components/layouts/) | 헤더, 사이드바, 공통 페이지 레이아웃 |
| [`src/api/`](src/api/) | Axios와 API 연결 |
| [`src/libs/`](src/libs/) | 인증 컨텍스트와 에디터 업로드 |
| [`src/types/`](src/types/) | 지원자, 지원 내역, 이력서와 자소서 타입 |

## 로컬 실행

```bash
npm ci
npm run dev
```

개발 서버의 기본 주소는 `http://localhost:3000`입니다. 실제 회원·공고·지원서 기능을 사용하려면 Career Link 백엔드와 연결해야 합니다. API 접속 설정은 [`src/api/axios.ts`](src/api/axios.ts), 백엔드 준비는 [백엔드 저장소](https://github.com/hha6571/career-link)를 확인합니다.

```bash
npm run build
npm start
```

프론트 화면이 열린다는 사실만으로 로그인이나 데이터 저장까지 동작하는 것은 아닙니다. 데모의 백엔드 연결과 실제 사용 가능 여부는 별도 확인이 필요합니다.

## 확장 계획

공고 수집, 갭분석, 기업별 지원 준비와 자소서 에이전트를 연결하는 커리어 AI 서비스는 설계 단계입니다. 현재 저장소의 구현 완료 기능과 구분합니다.
