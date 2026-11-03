const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

export type SubscriptionPlan = {
  id: number
  name: string
  price: number
  max_users: number
}

export type AuthResponse = {
  message: string
  user?: {
    id: number
    name: string
    email: string
  }
  assinatura?: {
    id: number
    name: string
    email: string
  }
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

export function register(name: string, email: string, password: string, subscriptionTypeId: number) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      subscription_type_id: subscriptionTypeId,
    }),
  })
}
