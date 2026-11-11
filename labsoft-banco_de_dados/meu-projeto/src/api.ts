const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

export type SubscriptionPlan = {
  id: number
  name: string
  price: number
  max_users: number
}

export type UserProfile = {
  id: number
  name: string
  subscription_id: number
  age?: number | null
  type: string
  tastes?: string[]
  statistics?: Record<string, unknown>
}

export type AuthResponse = {
  message: string
  user?: {
    id: number
    name: string
    email: string
    subscription_id: number
    subscription_type_id: number
  }
  assinatura?: {
    id: number
    email: string
    subscription_type_id: number
  }
}

export type UserBookRecord = {
  id: number
  id_livro: number
  id_usuario: number
  lido: boolean
  baixado: boolean
  lendo: boolean
  pagina_lendo: number | null
  favoritado: boolean
  visualizado: boolean
}

export type UserReview = {
  id: number
  id_usuario: number
  id_livro: number
  rating: number
  comment: string | null
  nome_usuario: string
}

export type ReviewResponse = {
  id_avaliacao: number
  id_livro: number
  estrelas: number
  comentario?: string | null
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string") {
    return payload.message
  }
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = payload.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0]
      if (typeof firstError === "object" && firstError !== null && "msg" in firstError && typeof firstError.msg === "string") {
        return firstError.msg
      }
    }
  }
  return fallback
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    })
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Não foi possível concluir a operação."))
  }
  return payload as T
}

export function fetchSubscriptionPlans() {
  return request<SubscriptionPlan[]>("/auth/plans")
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function register(email: string, password: string, subscriptionTypeId: number) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      subscription_type_id: subscriptionTypeId,
    }),
  })
}

export function fetchUserProfile(userId: number) {
  return request<UserProfile[]>(`/data/usuarios?offset=0&limit=100`).then((users) => {
    const user = users.find((item) => item.id === userId)
    if (!user) throw new Error("Não foi possível carregar o perfil.")
    return user
  })
}

export function fetchUserBookRecords(userId: number) {
  return request<UserBookRecord[]>(`/data/livro_usuario?id_usuario=${userId}&offset=0&limit=100`)
}

export function updateUserBookRecord(
  record: UserBookRecord,
  field: "lido" | "baixado" | "favoritado" | "lendo" | "pagina",
  value: boolean | number,
) {
  const path = field === "pagina" ? "pagina" : field
  const key = field === "pagina" ? "pagina_lendo" : field
  return request<{ message: string }>(`/data/livros_usuario/${path}`, {
    method: "PATCH",
    body: JSON.stringify({ id_livro_usuario: record.id, [key]: value }),
  })
}

export function createUserBookRecord(userId: number, bookId: number, values: Partial<UserBookRecord> = {}) {
  return request<{ livro_usuario: { id_livro_usuario: number } }>("/data/livro_usuario", {
    method: "POST",
    body: JSON.stringify({
      id_usuario: userId,
      id_livro: bookId,
      lido: values.lido ?? false,
      baixado: values.baixado ?? false,
      lendo: values.lendo ?? false,
      pagina_lendo: values.pagina_lendo ?? null,
      favoritado: values.favoritado ?? false,
    }),
  })
}

export function fetchUserReviews(userId: number) {
  return request<UserReview[]>(`/data/avaliacoes?id_usuario=${userId}&offset=0&limit=100`)
}

export function fetchBookReviews(bookId: number) {
  return request<UserReview[]>(`/data/avaliacoes?id_livro=${bookId}&offset=0&limit=100`)
}

export function createReview(userId: number, bookId: number, stars: number, text: string) {
  return request<{ avaliacao: ReviewResponse }>("/data/avaliacoes", {
    method: "POST",
    body: JSON.stringify({ id_usuario: userId, id_livro: bookId, estrelas: stars, comentario: text }),
  })
}

export function updateReview(reviewId: number, userId: number, bookId: number, stars: number, text: string) {
  return request<{ message: string }>(`/data/avaliacoes`, {
    method: "PUT",
    body: JSON.stringify({
      id_avaliacao: reviewId,
      id_usuario: userId,
      id_livro: bookId,
      estrelas: stars,
      comentario: text,
    }),
  })
}

export function deleteReview(reviewId: number) {
  return request<{ message: string }>("/data/avaliacoes", {
    method: "DELETE",
    body: JSON.stringify({ id_avaliacao: reviewId }),
  })
}

export function listUsersBySubscription(subscriptionId: number) {
  return request<UserProfile[]>(`/data/usuarios?id_assinatura=${subscriptionId}`)
}

export function createUserProfile(subscriptionId: number, name: string, type: string = "leitor", age?: number | null) {
  return request<{ message: string; user: UserProfile }>("/data/usuarios", {
    method: "POST",
    body: JSON.stringify({
      id_assinatura: subscriptionId,
      nome: name,
      tipo_usuario: type,
      idade: age ?? null,
      gostos: [],
      estatisticas: {},
    }),
  })
}
