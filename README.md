# 🤖 n8n 기반: 지능형 가상자산 자동 매매 파이프라인 구축

**GCP 인프라와 n8n 워크플로우를 활용한 데이터 기반 전략 수립 및 실시간 자동 거래 시스템**

## 목차

* [1. 프로젝트 개요](#1-팀원-소개)
* [2. 가상자산 자동 매매 파이프라인 및 전략](#3-주제-선정-배경--가상자산-자동-매매-파이프라인)
* [3. 데이터 처리 및 분석 방법 (n8n)](#2-n8n-소개)
* [4. 시스템 구축 환경 (Architecture)](#4-시스템-구축-환경-system-architecture-stack)
* [5. 실행 방법 (재현)](#5-실행-방법-재현)
* [6. 트러블슈팅](#6-트러블슈팅)
* [7. 한계 및 향후 개선](#7-한계-및-향후-개선)
---


## 1. 👤 팀원 소개

| <img src="https://github.com/minchaeki.png" width="150"> | <img src="https://github.com/YongwanJoo.png" width="150"> | <img src="https://github.com/woojinni.png" width="150"> | 
| :---: | :---: | :---: |
| **김민채** | **주용완** | **장우진** |
| [@minchaeki](https://github.com/minchaeki) | [@YongwanJoo](https://avatars.githubusercontent.com/YongwanJoo) | [@woojinni](https://github.com/woojinni) | 

<br>

## 2. ⚙️ n8n 소개 (Workflow Automation Engine)

<img width="620" height="220" alt="images" src="https://github.com/user-attachments/assets/f64e48be-60be-486f-ad32-fcf5e68e762a" />

본 프로젝트는 **n8n**을 핵심 오케스트레이션 도구로 활용하여  
가상자산 자동 매매 파이프라인 전체를 **이벤트 기반 워크플로우**로 구성하였다.

n8n은 **노드(Node) 기반 시각적 워크플로우 자동화 플랫폼**으로,  
API 호출 · 데이터 가공 · 조건 분기 · 외부 서비스 연동을 코드와 GUI를 혼합해 유연하게 설계할 수 있다.

### 🔹 프로젝트 내에서의 역할

본 시스템에서 n8n은 단순 자동화 도구가 아니라  
**“가상자산 매매 프로세스를 연결하는 중앙 제어 허브(Control Plane)”** 역할을 수행한다.

- 매매 제안 생성 (시장 데이터 → 전략 판단 → GPT 분석)
- 사용자 승인 기반 반자동 매매 흐름
- 주문 실행 및 상태 전이(FSM 형태 관리)
- 실시간 모니터링 및 알림 연동

즉,  
**데이터 → 판단 → 승인 → 실행 → 감시**  
전 과정을 하나의 일관된 파이프라인으로 묶는 핵심 구성 요소다

<br>

## 3. 💡 주제 선정 배경 – 가상자산 자동 매매 파이프라인

본 프로젝트는 **가상자산 트레이딩에 대한 개인적인 관심**에서 출발하였다.  
시장 흐름을 분석하고 매수·매도 시점을 판단하는 과정은 흥미롭지만,  
동시에 **반복적이고 감정에 크게 좌우되기 쉬운 영역**이기도 하다.

이러한 특성은  
> “사람이 개입하지 않아도, 정해진 기준에 따라 안정적으로 동작할 수는 없을까?”  
라는 질문으로 자연스럽게 이어졌고,  
그 해답으로 **자동 매매 시스템**을 주제로 선택하게 되었다.

📊 시장 분석 및 전략적 접근

가상자산 시장은 다음과 같은 특징을 지닌다.

- **24시간 운영되는 실시간 시장**
- API 기반 주문·시세 접근 환경
- 다양한 기술 지표 및 **데이터 분석** 가능성

이라는 점에서 **자동화·이벤트 기반 시스템을 설계하기에 매우 적합한 도메인**이다.

### 📉 시장 분석: 기존 솔루션의 한계와 대안

개인 투자자가 접근 가능한 기존 자동 매매 환경은 **편의성(SaaS)과 자유도(Custom Script)** 사이에서 양극화되어 있다. 본 프로젝트는 이 두 방식의 구조적 한계를 극복하기 위해 시작되었다.

#### 1) 💔 기존 솔루션의 Pain Points
| 구분 | 장점 | 주요 한계점 (Limitations) |
| :--- | :--- | :--- |
| **SaaS 플랫폼**<br>(3Commas 등) | 웹 기반 설정,<br>편의성 우수 | • **높은 구독료** 및 전략의 **블랙박스화**<br>• 커스텀 로직 및 외부 데이터 연동 불가 |
| **Python 스크립트**<br>(Custom Dev) | 무한한 자유도,<br>비용 절감 | • **운영 부담** (서버 관리, 에러 핸들링)<br>• 시각화된 모니터링 및 제어 UI 부재 |

#### 2) ❤️‍🩹 해결책: n8n (Hybrid Workflow)
**n8n**은 "전략 설계의 자유도"와 "운영의 편의성"을 동시에 제공하는 최적의 대안이다.
* **White-Box Strategy:** 모든 로직이 시각화되어 흐름을 완벽히 통제 가능 (블랙박스 문제 해결)
* **Low-Code + Pro-Code:** 복잡한 연산은 Python 노드로, 흐름 제어는 GUI로 처리하여 개발 효율 극대화
* **Cost-Effective:** Docker/Serverless 환경을 통해 인프라 안정성 확보 및 비용 절감

#### 3) ⛳️ 프로젝트 목표
단순 매매 봇을 넘어, **실제 서비스 수준의 안정성**을 갖춘 파이프라인을 구축한다.
* **Data-Driven:** 기술적 지표와 AI 분석이 결합된 전략 수립
* **Human-in-the-loop:** 사용자 승인(Slack)을 통한 반자동 매매 구조
* **Robust Architecture:** 상태 전이(FSM) 기반의 안전한 주문 관리

<br>


## 4. 🏗️ 시스템 구축 환경 (System Architecture Stack)

본 시스템은 **Zero Trust Architecture(ZTA)** 보안 원칙과  
**Finite State Machine(FSM)** 기반 상태 제어 로직을 중심으로 설계되었다.

각 구성 요소는 역할에 따라 명확히 분리되어 있으며,  
이벤트 기반 워크플로우를 통해 유기적으로 연결된다.


| 구분 | 기술 스택 | 설명 |
|---|---|---|
| **Workflow Platform** | <img src="https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png" width="40"> **n8n v2.2.6** | GCP Cloud Run 환경에 Self-hosted로 배포된 워크플로우 오케스트레이션 엔진 |
| **Intelligence** | <img src="https://github.com/user-attachments/assets/a9127200-1619-4a03-b688-92fd9ec1a9e5" width="40"> **GPT-4.1 mini** | 전략 분석, 의사결정 보조, Tool Calling 기반 AI Agent |
| **Database** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="40"> **PostgreSQL 13** | Positions, Orders, Drafts, Chat Memory 등 상태 기반 데이터 저장 |
| **Security** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/googlecloud/googlecloud-original.svg" width="40"> **GCP Cloud NAT / VPC** | Outbound IP 고정 및 Serverless VPC Access를 통한 네트워크 제어 |
| **Trading API** | <img src="https://github.com/user-attachments/assets/842e5710-e6ae-48c1-9fd4-c29987ba6ac1" width="40"> **Upbit Open API** | KRW 마켓 전용 실시간 시세 조회 및 주문 실행 |
| **Interface** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/slack/slack-original.svg" width="40"> **Slack** | Slash Command 및 Interactive Button 기반 사용자 승인 인터페이스 |

<br>

### 4.1 ✅ 기술 선택 이유 

본 프로젝트는 “자동 매매”라는 도메인 특성상 **실시간성 + 안정성 + 감사 가능성(Traceability)** 을 요구한다.
따라서 단순히 “동작”하는 수준을 넘어, **운영 환경에서 장애/보안/확장 이슈를 견딜 수 있는 구성**을 우선으로 기술 스택을 선정하였다.

#### 🐘 4.1.1 PostgreSQL 선택 이유

자동 매매 시스템은 단순 로그 저장이 아니라, **상태 전이(FSM)와 주문/체결의 정합성**을 다뤄야 한다.
PostgreSQL은 아래 이유로 본 프로젝트의 “상태 기반 거래 파이프라인”에 적합하다.

- **트랜잭션/ACID 기반 정합성 보장**<br>주문 생성 → 체결 반영 → 포지션 생성/갱신처럼 단계가 이어지는 흐름에서, 중간 실패 시에도 **데이터가 꼬이지 않도록 트랜잭션 단위로 제어 가능**

- **FSM 상태 관리에 유리한 구조화된 스키마**<br>역할이 분리된 테이블 설계와, 상태값(PENDING, FILLED, CLOSED 등) 관리가 관계형 모델에 자연스럽게 매핑 가능

- **감사(Audit) 및 재현성(Replay) 확보**<br>PostgreSQL은 쿼리/조인 기반 분석이 강해, 매매 이력/승인 로그/전략 파라미터를 한 번에 회귀 분석에 용이함

>결론적으로 PostgreSQL은 “매매 상태의 단일 진실 공급원(Source of Truth)” 역할을 수행하며, 장애 상황에서도 **중복 주문/상태 꼬임을 방지**하는 기반이 된다.

#### 4.1.2 ☁️ GCP 선택 이유

자동 매매 특성상 **상시 실행 + 보안 + 안정적인 네트워크**가 필요하다.

GCP는 아래 요구사항을 가장 적은 운영 부담으로 만족시켰다.

- **Cloud Run** 기반 Serverless 운영으로 “항상 켜져 있는” 워크플로우 제공

- **Secret Manager**로 민감 정보(거래소 키/DB 비밀번호) 분리 관리

- **VPC / Cloud NAT**로 네트워크 통제 및 Outbound IP 고정

> GCP는 “안전하게 숨기고(Secret/VPC)”, “안정적으로 돌리고(Cloud Run/Cloud SQL)”, “운영 부담을 줄이는(Serverless)” 방향의 선택이었다.

### 4.2 🗄️ 데이터베이스 스키마 (Database Schema)

본 시스템은 **FSM 기반 상태 관리**와 실제 거래 환경의 불확실성(부분 체결, 취소 등)을 고려하여  
테이블을 역할별로 명확히 분리하여 설계하였다.

---

#### 4.2.1 `draft_proposals` (투자 제안서 관리 테이블)

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| `id` | PK (INT) | 제안서 일련번호 |
| `version_id` | UNIQUE (STRING) | 고유 버전 식별자 (중복 실행 방지용) |
| `symbol` | STRING | 대상 자산 (BTC, ETH 등) |
| `budget_krw` | NUMERIC | 투자 예산 (원화) |
| `tp_pct` | NUMERIC | 목표 익절 비율 (예: 0.02 = 2%) |
| `sl_pct` | NUMERIC | 목표 손절 비율 (예: 0.05 = 5%) |
| `status` | STRING | 제안 상태 (PENDING, EXECUTED, EXPIRED 등) |
| `request_data` | JSON | 사용자의 원본 요청 파라미터 백업 |
| `expires_at` | TIMESTAMP | 제안서 유효 기간 (시세 변동 리스크 방지) |

---

#### 4.2.2 `positions` (보유 종목 감시 테이블)

실제 체결 이후 생성되는 **보유 포지션의 상태를 FSM 기반으로 관리**하는 테이블이다.

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| `position_id` | PK (SERIAL) | 포지션 고유 번호 |
| `symbol` | STRING | 종목 코드 (예: KRW-ETH) |
| `state` | STRING | 상태 (HOLDING: 보유 중, CLOSED: 청산 완료) |
| `qty` | NUMERIC | 실제 체결된 보유 수량 |
| `avg_entry_price` | NUMERIC | 평균 진입 가격 (평단가) |
| `tp_price` | NUMERIC | 익절가 (매수 시점에 미리 계산되어 저장) |
| `sl_price` | NUMERIC | 손절가 (매수 시점에 미리 계산되어 저장) |
| `highest_price` | NUMERIC | 트레일링 스탑용 최고점 가격 기록 |
| `version_id` | FK (STRING) | 연결된 제안서의 `version_id` |

---

#### 4.2.3 `orders` (주문 및 체결 이력 테이블)

실제 거래소와의 통신 결과를 기반으로  
**부분 체결, 취소 등 현실적인 매매 이슈를 기록**하는 테이블이다.

| 컬럼명 | 타입 | 설명 |
|---|---|---|
| `order_id` | PK (SERIAL) | 주문 고유 번호 |
| `symbol` | STRING | 종목명 |
| `type` | STRING | 주문 유형 (예: MARKET) |
| `side` | STRING | 주문 방향 (BID: 매수, ASK: 매도) |
| `requested_qty` | NUMERIC | 주문 요청 수량 |
| `filled_qty` | NUMERIC | 실제 체결된 수량 |
| `avg_fill_price` | NUMERIC | 실제 체결 평균가 (NaN 방지 로직 적용) |
| `exchange_order_id` | STRING | 업비트 발급 주문 UUID |
| `status` | STRING | 체결 상태 (FILLED, NEW, CANCELED 등) |


## 5. ⚙️ 운영 환경 변수 설정 (Runtime Environment Configuration)

본 시스템은 GCP(Google Cloud Platform) 인프라를 기반으로 보안성과 확장성을 최우선으로 설계되었다.
모든 민감 정보는 코드와 분리되어 관리된다.

특히 API Key, DB 비밀번호 등 민감 정보는  
컨테이너 내부에 직접 포함하지 않고 **GCP Secret Manager**를 통해 런타임에 주입된다.

---

### 5.1 🔑 주요 환경 변수 요약

| 구분 | 환경 변수 | 설명 |
|---|---|---|
| n8n 기본 | `N8N_PORT` | n8n 서비스 포트 (Cloud Run: 5678) |
|  | `N8N_PROTOCOL` | HTTPS 강제 설정 |
|  | `N8N_HOST` | Cloud Run 서비스 도메인 |
| 데이터베이스 | `DB_TYPE` | PostgreSQL 사용 |
|  | `DB_POSTGRESDB_HOST` | Cloud SQL Unix Socket 경로 |
|  | `DB_POSTGRESDB_PORT` | PostgreSQL 포트 (5432) |
|  | `DB_POSTGRESDB_DATABASE` | n8n 메타데이터 DB |
|  | `DB_POSTGRESDB_USER` | DB 사용자 계정 |
|  | `DB_POSTGRESDB_SCHEMA` | public 스키마 |
| 보안 | `N8N_ENCRYPTION_KEY` | n8n 내부 자격 증명 암호화 키 |
|  | `N8N_BLOCK_ENV_ACCESS_IN_NODE` | 노드 내부 env 직접 접근 차단 |
| 노드 실행 | `NODE_FUNCTION_ALLOW_EXTERNAL` | 외부 라이브러리 허용 (jsonwebtoken, uuid) |
|  | `NODE_FUNCTION_ALLOW_BUILTIN` | Node.js 내장 모듈 허용 범위 |
| 운영 | `GENERIC_TIMEZONE` | UTC 기준 통일 |
|  | `QUEUE_HEALTH_CHECK_ACTIVE` | 워크플로우 큐 헬스체크 활성화 |

---

### 5.2 🔐 Secret Manager 연동 항목

| Secret 이름 | 사용 목적 |
|---|---|
| `DB_POSTGRESDB_PASSWORD` | PostgreSQL 접속 비밀번호 |
| `N8N_ENCRYPTION_KEY` | n8n 자격 증명 암호화 |
| `UPBIT_ACCESS_KEY` | 업비트 API Access Key |
| `UPBIT_SECRET_KEY` | 업비트 API Secret Key |

> 모든 Secret은 **환경 변수로만 주입**되며,  
> 워크플로우 및 코드 상에 직접 노출되지 않는다.

---

## 6. 🔄 핵심 워크플로우 설계 (Core Workflow Design)

본 시스템은 기능 단위로 분리된 다수의 n8n 워크플로우를 통해
제안 생성 → 승인 → 주문 실행 → 포지션 감시 → 사용자 상호작용의 전 과정을 처리한다.

---

### 6.1 💬 AI 기반 트레이딩 챗봇 워크플로우  

| 구성 |
|---|
| <img width="680" height="469" alt="image" src="https://github.com/user-attachments/assets/f503e996-f18b-4585-83b6-776abc318aa3" /> |


#### 🎯 목적
Slack을 통해 사용자와 **자연어 기반으로 상호작용**하며,  
**실시간 시장 정보 조회**, **포지션 상태 확인**, **전략 관련 질의 응답**을 제공하는  
**AI 보조 트레이딩 인터페이스**를 구현한다.

#### 🔄 주요 흐름
- **Slack Trigger**를 통해 사용자 메시지 수신  
- **GPT 기반 AI Agent** 호출을 통한 의도 파악 및 응답 생성  
- 필요 시 **외부 도구(API, DB)** 를 활용한 정보 조회  
- 생성된 응답을 **Slack 메시지로 반환**  
- 대화 이력을 **Chat Memory DB에 저장**하여 컨텍스트 유지  

#### 🧩 중요 노드
- **Slack Trigger**  
  → 사용자 메시지 수신 및 워크플로우 진입점  
- **AI Agent (GPT)**  
  → 자연어 이해, 전략 해석, Tool Calling 수행  
- **Chat Memory DB**  
  → 이전 대화 컨텍스트 저장 및 연속성 유지  
- **HTTP Request (Upbit API)**  
  → 실시간 시세 및 시장 데이터 조회  

---

### 6.2 📄 투자 제안 생성 워크플로우  

본 워크플로우는 **투자 제안서(Draft)를 생성하고 사용자에게 전달**하기까지의 과정을 담당한다.  
가독성과 책임 분리를 위해 **두 개의 워크플로우로 분리**되어 있으며,  
각각은 명확한 역할을 가진다.

---

#### 6.2.1 워크플로우 구성 개요

| 구분 | 역할 |
|---|---|
| **Workflow 1** | 사용자 입력 수신 및 투자 제안서(Draft) 생성 |
| **Workflow 2** | Draft 기반 승인 처리 및 실제 주문 실행 준비 |

---

### 🔹 **Workflow 1 – 투자 제안서 생성 및 알림**

| 구성 |
|---|
| <img width="523" height="340" alt="image" src="https://github.com/user-attachments/assets/3bbec077-0d9f-42c1-99a1-088ec0c8eec0" /> |

#### 🎯 목적
사용자의 입력값을 기반으로  
**매매 조건을 정리한 투자 제안서(Draft)** 를 생성하고  
이를 **Slack을 통해 사용자에게 전달**한다.

#### 🧩 주요 노드 설명

| 노드 | 역할 |
|---|---|
| **Webhook** | 외부 요청 진입점 (자산, 예산, 리스크 조건 수신) |
| **Code (Slack 입력값 파싱)** | Slack Payload 파싱 및 입력값 정규화 |
| **Code (Draft 파라미터 생성)** | 익절/손절 비율 계산 및 Draft 데이터 구성 |
| **Execute SQL (Draft 저장)** | `draft_proposals` 테이블에 제안서 저장 |
| **Slack Post Message** | 생성된 투자 제안서 요약을 사용자에게 전송 |

> ✔️ 이 단계에서는 **실제 거래는 발생하지 않으며**,  
> 사용자는 제안 내용을 확인만 한다.

---

### 🔹 **Workflow 2 – Draft 승인 처리 및 주문 준비**

| 구성 |
|---|
| <img width="934" height="536" alt="image" src="https://github.com/user-attachments/assets/8397242a-7b9c-465c-9053-489ab9b59ae4" />  |

#### 🎯 목적
사용자의 승인/거절 액션을 처리하고,  
**승인된 Draft에 한해 주문 실행 단계로 진입**한다.

#### 🧩 주요 노드 설명

| 노드 | 역할 |
|---|---|
| **Respond to Webhook** | Slack Interactive Button 이벤트 수신 |
| **Lock Draft (PROCESSING)** | Draft 상태 잠금 (중복 실행 방지) |
| **Get Draft** | 승인 대상 Draft 정보 조회 |
| **IF (승인 / 거절 분기)** | 사용자 의사에 따른 흐름 분기 |
| **HTTP Request (Upbit 시세 조회)** | 주문 전 최신 시세 확인 |
| **HTTP Request (Upbit 주문 API)** | 실제 매수 주문 실행 |
| **Insert Order** | 주문 이력 저장 |
| **Finalize Draft** | Draft 상태 EXECUTED로 변경 |
| **Create Position Record** | 포지션 감시용 데이터 생성 |
| **Slack 메시지 전송** | 승인 결과 및 주문 결과 사용자 알림 |

> ✔️ **명시적 사용자 승인 없이는 주문이 실행되지 않도록 설계**되어 있으며,  
> Draft 잠금 로직을 통해 **Idempotency**를 보장한다.

---

## 6. 🚨 트러블슈팅 (Troubleshooting)

## 🛠️ TradingBot 프로젝트 트러블슈팅 요약 (7 Cases)

| 트러블 종류 | 문제 현상 | 근본 원인 | 해결 방법 |
|---|---|---|---|
| **네트워크 인증** | Upbit API `401 Unauthorized`<br>`This is not a verified IP` | Cloud Run의 **유동 Outbound IP**로 인해 업비트에 등록된 IP와 불일치 | **Serverless VPC Connector + Cloud NAT** 구성 → Outbound IP 고정 후 업비트 콘솔에 등록 |
| **API 인증 (JWT)** | `/v1/accounts` 호출 시 `invalid_access_key` | Upbit Private API는 단순 API Key가 아닌 **JWT(access_key, nonce, query_hash)** 필수 | Code Node에서 **요청마다 JWT 생성** + GCP Secret Manager로 키 주입 |
| **n8n 보안 정책** | `access to env vars denied` | n8n v1.x 이상에서 **Code Node의 env 접근 기본 차단** | `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` 설정으로 명시적 허용 |
| **심볼 데이터 오류** | `404 Code not found`<br>`KRW-KRW-ETH` | 종목 코드 보정 로직 중복 적용으로 **접두사 중복** | `symbol.startsWith("KRW-") ? symbol : "KRW-"+symbol` 정규화 로직 단일화 |
| **주문 로직 오류** | Slack은 “손절 완료”, 실제 계좌에는 코인 잔존 (유령 매도) | **업비트 최소 주문 금액(5,000원)** 미달 주문 거절을 확인하지 않고 DB 상태만 변경 | `OrderValue = price × qty` 검증 후 5,000원 미만이면 `KEEP` 유지 + 수동 매도 알림 |
| **워크플로우 중단** | DB에 감시 종목 없을 때 전체 플로우 중단 | n8n은 **노드 결과가 없으면(No output)** 워크플로우 중단 | DB 조회 노드에 **Always Output Data** 옵션 활성화 |
| **인터페이스/알림** | Slack 메시지에 종목명·평단가·수량이 빈칸 | `upbit market` 노드가 이전 DB 데이터를 **덮어씀** | 최종 Code Node에서 `$("Item Lists(activePositions)").item.json`로 이전 노드 데이터 명시적 참조 |

## 7. 🚀 한계 및 향후 개선 사항 (Limitations & Future Improvements)

<img width="2752" height="1536" alt="향후 및 개선사항" src="https://github.com/user-attachments/assets/b7b26d62-89fa-4e60-95e3-f46401dec1ec" />


> **"매매 기록을 저장해 손실 종목 추천을 방지하고, 전체 자산을 한눈에 확인하는 웹 대시보드를 구축한다."**

### 🛠️ 주요 개선 계획
* **손실 데이터 학습:** 매매 결과를 기록하고 손실이 컸던 종목은 추천에서 제외하도록 로직을 개선한다.
* **웹 관리 페이지:** 자산 변동 추이를 차트로 확인하고 시스템을 직접 조작할 수 있는 전용 웹사이트를 만든다.


