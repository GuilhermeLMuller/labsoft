const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 100;

const endpoints = {
  livros: "/data/livros",
  assinatura: "/data/assinaturas",
  tipo_assinatura: "/auth/plans",
};

async function request(path, { params, signal, body, method = "GET" } = {}) {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((item) => item.msg).filter(Boolean).join(", ")
      : data?.detail;
    throw new Error(data?.message || detail || `Falha ao consultar a API (${response.status}).`);
  }

  return data;
}

function normalizeRows(entityKey, data) {
  if (!Array.isArray(data)) {
    throw new Error("A API retornou uma resposta inválida para a lista de registros.");
  }

  if (entityKey === "tipo_assinatura") {
    return data.map((plan) => ({
      id_tipo_assinatura: plan.id,
      nome: plan.name,
      valor: plan.price,
      maximo_acessos: plan.max_users,
    }));
  }

  return data;
}

export async function getDatabaseRows(entityKey, { filter, offset = 0, signal } = {}) {
  const endpoint = endpoints[entityKey];
  if (!endpoint) throw new Error("Tabela não suportada pela API.");

  const params = { offset, limit: PAGE_SIZE };
  if (filter?.value) {
    const filterKeys = {
      livros: {
        titulo: "titulo",
        autor: "autor",
        ano_de_publicacao: "ano_publicacao",
        pais: "pais",
        linguagem: "linguagem",
        genero: "genero",
      },
      assinatura: {
        email: "email",
        id_tipo_assinatura: "id_tipo_assinatura",
      },
    };
    const apiKey = filterKeys[entityKey]?.[filter.field];
    if (apiKey) params[apiKey] = filter.value;
  }

  const data = await request(endpoint, {
    params: entityKey === "tipo_assinatura" ? undefined : params,
    signal,
  });
  return normalizeRows(entityKey, data);
}

export async function createBook(book) {
  return request("/data/livros", { method: "POST", body: book });
}

export { PAGE_SIZE };
