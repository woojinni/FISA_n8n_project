const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { URLSearchParams } = require('url');

const access_key = $env["UPBIT_ACCESS_KEY"].replace(/['"]+/g, '').trim();
const secret_key = $env["UPBIT_SECRET_KEY"].replace(/['"]+/g, '').trim();

// 1. 업비트 규격에 맞게 파라미터를 '알파벳 순서'로 정의합니다.
const body = {
    market: $json.symbol,
    ord_type: 'market',
    side: 'ask',
    volume: String($json.qty) // 정밀도 유지를 위해 문자열로 변환
};

// 2. Query String 생성 (알파벳 순서로 인코딩됨)
const query = new URLSearchParams(body).toString();

// 3. Hash 생성
const queryHash = crypto.createHash('sha512').update(query, 'utf-8').digest('hex');

// 4. JWT 페이로드 생성
const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
};

const token = jwt.sign(payload, secret_key);

return {
  token: token,
  body: body // 이 body 객체를 그대로 다음 노드에 넘깁니다.
};