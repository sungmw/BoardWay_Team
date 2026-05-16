import { API_URL } from '../config';

// 401 핸들러: AuthContext 가 mount 시 등록. 토큰 만료/위조 시 자동 logout 트리거.
let _unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  _unauthorizedHandler = fn;
}

// 모든 fetch 호출의 반복 (Authorization 헤더, Content-Type, JSON.stringify) 을 한 곳에.
//
// 사용:
//   await apiFetch('/me', { token })                            // GET + Bearer
//   await apiFetch('/me/points/adjust', { token, method: 'POST', json: { delta: 5000 } })
//   await apiFetch('/login', { method: 'POST', json: { email, password } })  // 비인증
//
// `json` 옵션을 쓰면 body 직렬화 + Content-Type 헤더 자동.
// 직접 FormData 등 다른 body 가 필요하면 `body` 를 그대로 넘기면 됨.
// 401 응답이 오면 setUnauthorizedHandler 로 등록된 핸들러를 호출 (보통 logout).
export async function apiFetch(path, { token, json, headers, skipAuthHandler, ...rest } = {}) {
  const finalHeaders = { ...(headers || {}) };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  let body = rest.body;
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  const response = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body });

  // 로그인/회원가입 같이 인증 자체가 목적인 호출은 skipAuthHandler 로 우회.
  if (response.status === 401 && !skipAuthHandler && _unauthorizedHandler) {
    try { await _unauthorizedHandler(); } catch (e) { console.error('Unauthorized handler error', e); }
  }
  return response;
}
