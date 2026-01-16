# 🤖 n8n & GPT-4o mini 기반: 지능형 가상자산 자동 매매 파이프라인 구축

**GCP 인프라와 n8n 워크플로우를 활용한 데이터 기반 전략 수립 및 실시간 자동 거래 시스템**


## 1. 👤 팀원 소개

| | <img src="https://github.com/YongwanJoo.png" width="150"> | <img src="https://github.com/woojinni.png" width="150"> | 
| :---: | :---: | :---: |
| **김민채** | **주용완** | **장우진** |
|  | [@YongwanJoo](https://avatars.githubusercontent.com/YongwanJoo) | [@woojinni](https://github.com/woojinni) | 

<br>

## 2. ⚙️ n8n 소개 (Workflow Automation Engine)

본 프로젝트는 **n8n**을 핵심 오케스트레이션 도구로 활용하여  
가상자산 자동 매매 파이프라인 전체를 **이벤트 기반 워크플로우**로 구성하였다.

n8n은 **노드(Node) 기반 시각적 워크플로우 자동화 플랫폼**으로,  
API 호출 · 데이터 가공 · 조건 분기 · 외부 서비스 연동을 코드와 GUI를 혼합해 유연하게 설계할 수 있다.

### 🔹 왜 n8n을 선택했는가?

- **비즈니스 로직과 인프라 로직의 분리**
  - 매매 전략, 승인 로직, 상태 관리 등을 워크플로우 단위로 명확히 분리
- **이벤트 중심 아키텍처**
  - 웹훅(Webhook), 스케줄, 승인 트리거 등 다양한 진입점 제공
- **API 친화적 구조**
  - Upbit / Bithumb API, Slack, GPT API 등 외부 서비스 연동이 자연스러움
- **Self-hosted + Cloud 친화**
  - GCP 환경에서 직접 배포 및 제어 가능 (보안·확장성 확보)

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
