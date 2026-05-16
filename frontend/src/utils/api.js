import { API_URL } from '../config';

// 모든 fetch 호출의 반복 (Authorization 헤더, Content-Type, JSON.stringify) 을 한 곳에.
//
// 사용:
//   await apiFetch('/me', { token })                            // GET + Bearer
//   await apiFetch('/me/points/adjust', { token, method: 'POST', json: { delta: 5000 } })
//   await apiFetch('/login', { method: 'POST', json: { email, password } })  // 비인증
//
// `json` 옵션을 쓰면 body 직렬화 + Content-Type 헤더 자동.
// 직접 FormData 등 다른 body 가 필요하면 `body` 를 그대로 넘기면 됨.
export async function apiFetch(path, { token, json, headers, ...rest } = {}) {
  const finalHeaders = { ...(headers || {}) };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  let body = rest.body;
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  return fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body });
}
