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

특히 가상자산 시장은

- 24시간 운영되는 실시간 시장
- API 기반 주문·시세 접근 환경
- 다양한 기술 지표 및 데이터 분석 가능성

이라는 점에서 **자동화·이벤트 기반 시스템을 설계하기에 매우 적합한 도메인**이다.

본 프로젝트에서는  
단순히 “자동으로 사고파는 프로그램”을 만드는 것을 넘어,  

- **데이터 기반 전략 수립**
- **사용자 승인 기반의 반자동 매매 구조**
- **상태 전이를 고려한 안전한 주문 흐름**

등을 포함한 **실제 서비스 수준의 매매 파이프라인**을 목표로 한다.

이를 통해  
n8n을 활용한 워크플로우 자동화가  
**현실적인 금융/트레이딩 문제를 어떻게 구조적으로 해결할 수 있는지**를  
직접 설계하고 검증해보고자 한다.


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

### 4.1 🗄️ 데이터베이스 스키마 (Database Schema)

본 시스템은 **FSM 기반 상태 관리**와 실제 거래 환경의 불확실성(부분 체결, 취소 등)을 고려하여  
테이블을 역할별로 명확히 분리하여 설계하였다.

---

#### 4.1.1 `draft_proposals` (투자 제안서 관리 테이블)

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

#### 4.1.2 `positions` (보유 종목 감시 테이블)

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

#### 4.1.3 `orders` (주문 및 체결 이력 테이블)

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





