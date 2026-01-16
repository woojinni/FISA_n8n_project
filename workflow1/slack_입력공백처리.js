// 1. 슬랙에서 보낸 텍스트 가져오기
const rawText = $json.body.text || "";
// 2. 공백을 기준으로 쪼개기 (예: ["BTC", "5000", "0.02", "0.02"])
const params = rawText.split(' ');

return {
  json: {
    user: $json.body.user_name || "unknown",
    symbols: [params[0] || "BTC"], // 배열로 변환하여 에러 방지
    budget_krw: parseInt(params[1]) || 5000,
    tp_pct: parseFloat(params[2]) || 0.03,
    sl_pct: parseFloat(params[3]) || 0.02,
    trailing_pct: 0.01,
    risk: 'neutral'
  }
};