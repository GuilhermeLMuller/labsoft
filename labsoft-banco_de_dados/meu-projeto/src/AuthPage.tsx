import { useEffect, useState, type FormEvent } from "react"
import { fetchSubscriptionPlans, login, register, type SubscriptionPlan } from "./api"

export type AuthMode = "login" | "signup"

type Props = {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
  onSuccess: (name: string) => void
}

const inputClass =
  "h-12 w-full rounded-xl border border-[#ddd7ca] bg-white px-4 text-[15px] text-[#25251f] outline-none transition placeholder:text-[#9a968c] focus:border-[#245947] focus:ring-2 focus:ring-[#245947]/15"

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#3b3a33]">{label}</span>
      {children}
      {error && (
        <span className="mt-1.5 block text-[13px] text-[#a8402b]" role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

export default function AuthPage({ mode, onModeChange, onClose, onSuccess }: Props) {
  const isSignup = mode === "signup"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [subscriptionTypeId, setSubscriptionTypeId] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setErrors({})
    if (mode !== "signup") return

    let active = true
    fetchSubscriptionPlans()
      .then((availablePlans) => {
        if (!active) return
        setPlans(availablePlans)
        setSubscriptionTypeId((current) => current || availablePlans[0]?.id || "")
      })
      .catch((error: Error) => {
        if (active) setErrors({ form: error.message })
      })
    return () => {
      active = false
    }
  }, [mode])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (isSignup && name.trim().length < 2) next.name = "Informe seu nome."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Digite um e-mail válido."
    if (password.length < 8) next.password = "A senha precisa ter ao menos 8 caracteres."
    if (isSignup && !subscriptionTypeId) next.subscription = "Selecione um plano."
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setIsSubmitting(true)
    try {
      const response = isSignup
        ? await register(name.trim(), email, password, Number(subscriptionTypeId))
        : await login(email, password)
      const display = response.user?.name || response.assinatura?.name || email.split("@")[0]
      onSuccess(display)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Não foi possível concluir a operação." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      aria-label={isSignup ? "Criar conta" : "Entrar"}
      aria-modal="true"
      className="fixed inset-0 z-50 grid overflow-y-auto bg-[#f8f5ef] lg:grid-cols-[1.05fr_1fr]"
      role="dialog"
    >
      <aside className="relative hidden overflow-hidden bg-[#183b2e] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-16 -left-4 h-64 w-64 rounded-full bg-[#245947]/60" />

        <div className="relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9d5a5] text-[#183b2e]">
            <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
              <path d="M4 21V5" />
            </svg>
          </span>
          <span className="font-serif text-2xl font-semibold tracking-tight">POLIvraria</span>
        </div>

        <div className="relative max-w-md">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#e9d5a5]">
            {isSignup ? "Comece sua estante" : "Bem-vindo de volta"}
          </p>
          <h2 className="font-serif text-[44px] leading-[1.1]">
            {isSignup
              ? "Cada livro começa com uma primeira página."
              : "Sua próxima página está esperando por você."}
          </h2>
          <ul className="mt-10 space-y-4 text-[15px] text-white/80">
            {["Acompanhe sua leitura com barra de progresso", "Salve favoritos e receba recomendações", "Veja suas estatísticas mensais de leitura"].map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e9d5a5]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/55">Mais de 12 mil leitores já leem na POLIvraria todos os dias.</p>
      </aside>

      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl font-semibold tracking-tight text-[#25251f] lg:invisible">POLIvraria</span>
          <button
            aria-label="Fechar"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd7ca] text-[#25251f] transition hover:bg-[#eee9df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#245947]"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <div className="mb-8 grid grid-cols-2 rounded-full border border-[#ddd7ca] bg-[#efeadf] p-1 text-sm font-semibold" role="tablist">
            {(["login", "signup"] as const).map((item) => (
              <button
                aria-selected={mode === item}
                className={`h-10 rounded-full transition ${mode === item ? "bg-[#245947] text-white shadow-sm" : "text-[#5f5d54] hover:text-[#245947]"}`}
                key={item}
                onClick={() => onModeChange(item)}
                role="tab"
                type="button"
              >
                {item === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <h1 className="font-serif text-4xl leading-tight text-[#25251f]">
            {isSignup ? "Crie sua conta" : "Entre na sua conta"}
          </h1>
          <p className="mt-2 text-[15px] text-[#68665e]">
            {isSignup ? "Leva menos de um minuto. É gratuito." : "Continue de onde parou na sua leitura."}
          </p>

          <form className="mt-8 space-y-5" noValidate onSubmit={submit}>
            {isSignup && (
              <Field error={errors.name} label="Nome completo">
                <input autoComplete="name" className={inputClass} onChange={(e) => setName(e.target.value)} placeholder="Marina Souza" value={name} />
              </Field>
            )}
            {isSignup && (
              <Field error={errors.subscription} label="Plano">
                <select
                  className={inputClass}
                  disabled={plans.length === 0}
                  onChange={(event) => setSubscriptionTypeId(Number(event.target.value))}
                  value={subscriptionTypeId}
                >
                  {plans.length === 0 ? (
                    <option value="">Carregando planos...</option>
                  ) : (
                    plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price.toFixed(2).replace(".", ",")}
                      </option>
                    ))
                  )}
                </select>
              </Field>
            )}
            <Field error={errors.email} label="E-mail">
              <input autoComplete="email" className={inputClass} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" type="email" value={email} />
            </Field>
            <Field error={errors.password} label="Senha">
              <span className="relative block">
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className={`${inputClass} pr-20`}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[13px] font-semibold text-[#245947] hover:bg-[#245947]/10"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </span>
            </Field>

            {isSignup ? (
              <p className="text-[13px] leading-relaxed text-[#68665e]">
                Ao criar a conta, você concorda com os Termos de Uso e a Política de Privacidade da POLIvraria.
              </p>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-[#3b3a33]">
                  <input checked={remember} className="h-4 w-4 accent-[#245947]" onChange={(e) => setRemember(e.target.checked)} type="checkbox" />
                  Manter conectado
                </label>
                <a className="font-semibold text-[#245947] underline-offset-4 hover:underline" href="#recuperar">
                  Esqueci a senha
                </a>
              </div>
            )}

            {errors.form && (
              <p className="text-[13px] leading-relaxed text-[#a8402b]" role="alert">
                {errors.form}
              </p>
            )}
            <button
              className="h-12 w-full rounded-full bg-[#245947] text-[15px] font-bold text-white transition hover:bg-[#1b4637] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245947]"
              disabled={isSubmitting || (isSignup && plans.length === 0)}
              type="submit"
            >
              {isSubmitting ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#68665e]">
            {isSignup ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
            <button
              className="font-bold text-[#245947] underline-offset-4 hover:underline"
              onClick={() => onModeChange(isSignup ? "login" : "signup")}
              type="button"
            >
              {isSignup ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
