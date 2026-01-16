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

 📉 기존 자동 매매 시스템 **시장 분석**

가상자산 시장의 성숙과 함께 개인 투자자들의 **알고리즘을 이용한 트레이딩** 수요는 폭발적으로 증가하고 있다. 하만 현재 개인 투자자가 접근 가능한 자동 매매 환경은 양극화되어 있으며, 명확한 한계점이 존재한다.

1) 💔 기존 솔루션의 한계

| 구분 | 특징 | 주요 한계점 (Pain Points) |
|------|------|---------------------------|
| SaaS형 플랫폼 (3Commas, CoinSutra 등) | • 웹 기반 설정<br>• 사용이 편리함 | • 높은 구독료 (월 $50~100+)<br>• 전략의 블랙박스화 (세부 로직 수정 불가)<br>• 플랫폼이 지원하는 거래소/지표만 사용 가능 |
| Python 스크립트 (Custom Dev) | • 무한한 자유도<br>• 낮은 비용 | • 유지보수의 어려움 (에러 핸들링, 로그 관리)<br>• 인프라 관리 부담 (서버 다운, 네트워크 이슈)<br>• 시각화된 모니터링 UI 부재 |


기존 자동 매매 솔루션은 크게 **SaaS형 플랫폼, 거래소 내장 봇, 순수 커스텀 스크립트**로 구분된다.
그러나 이들 방식은 각각 **확장성·유연성·운영 안정성 측면에서 구조적인 한계**를 가진다.
**SaaS형 플랫폼**은 웹 기반 UI와 빠른 설정이라는 장점이 있으나, 전략 로직이 **블랙박스화**되어 있으며 고정된 지표와 거래소만 지원한다. 이는 시장 상황 변화나 개인화된 전략 실험이 필요한 사용자에게 결정적인 제약으로 작용한다.
**Python 기반의 완전 커스텀 개발**은 높은 자유도를 제공하지만, 서버 운영·에러 핸들링·로그 관리·모니터링 UI 구축까지 모두 개발자가 직접 책임져야 하므로 **운영 비용과 유지보수 부담이 급격히 증가**한다.

2) ❤️‍🩹 왜 n8n + 커스텀 자동화가 대안인가?

**n8n**은 전략 로직의 **가시성과 확장성** 측면에서 기존 방식과 명확히 구분된다.
전략의 모든 판단 흐름이 **워크플로우**로 명시적으로 표현되므로 블랙박스 문제가 제거되며, 필요 시 Python·JavaScript 코드 노드를 통해 세밀한 커스터마이징도 가능하다. 또한 컨테이너 기반(Docker) 배포를 통해 인프라 안정성을 확보하면서도, **SaaS 대비 비용을 크게 절감**할 수 있다.

결과적으로 n8n + 커스텀 자동화는
**“전략은 내가 설계하고, 운영은 플랫폼이 보조한다”**는 중간 지점을 제공하며,
단순 매매 봇을 넘어 **데이터 기반 의사결정 자동화 시스템**으로 확장 가능한 구조적 해답이 된다.

3) ⛳️ 본 프로젝트의 목표

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



## 한계 및 향후 개선 사항 (Limitations & Future Improvements)
프로젝트의 지속적인 발전과 고도화를 위해 다음과 같은 기능을 추가로 구현할 계획입니다.

① 투자 성과 분석을 위한 주간 리포트(Weekly Report) 기능 도입
단순 매매 실행을 넘어, 사용자가 자신의 투자 습관을 파악하고 전략을 수정할 수 있도록 정기적인 피드백 루프를 구축하고자 합니다.

데이터 시각화: 한 주간 수익이 가장 높았던 항목과 손실이 컸던 항목을 분류하여 슬랙(Slack)으로 요약 전송합니다.

성과 분석: 승률, 수익률, 최대 손실 폭(MDD) 등 주요 지표를 리포트화하여 투자의 투명성을 높이고 시스템에 대한 신뢰도를 확보합니다.

② 매매 데이터베이스(DB) 기반의 추천 로직 최적화
모든 매매 내역을 DB에 기록하고 이를 분석하여, 시간이 지날수록 더 높은 승률을 내는 개인 맞춤형 AI 모델로 고도화합니다.

매매일지 자동 기록: n8n과 외부 DB(PostgreSQL 등)를 연동하여 사용자의 모든 주문 내역과 체결 결과(익절/손절 여부)를 실시간으로 저장합니다.

손실 종목 필터링: 과거 데이터 분석을 통해 반복적으로 손실을 유발하는 종목이나 시장 상황을 파악하고, AI 추천 시 해당 항목의 우선순위를 낮추거나 제외하는 로직을 적용합니다.

지능형 추천 시스템: 누적된 데이터를 AI가 학습하여 사용자의 투자 성향과 시장의 흐름에 최적화된 종목을 우선적으로 제안합니다.


