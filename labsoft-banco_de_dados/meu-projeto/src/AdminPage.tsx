import { useState, type FormEvent } from "react"

const api = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")
type Admin = { id: number; email: string; password: string }
type Book = { id: number; titulo: string | null; autor: string; genero: string | null; deletado: boolean }
const input = "mt-1 w-full rounded-xl border border-[#ddd7ca] bg-white px-4 py-3 outline-none focus:border-[#245947]"

export default function AdminPage({ user, onBack }: { user: Admin; onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [searched, setSearched] = useState(false)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function request(path: string, init: RequestInit = {}) {
    const separator = path.includes("?") ? "&" : "?"
    const response = await fetch(`${api}${path}${separator}id_usuario=${user.id}`, {
      ...init,
      headers: { Authorization: `Basic ${btoa(`${user.email}:${user.password}`)}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Não foi possível concluir a operação.")
    return data
  }

  async function search(event?: FormEvent) {
    event?.preventDefault()
    if (!query.trim()) return
    setBusy(true)
    setMessage("")
    try {
      setBooks(await request(`/admin/livros?query=${encodeURIComponent(query.trim())}`))
      setSearched(true)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro na pesquisa.") }
    finally { setBusy(false) }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setBusy(true)
    setMessage("")
    try {
      await request("/admin/livros", { method: "POST", body: new FormData(form) })
      form.reset()
      setMessage("Livro cadastrado com sucesso.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao cadastrar livro.") }
    finally { setBusy(false) }
  }

  async function changeStatus(book: Book) {
    setBusy(true)
    setMessage("")
    try {
      await request(`/admin/livros/${book.id}?deletado=${!book.deletado}`, { method: "PATCH" })
      setBooks((current) => current.map((item) => item.id === book.id ? { ...item, deletado: !item.deletado } : item))
      setMessage(book.deletado ? "Livro restaurado com sucesso." : "Livro removido com sucesso.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Erro ao atualizar livro.") }
    finally { setBusy(false) }
  }

  return <main className="min-h-screen bg-[#f8f5ef] px-5 py-8 text-[#25251f] sm:px-8">
    <div className="mx-auto max-w-5xl">
      <button className="font-semibold text-[#245947]" onClick={onBack} type="button">← Voltar ao início</button>
      <h1 className="mt-6 font-serif text-4xl">Administração de livros</h1>
      <p className="mt-2 text-[#68665e]">Cadastre livros e gerencie a disponibilidade no catálogo.</p>
      {message && <p role="status" className="mt-5 rounded-xl bg-[#e6efe9] p-4 text-[#245947]">{message}</p>}
      <section className="mt-8 rounded-2xl border border-[#ddd7ca] bg-white/70 p-6">
        <h2 className="font-serif text-2xl">Cadastrar livro</h2>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={create}>
          <label>Título *<input className={input} name="titulo" maxLength={255} required /></label>
          <label>Autor *<input className={input} name="autor" maxLength={150} required /></label>
          <label>Gênero *<input className={input} name="genero" maxLength={100} required /></label>
          <label>Ano de publicação *<input className={input} name="ano_de_publicacao" type="number" min="0" max="32767" required /></label>
          <label>País<input className={input} name="pais" maxLength={100} /></label>
          <label>Idioma<input className={input} name="linguagem" maxLength={100} /></label>
          <label>Restrição de idade<input className={input} name="restricao_de_idade" type="number" min="0" max="32767" defaultValue="0" /></label>
          <label>Livro em PDF *<input className={input} name="pdf" type="file" accept="application/pdf,.pdf" required /></label>
          <label>Capa em JPEG *<input className={input} name="capa" type="file" accept="image/jpeg,.jpg,.jpeg" required /></label>
          <label className="sm:col-span-2">Sinopse<textarea className={input} name="sinopse" rows={4} /></label>
          <button disabled={busy} className="w-fit rounded-full bg-[#245947] px-6 py-3 font-bold text-white disabled:opacity-50" type="submit">Cadastrar livro</button>
        </form>
      </section>
      <section className="mt-8 rounded-2xl border border-[#ddd7ca] bg-white/70 p-6">
        <h2 className="font-serif text-2xl">Buscar livros</h2>
        <p className="mt-1 text-sm text-[#68665e]">Pesquise por título, autor, gênero ou sinopse, inclusive livros removidos.</p>
        <form className="mt-4 flex gap-2" onSubmit={search}>
          <input aria-label="Pesquisar livros" className={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, autor ou gênero" required />
          <button disabled={busy} className="mt-1 rounded-full bg-[#245947] px-6 font-bold text-white disabled:opacity-50">Buscar</button>
        </form>
        {searched && books.length === 0 && <p className="mt-5 text-[#68665e]">Nenhum livro encontrado.</p>}
        <ul className="mt-5 divide-y divide-[#ddd7ca]">{books.map((book) => <li className="flex flex-wrap items-center justify-between gap-3 py-4" key={book.id}>
          <div><h3 className="font-semibold">{book.titulo || "Sem título"}</h3><p className="text-sm text-[#68665e]">{book.autor} · {book.genero || "Sem gênero"} · {book.deletado ? "Removido" : "Disponível"}</p></div>
          <button disabled={busy} className="rounded-full border border-[#245947] px-4 py-2 text-sm font-bold text-[#245947] disabled:opacity-50" onClick={() => changeStatus(book)} type="button">{book.deletado ? "Restaurar" : "Remover"}</button>
        </li>)}</ul>
      </section>
    </div>
  </main>
}
