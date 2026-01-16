const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 1. 발급받은 업비트 키 입력 (이전 설정 참고)
// .trim()을 붙여 앞뒤의 불필요한 공백과 따옴표를 강제로 제거합니다.
const access_key = $env["UPBIT_ACCESS_KEY"].replace(/['"]+/g, '').trim();
const secret_key = $env["UPBIT_SECRET_KEY"].replace(/['"]+/g, '').trim();

// 2. JWT 페이로드 생성
const payload = {
    access_key: access_key,
    nonce: uuidv4(),
};

// 3. 서명된 토큰 생성
const token = jwt.sign(payload, secret_key);

return {
  token: token
};

