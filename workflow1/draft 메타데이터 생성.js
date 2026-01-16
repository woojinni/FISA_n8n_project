// 입력 데이터 (Edit Fields에서 정제된 값)
const input = $json;

// 1) 시간 정보 처리 (KST 기준)
const now = new Date();
const kstOffset = 9 * 60 * 60 * 1000; // 9시간 밀리초
const kstDate = new Date(now.getTime() + kstOffset);

// snapshot_at: 'Z'를 제거하여 KST 로컬 시간임을 명시
const snapshot_at = kstDate.toISOString().replace('Z', '');

// TTL: 10분 (KST 기준)
// 기존: 10분 (+ 10 * 60 * 1000)
// 테스트시에만(번거로워서..): 24시간 (+ 24 * 60 * 60 * 1000)
/*const expires_at = new Date(kstDate.getTime() + 10 * 60 * 1000).toISOString().replace('Z', '');*/
// 기존: 10분 (+ 10 * 60 * 1000)
// 수정: 24시간 (+ 24 * 60 * 60 * 1000)
const expires_at = new Date(kstDate.getTime() + 24 * 60 * 60 * 1000).toISOString().replace('Z', '');

// 2) version_id 생성
// 타임스탬프: YYYYMMDDHHMMSS (20260110153022 형식)
const ts = snapshot_at.replace(/[-:.T]/g, '').slice(0, 14);
// 변경 후: 데이터가 없을 경우를 대비해 빈 배열([]) 처리를 해줍니다.
const symbolsKey = ($json.symbols || []).join('_'); 

const version_id = `${ts}-${$json.user || 'user'}-${symbolsKey || 'no-symbol'}`;



// 3) request 객체
const request = {
  user: $json.user,
  symbols: $json.symbols,
  budget_krw: $json.budget_krw,
  risk: $json.risk,
  tp_pct: $json.tp_pct,
  sl_pct: $json.sl_pct,
  trailing_pct: $json.trailing_pct
};

// 4) proposal 객체 (MVP)
// ($json.symbols || []) 를 사용하여 symbols가 null일 때 에러가 나는 것을 방지합니다.
const proposal = {
  assets: ($json.symbols || []).map(symbol => ({
    symbol,
    weight: Number((1 / ($json.symbols?.length || 1)).toFixed(2))
  })),
  rules: {
    take_profit: $json.tp_pct || 0,
    stop_loss: $json.sl_pct || 0,
    trailing_stop: $json.trailing_pct || 0
  }
};

// 5) 최종 출력 (n8n 표준 배열 형식)
return [
  {
    json: {
      version_id,
      status: 'DRAFT',
      request,
      proposal,
      snapshot_at,
      expires_at
    }
  }
];