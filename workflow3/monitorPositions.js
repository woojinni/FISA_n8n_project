// 1. 현재가는 업비트 API 결과($json)에서 가져옵니다.
const currentPrice = Number($json.trade_price); 

// 2. 종목 정보와 보유 수량은 이전 노드(Item Lists)에서 명시적으로 가져옵니다.
const dbData = $("Item Lists(activePositions)").item.json;

const qty = Number(dbData.qty);
const entryPrice = Number(dbData.avg_entry_price);
const tpPrice = Number(dbData.tp_price) || 0;
const slPrice = Number(dbData.sl_price) || 0;

// 3. 현재 보유 가치(평가액) 계산
const orderValue = currentPrice * qty;

// 4. 익절/손절 상태 및 메시지 결정
let action = 'KEEP';
let reason = 'Condition not met';
let statusMsg = '';

// 수동 매수 여부 확인 (목표가와 손절가가 모두 0인 경우)
const isManual = (tpPrice === 0 && slPrice === 0);

if (!isManual) {
    // [자동 매매 종목] 감시 로직
    if (currentPrice >= tpPrice) {
        if (orderValue >= 5000) {
            action = 'SELL_PROFIT';
            statusMsg = '🚀 익절 목표가 도달! 매도를 진행합니다.';
            reason = 'TP reached';
        } else {
            action = 'KEEP';
            statusMsg = '⚠️ 익절가 도달했으나 최소 주문금액(5,000원) 미만입니다.';
            reason = 'TP reached but value low';
        }
    } else if (currentPrice <= slPrice) {
        if (orderValue >= 5000) {
            action = 'SELL_LOSS';
            statusMsg = '📉 손절가 도달! 매도를 진행합니다.';
            reason = 'SL reached';
        } else {
            action = 'KEEP';
            statusMsg = '⚠️ 손절가 도달했으나 최소 주문금액(5,000원) 미만입니다.';
            reason = 'SL reached but value low';
        }
    } else {
        action = 'KEEP';
        statusMsg = '목표가/손절가에 도달하지 않아 감시를 지속합니다.';
        reason = 'Condition not met';
    }
} else {
    // [수동 매수 종목] 감시 로직
    action = 'KEEP';
    statusMsg = '🛠️ 수동 관리 종목으로 실시간 시세만 체크 중입니다.';
    reason = 'Manual monitoring';
}

// 5. 수익률 및 평가손익 계산
const profitPct = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
const profitLoss = (currentPrice - entryPrice) * qty;

// 6. 모든 데이터를 합쳐서 출력
return {
    symbol: dbData.symbol,
    current_price: currentPrice,
    entry_price: entryPrice,
    order_value: orderValue,
    profit_pct: profitPct.toFixed(2) + "%",
    profit_loss: profitLoss,
    action: action,
    reason: reason,
    status_msg: statusMsg, // 이 필드를 슬랙 노드에서 사용하세요!
    is_manual: isManual,
    qty: qty,
    position_id: dbData.position_id,
    version_id: dbData.version_id
};