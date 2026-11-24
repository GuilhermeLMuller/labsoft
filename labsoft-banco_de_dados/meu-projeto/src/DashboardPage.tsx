import { useEffect, useState } from "react"

const api = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
type Admin = { id: number; email: string; password: string }
type Conteudo = {
  id_livro: number
  titulo: string | null
  categorias: string[]
  acessos: number
  lidos: number
  baixados: number
  favoritos: number
}
type Categoria = { categoria: string; acessos: number; lidos: number; baixados: number; livros: number }
type Dashboard = {
  total_usuarios: number
  usuarios_por_tipo: Record<string, number>
  total_acessos: number
  total_lidos: number
  total_baixados: number
  acessos_por_conteudo: Conteudo[]
  acessos_por_categoria: Categoria[]
}

const select = "rounded-xl border border-[#ddd7ca] bg-white px-4 py-2 outline-none focus:border-[#245947]"
const card = "rounded-2xl border border-[#ddd7ca] bg-white/70 p-6"
const nf = new Intl.NumberFormat("pt-BR")
const tipoLabel: Record<string, string> = { administrador: "Administradores", autor: "Autores", leitor: "Leitores", titular: "Titulares" }

export default function DashboardPage({ user, onBack }: { user: Admin; onBack: () => void }) {
  const [data, setData] = useState<Dashboard | null>(null)
  const [limit, setLimit] = useState(20)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(true)

  async function request(path: string, init: RequestInit = {}) {
    const separator = path.includes("?") ? "&" : "?"
    const response = await fetch(`${api}${path}${separator}id_usuario=${user.id}`, {
      ...init,
      headers: { Authorization: `Basic ${btoa(`${user.email}:${user.password}`)}` },
    })
    const body = await response.json()
    if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "Não foi possível carregar o dashboard.")
    return body
  }

  useEffect(() => {
    let active = true
    setBusy(true)
    setMessage("")
    request(`/admin/dashboard?limit=${limit}`)
      .then((result) => { if (active) setData(result) })
      .catch((error) => { if (active) setMessage(error instanceof Error ? error.message : "Erro ao carregar o dashboard.") })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit])

  const maxCategoria = Math.max(1, ...(data?.acessos_por_categoria.map((item) => item.acessos) ?? [1]))
  const maxConteudo = Math.max(1, ...(data?.acessos_por_conteudo.map((item) => item.acessos) ?? [1]))
  const totais = data ? [
    { label: "Usuários", value: data.total_usuarios },
    { label: "Acessos", value: data.total_acessos },
    { label: "Livros lidos", value: data.total_lidos },
    { label: "Livros baixados", value: data.total_baixados },
  ] : []

  return <main className="min-h-screen bg-[#f8f5ef] px-5 py-8 text-[#25251f] sm:px-8">
    <div className="mx-auto max-w-5xl">
      <button className="font-semibold text-[#245947]" onClick={onBack} type="button">← Voltar ao início</button>
      <h1 className="mt-6 font-serif text-4xl">Dashboard</h1>
      <p className="mt-2 text-[#68665e]">Acompanhe usuários, acessos, leituras e downloads do catálogo.</p>
      {message && <p role="alert" className="mt-5 rounded-xl bg-[#f6e3df] p-4 text-[#8a2f22]">{message}</p>}
      {busy && !data && <p role="status" className="mt-8 text-[#68665e]">Carregando dados...</p>}

      {data && <>
        <section aria-label="Totais" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {totais.map((item) => <div className={card} key={item.label}>
            <p className="text-sm text-[#68665e]">{item.label}</p>
            <p className="mt-1 font-serif text-4xl">{nf.format(item.value)}</p>
          </div>)}
        </section>

        <section className={`${card} mt-8`}>
          <h2 className="font-serif text-2xl">Usuários por tipo</h2>
          <ul className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
            {Object.entries(data.usuarios_por_tipo).map(([tipo, total]) => <li key={tipo}>
              <span className="text-[#68665e]">{tipoLabel[tipo] ?? tipo}: </span><span className="font-semibold">{nf.format(total)}</span>
            </li>)}
          </ul>
        </section>

        <section className={`${card} mt-8`}>
          <h2 className="font-serif text-2xl">Acessos por categoria</h2>
          <p className="mt-1 text-sm text-[#68665e]">Livros com várias categorias aparecem em cada uma delas, por isso a soma pode passar do total de acessos.</p>
          {data.acessos_por_categoria.length === 0 && <p className="mt-5 text-[#68665e]">Nenhuma categoria cadastrada.</p>}
          <ul className="mt-5 space-y-4">{data.acessos_por_categoria.map((item) => <li key={item.categoria}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">{item.categoria}</h3>
              <p className="text-sm text-[#68665e]">{nf.format(item.acessos)} acessos, {nf.format(item.lidos)} lidos, {nf.format(item.baixados)} baixados, {nf.format(item.livros)} {item.livros === 1 ? "livro" : "livros"}</p>
            </div>
            <div className="mt-2 h-3 rounded-full bg-[#e6efe9]" role="img" aria-label={`${item.categoria}: ${item.acessos} acessos`}>
              <div className="h-3 rounded-full bg-[#245947]" style={{ width: `${(item.acessos / maxCategoria) * 100}%` }} />
            </div>
          </li>)}</ul>
        </section>

        <section className={`${card} mt-8`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">Acessos por conteúdo</h2>
            <label className="text-sm text-[#68665e]">Mostrar{" "}
              <select className={select} value={limit} onChange={(event) => setLimit(Number(event.target.value))} disabled={busy}>
                {[10, 20, 50, 100].map((option) => <option key={option} value={option}>{option} livros</option>)}
              </select>
            </label>
          </div>
          {data.acessos_por_conteudo.length === 0 && <p className="mt-5 text-[#68665e]">Nenhum livro cadastrado.</p>}
          <ul className="mt-5 divide-y divide-[#ddd7ca]">{data.acessos_por_conteudo.map((book) => <li className="py-4" key={book.id_livro}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-semibold">{book.titulo || "Sem título"}</h3>
                <p className="text-sm text-[#68665e]">{book.categorias.join(", ")}</p>
              </div>
              <p className="text-sm text-[#68665e]">{nf.format(book.acessos)} acessos, {nf.format(book.lidos)} lidos, {nf.format(book.baixados)} baixados, {nf.format(book.favoritos)} favoritos</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#e6efe9]" role="img" aria-label={`${book.titulo || "Sem título"}: ${book.acessos} acessos`}>
              <div className="h-2 rounded-full bg-[#245947]" style={{ width: `${(book.acessos / maxConteudo) * 100}%` }} />
            </div>
          </li>)}</ul>
        </section>
      </>}
    </div>
  </main>
}
