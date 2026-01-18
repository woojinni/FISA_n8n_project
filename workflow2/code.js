// 1. n8n 자격증명에서 키 안전하게 불러오기 (this. 없이 호출)
//const creds = await this.getCredentials('Upbit_Real_Keys');
//const accessKey = creds.user;
//const secretKey = creds.password;
// 1. GCP 환경변수에서 키 로드 (
const accessKey = $env["UPBIT_ACCESS_KEY"];
const secretKey = $env["UPBIT_SECRET_KEY"];


// 1. GCP 환경변수에서 업비트 키 바로 불러오기
//const accessKey = $env["UPBIT_OPEN_API_ACCESS_KEY"]; 
//const secretKey = $env["UPBIT_OPEN_API_SECRET_KEY"];

//// 라이브러리 로드
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


//const accessKey = $json.accessKey;
//const secretKey = $json.secretKey;


// 2. 이전 노드들에서 데이터 가져오기 (기존 로직 유지)
const draft = $node["Get Draft"].json;
const ticker = $node["HTTP Request(시세 조회)"].json;

const budgetKrw = Number(draft.budget_krw);
const currentPrice = Number(ticker.trade_price);
// 수정 코드 (심볼에 KRW-가 없으면 자동으로 붙여줌)
const symbol = draft.symbol.startsWith('KRW-') ? draft.symbol : 'KRW-' + draft.symbol;

// 3. 수량 및 익절/손절가 계산 (수수료 0.05% 반영 수정)
// 실제 매수되는 수량은 수수료 0.05%를 뺀 만큼입니다.
let calculatedQty = (budgetKrw / currentPrice) * 0.9995;
calculatedQty = Number(calculatedQty.toFixed(8));

const tpPrice = currentPrice * (1 + Number(draft.tp_pct));
const slPrice = currentPrice * (1 - Number(draft.sl_pct));

// 4. [신규] 업비트 매수 주문용 파라미터 구성
const side = 'bid';           // 매수
const ord_type = 'price';     // 시장가 매수
const query = `market=${symbol}&side=${side}&price=${budgetKrw}&ord_type=${ord_type}`;


// 5. [신규] 쿼리 해시 및 JWT 토큰 생성
const hash = crypto.createHash('sha512');
const queryHash = hash.update(query, 'utf-8').digest('hex');

const payload = {
    access_key: accessKey,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
};

const token = jwt.sign(payload, secretKey);

// 6. 결과 반환 (계산 값 + 주문용 토큰)
return {
    // DB 저장용 (기존)
    real_qty: calculatedQty,
    tp_price: tpPrice,
    sl_price: slPrice,
    symbol: symbol,
    version_id: draft.version_id,
    current_price: currentPrice,
    
    // 업비트 API 호출용 (신규)
    token: token,
    order_market: symbol,
    order_budget: budgetKrw,
    order_side: side,
    order_type: ord_type
};