// 1. 업비트 실제 잔고 가져오기 (문법 수정: $node -> $)
const upbitBalances = $("Upbit Accounts").all().map(item => item.json);

// 2. DB에 기록된 장부 가져오기 (비어있을 경우 필터링 로직 포함)
// Sync Logic 코드 내 filter 부분 수정 예시
const dbPositions = $("Read Positions").all()
  .map(item => item.json)
  .filter(j => 
    Object.keys(j).length > 0 && 
    j.symbol && 
    !['KRW-APENFT', 'KRW-XCORE', 'KRW-VTHO'].includes(j.symbol) // 거래 불가 종목 제외
  );

let newBuys = [];
let manualSells = [];
let activePositions = [];

// [로직 A] 수동 매수 감지: 업비트엔 있는데 DB엔 없는 경우
upbitBalances.forEach(acc => {
    if (acc.currency === 'KRW' || acc.balance == 0) return; // 현금 및 0잔고 제외
    const symbol = 'KRW-' + acc.currency;
    const existsInDb = dbPositions.some(pos => pos.symbol === symbol && pos.state === 'HOLDING');
    
    if (!existsInDb) {
        newBuys.push({
            symbol: symbol,
            qty: acc.balance,
            avg_entry_price: acc.avg_buy_price,
            type: 'NEW_DETECTION'
        });
    }
});

// [로직 B] 수동 매도 감지: DB엔 있는데 실제 잔고엔 없는 경우
dbPositions.forEach(pos => {
    if (pos.state !== 'HOLDING') return;
    const existsInUpbit = upbitBalances.some(acc => 'KRW-' + acc.currency === pos.symbol);
    
    if (!existsInUpbit) {
        manualSells.push({
            ...pos,
            type: 'MANUAL_EXIT'
        });
    } else {
        activePositions.push(pos); // 계속 감시할 종목
    }
});

// n8n 표준 출력 형식으로 반환
return [{
    json: {
        newBuys,
        manualSells,
        activePositions
    }
}];