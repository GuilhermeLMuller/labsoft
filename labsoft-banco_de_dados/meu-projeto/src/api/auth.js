// Camada de acesso à API de autenticação.
// Todas as chamadas ao back-end ficam aqui, para que as telas não dependam
// dos detalhes da API. Quando o back-end estiver pronto, basta ajustar este arquivo.

// TODO: definir a URL base real da API (ex.: variável de ambiente do Vite).
const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000";

async function request(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // TODO: ajustar ao formato de resposta/erro que o back-end definir.
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Não foi possível concluir a operação.");
  }
  return data;
}

export function registerUser({ name, email, password }) {
  // TODO: confirmar com o back-end o endpoint e os campos esperados
  // da API de registro de conta (ex.: POST /auth/register).
  return request("/auth/register", { name, email, password });
}

export function loginUser({ email, password }) {
  // TODO: confirmar com o back-end o endpoint e os campos esperados
  // da API de login (ex.: POST /auth/login).
  // TODO: tratar o retorno (token JWT, cookie de sessão, dados do usuário etc.).
  return request("/auth/login", { email, password });
}
