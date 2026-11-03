import { useState, type FormEvent } from "react"
import { BookCover, Icon, books, type BookList, type IconName } from "./shared"

type Props = {
  name: string
  favorites: number[]
  onToggleFavorite: (id: number) => void
  onBack: () => void
  onLogout: () => void
  onOpenBook: (id: number) => void
  progress: Record<number, number>
  lists: BookList[]
  setLists: React.Dispatch<React.SetStateAction<BookList[]>>
  downloaded: number[]
  setDownloaded: React.Dispatch<React.SetStateAction<number[]>>
}

type Tab = "resumo" | "historico" | "favoritos" | "listas" | "estatisticas" | "avaliacoes" | "assinatura"

const tabs: { id: Tab; label: string; icon: IconName; public?: boolean }[] = [
  { id: "resumo", label: "Resumo", icon: "home" },
  { id: "historico", label: "Histórico", icon: "clock" },
  { id: "favoritos", label: "Favoritos", icon: "heart", public: true },
  { id: "listas", label: "Listas", icon: "list", public: true },
  { id: "estatisticas", label: "Estatísticas", icon: "library" },
  { id: "avaliacoes", label: "Avaliações", icon: "star", public: true },
  { id: "assinatura", label: "Assinatura", icon: "users" },
]

const byId = (id: number) => books.find((b) => b.id === id)!

const recent = [
  { id: 3, when: "Hoje, 09:14" },
  { id: 1, when: "Ontem" },
  { id: 4, when: "Há 3 dias" },
  { id: 2, when: "Há 5 dias" },
  { id: 5, when: "Há 1 semana" },
]

const reading = [
  { id: 1, page: 126, total: 284, saved: "Ontem, 21:40" },
  { id: 2, page: 78, total: 310, saved: "Há 4 dias" },
]

const reviews = [
  { id: 3, stars: 5, date: "12 out 2026", text: "Uma prosa delicada que cresce a cada capítulo. O final me fez reler o primeiro parágrafo." },
  { id: 4, stars: 4, date: "28 set 2026", text: "Denso em alguns trechos, mas explica ideias enormes com clareza rara." },
  { id: 5, stars: 3, date: "03 set 2026", text: "Alguns contos são ótimos, outros ficam pela metade. Vale pelo conto que dá nome ao livro." },
]

const periods = {
  "2026": { label: "2026", books: 11, pages: 3240, avgBooks: 8, avgPages: 2460, note: "Jan – out" },
  "2025": { label: "2025", books: 15, pages: 4380, avgBooks: 9, avgPages: 2810, note: "Ano completo" },
  "2024": { label: "2024", books: 7, pages: 1950, avgBooks: 8, avgPages: 2300, note: "Ano completo" },
  all: { label: "Desde sempre", books: 33, pages: 9570, avgBooks: 21, avgPages: 7200, note: "Desde jan/2024" },
} as const

const fmt = (n: number) => n.toLocaleString("pt-BR")

function ageBand(age: number) {
  if (age < 10) return "Infantil"
  if (age < 14) return "Infantojuvenil"
  if (age < 18) return "Juvenil"
  return "Catálogo completo"
}

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} de 5 estrelas`} className="flex gap-0.5 text-[#b55f40]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon className="h-4 w-4" filled={n <= value} key={n} name="star" />
      ))}
    </span>
  )
}

function SectionTitle({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#a35d3e]">{eyebrow}</p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {aside}
    </div>
  )
}

function Empty({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9c1b2] py-14 text-center">
      <Icon className="mx-auto h-7 w-7 text-[#8c877d]" name={icon} />
      <h3 className="mt-3 font-serif text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#77736a]">{text}</p>
    </div>
  )
}

const inputClass =
  "h-11 rounded-xl border border-[#ddd7ca] bg-white px-4 text-sm outline-none transition placeholder:text-[#9a968c] focus:border-[#245947] focus:ring-2 focus:ring-[#245947]/15"

export default function ProfilePage({ name, favorites, onToggleFavorite, onBack, onLogout, onOpenBook, progress, lists, setLists, downloaded, setDownloaded }: Props) {
  const [tab, setTab] = useState<Tab>("resumo")
  const [visitor, setVisitor] = useState(false)
  const [readIds, setReadIds] = useState<number[]>([3, 4])
  const [period, setPeriod] = useState<keyof typeof periods>("2026")
  const [newList, setNewList] = useState("")
  const [plan, setPlan] = useState<"individual" | "familiar">("familiar")
  const [members, setMembers] = useState([
    { id: 1, name, age: 36, owner: true },
    { id: 2, name: "Marina", age: 34, owner: false },
    { id: 3, name: "Davi", age: 12, owner: false },
    { id: 4, name: "Alice", age: 8, owner: false },
  ])
  const [newMember, setNewMember] = useState({ name: "", age: "" })
  const [planError, setPlanError] = useState("")

  const visibleTabs = visitor ? tabs.filter((t) => t.public) : tabs
  const current = visibleTabs.some((t) => t.id === tab) ? tab : visibleTabs[0].id
  const initials = name.trim().slice(0, 2).toUpperCase()
  const p = periods[period]

  const toggleVisitor = () => {
    const next = !visitor
    setVisitor(next)
    if (next && !tabs.find((t) => t.id === tab)?.public) setTab("favoritos")
  }

  const createList = (event: FormEvent) => {
    event.preventDefault()
    const value = newList.trim()
    if (!value) return
    setLists((l) => [...l, { id: Date.now(), name: value, ids: [] }])
    setNewList("")
  }

  const addToList = (listId: number, bookId: number) => {
    if (!bookId) return
    setLists((l) => l.map((x) => (x.id === listId && !x.ids.includes(bookId) ? { ...x, ids: [...x.ids, bookId] } : x)))
  }

  const addMember = (event: FormEvent) => {
    event.preventDefault()
    const age = Number(newMember.age)
    if (!newMember.name.trim() || !Number.isInteger(age) || age < 0 || age > 110) {
      setPlanError("Informe um nome e uma idade válida.")
      return
    }
    if (members.length >= 4) {
      setPlanError("O plano familiar permite até 4 acessos.")
      return
    }
    setPlanError("")
    setMembers((m) => [...m, { id: Date.now(), name: newMember.name.trim(), age, owner: false }])
    setNewMember({ name: "", age: "" })
  }

  const changePlan = (next: "individual" | "familiar") => {
    if (next === "individual" && members.length > 1) {
      setPlanError("Remova os outros perfis antes de mudar para o plano individual.")
      return
    }
    setPlanError("")
    setPlan(next)
  }

  const downloadBadge = (id: number) =>
    downloaded.includes(id) ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#245947]">
        <Icon className="h-3.5 w-3.5" name="check" /> Baixado
      </span>
    ) : (
      <button
        className="inline-flex items-center gap-1 rounded-full border border-[#245947] px-3 py-1 text-xs font-bold text-[#245947] transition hover:bg-[#245947] hover:text-white"
        onClick={() => setDownloaded((d) => [...d, id])}
        type="button"
      >
        <Icon className="h-3.5 w-3.5" name="download" /> Baixar
      </button>
    )

  return (
    <main>
      <section className="mx-auto max-w-[1400px] px-5 pt-7 sm:px-8 lg:px-12 lg:pt-10">
        <button
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#245947]"
          onClick={onBack}
          type="button"
        >
          <Icon className="h-4 w-4 rotate-180" name="chevron" /> Voltar ao início
        </button>

        <div className="relative overflow-hidden rounded-[28px] bg-[#1d493b] text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative grid gap-8 px-6 py-9 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-14 lg:py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[#e7c98c] font-serif text-3xl font-semibold text-[#243329] ring-4 ring-white/15 sm:h-28 sm:w-28 sm:text-4xl">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    Leitor
                  </span>
                  {!visitor && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      Plano {plan}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 truncate font-serif text-4xl leading-tight tracking-tight sm:text-5xl">{name}</h1>
                <p className="mt-2 text-sm text-[#e6eee9]/80">
                  {!visitor && "leitor@polivraria.com · "}Leitor desde janeiro de 2024
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-3 divide-x divide-white/20 rounded-2xl border border-white/15 bg-white/5">
                {[
                  [fmt(periods.all.books), "livros lidos"],
                  [String(favorites.length), "favoritos"],
                  [String(lists.length), "listas"],
                ].map(([v, l]) => (
                  <div className="px-5 py-3 text-center" key={l}>
                    <strong className="block font-serif text-2xl">{v}</strong>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/70">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative flex flex-wrap items-center gap-2 border-t border-white/15 px-6 py-3 sm:px-10 lg:px-14">
            <button
              aria-pressed={visitor}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold transition ${
                visitor ? "bg-[#e7c98c] text-[#243329]" : "border border-white/25 hover:bg-white/10"
              }`}
              onClick={toggleVisitor}
              type="button"
            >
              <Icon className="h-4 w-4" name="eye" /> {visitor ? "Sair da visão de visitante" : "Ver como outro usuário"}
            </button>
            <button
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold text-white/85 transition hover:bg-white/10"
              onClick={onLogout}
              type="button"
            >
              <Icon className="h-4 w-4" name="logout" /> Sair da conta
            </button>
          </div>
        </div>

        {visitor && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#efeae0] px-4 py-3 text-sm text-[#5a574f]" role="status">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#a35d3e]" name="eye" />
            Esta é a visão de outros usuários que clicam no seu perfil: apenas favoritos, listas e avaliações públicas.
          </p>
        )}

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#ded8cb]" role="tablist">
          {visibleTabs.map((t) => (
            <button
              aria-selected={current === t.id}
              className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                current === t.id ? "border-[#245947] text-[#245947]" : "border-transparent text-[#77736a] hover:text-[#245947]"
              }`}
              key={t.id}
              onClick={() => setTab(t.id)}
              role="tab"
              type="button"
            >
              <Icon className="h-4 w-4" name={t.icon} /> {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {current === "resumo" && (
          <div className="space-y-14">
            <div>
              <SectionTitle eyebrow="Sempre salvo" title="Continue de onde parou" />
              <div className="grid gap-4 lg:grid-cols-2">
                {reading.map((r) => {
                  const b = byId(r.id)
                  const page = progress[r.id] ?? r.page
                  const pct = Math.round((page / r.total) * 100)
                  return (
                    <article className="flex gap-5 rounded-2xl border border-[#ded8cb] bg-white/60 p-4 sm:items-center sm:p-5" key={r.id}>
                      <div className="w-[92px] shrink-0 sm:w-[112px]">
                        <BookCover book={b} compact />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-serif text-xl font-semibold">{b.title}</h3>
                        <p className="mt-1 text-sm text-[#77736a]">{b.author}</p>
                        <div className="mt-4 flex justify-between text-xs text-[#77736a]">
                          <span>Parou na página {progress[r.id] ?? r.page} de {r.total}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dfdcd4]">
                          <div className="h-full rounded-full bg-[#b55f40]" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-[#98735b]">Posição salva · {r.saved}</p>
                        <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#245947]" onClick={() => onOpenBook(r.id)} type="button">
                          <Icon className="h-4 w-4" name="book" /> Abrir na página {page}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <div>
              <SectionTitle eyebrow="Do mais novo ao mais antigo" title="Visualizados recentemente" />
              <div className="-mx-5 flex gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
                {recent.map((r) => {
                  const b = byId(r.id)
                  return (
                    <article className="w-[140px] shrink-0 cursor-pointer sm:w-[168px]" key={r.id} onClick={() => onOpenBook(r.id)}>
                      <BookCover book={b} compact />
                      <h3 className="mt-3 truncate font-serif text-base font-semibold">{b.title}</h3>
                      <p className="text-xs text-[#77736a]">{r.when}</p>
                    </article>
                  )
                })}
              </div>
            </div>

            <div className="grid overflow-hidden rounded-[24px] bg-[#c76745] text-white lg:grid-cols-[1.2fr_0.8fr]">
              <div className="px-7 py-9 sm:px-12">
                <Icon className="h-7 w-7 text-[#f5d79c]" name="clock" />
                <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight">Você está lendo acima da média.</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                  Em 2026 são {periods["2026"].books} livros, contra {periods["2026"].avgBooks} da média dos leitores.
                </p>
                <button className="mt-5 text-sm font-bold underline underline-offset-4" onClick={() => setTab("estatisticas")} type="button">
                  Ver estatísticas completas
                </button>
              </div>
              <div className="grid grid-cols-2 border-t border-white/20 lg:border-l lg:border-t-0">
                <div className="flex flex-col justify-center border-r border-white/20 p-7 text-center">
                  <strong className="font-serif text-4xl">{periods["2026"].books}</strong>
                  <span className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">Livros em 2026</span>
                </div>
                <div className="flex flex-col justify-center p-7 text-center">
                  <strong className="font-serif text-4xl">{fmt(periods["2026"].pages)}</strong>
                  <span className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">Páginas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {current === "historico" && (
          <div>
            <SectionTitle eyebrow="Leituras e downloads" title="Seu histórico" />
            <p className="mb-5 text-sm text-[#77736a]">
              {readIds.length} de {books.length} livros marcados como lidos · {downloaded.length} baixados para leitura offline.
            </p>
            <ul className="divide-y divide-[#ded8cb] overflow-hidden rounded-2xl border border-[#ded8cb] bg-white/60">
              {books.map((b) => {
                const isRead = readIds.includes(b.id)
                return (
                  <li className="grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[56px_1fr_auto_auto] sm:gap-x-6 sm:p-5" key={b.id}>
                    <div className="w-14">
                      <BookCover book={b} compact />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-lg font-semibold">
                        <button className="hover:underline" onClick={() => onOpenBook(b.id)} type="button">{b.title}</button>
                      </h3>
                      <p className="truncate text-sm text-[#77736a]">{b.author} · {b.genre}</p>
                    </div>
                    <div className="col-start-2 sm:col-start-auto">{downloadBadge(b.id)}</div>
                    <label className="col-start-2 inline-flex cursor-pointer items-center gap-2 text-sm font-medium sm:col-start-auto">
                      <input
                        checked={isRead}
                        className="peer sr-only"
                        onChange={() => setReadIds((r) => (isRead ? r.filter((x) => x !== b.id) : [...r, b.id]))}
                        type="checkbox"
                      />
                      <span className="grid h-6 w-6 place-items-center rounded-md border border-[#bfb7a7] bg-white text-white transition peer-checked:border-[#245947] peer-checked:bg-[#245947] peer-focus-visible:ring-2 peer-focus-visible:ring-[#245947]/30">
                        <Icon className="h-4 w-4" name="check" />
                      </span>
                      {isRead ? "Já li" : "Marcar como lido"}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {current === "favoritos" && (
          <div>
            <SectionTitle eyebrow={visitor ? "Indicações públicas" : "Livros que você indica"} title="Favoritos" />
            {favorites.length === 0 ? (
              <Empty icon="heart" text="Favorite livros no catálogo e eles aparecem aqui, visíveis para quem abrir seu perfil." title="Nenhum favorito ainda" />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
                {favorites.map((id) => {
                  const b = byId(id)
                  return (
                    <article key={id}>
                      <div className="relative">
                        <BookCover book={b} />
                        {!visitor && (
                          <button
                            aria-label={`Remover ${b.title} dos favoritos`}
                            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#b65c40] text-white shadow-sm transition hover:bg-[#8e3f31]"
                            onClick={() => onToggleFavorite(id)}
                            type="button"
                          >
                            <Icon className="h-4 w-4" filled name="heart" />
                          </button>
                        )}
                      </div>
                      <h3 className="mt-4 truncate font-serif text-lg font-semibold">
                        <button className="hover:underline" onClick={() => onOpenBook(id)} type="button">{b.title}</button>
                      </h3>
                      <p className="truncate text-xs text-[#77736a]">{b.author}</p>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {current === "listas" && (
          <div>
            <SectionTitle eyebrow="Coleções suas" title="Minhas listas" />
            {!visitor && (
              <form className="mb-8 flex flex-col gap-3 sm:flex-row" onSubmit={createList}>
                <input
                  aria-label="Nome da nova lista"
                  className={`${inputClass} flex-1 sm:max-w-sm`}
                  onChange={(e) => setNewList(e.target.value)}
                  placeholder="Nome da nova lista"
                  value={newList}
                />
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#245947] px-5 text-sm font-bold text-white transition hover:bg-[#1b4637]" type="submit">
                  <Icon className="h-4 w-4" name="plus" /> Criar lista
                </button>
              </form>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              {lists.map((l) => (
                <article className="rounded-2xl border border-[#ded8cb] bg-white/60 p-5" key={l.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl font-semibold">{l.name}</h3>
                      <p className="text-sm text-[#77736a]">{l.ids.length} {l.ids.length === 1 ? "livro" : "livros"}</p>
                    </div>
                    {!visitor && (
                      <button
                        aria-label={`Excluir lista ${l.name}`}
                        className="text-xs font-semibold text-[#a8402b] hover:underline"
                        onClick={() => setLists((x) => x.filter((i) => i.id !== l.id))}
                        type="button"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex min-h-[96px] gap-3 overflow-x-auto">
                    {l.ids.length === 0 && <p className="self-center text-sm text-[#98735b]">Lista vazia. Adicione o primeiro livro.</p>}
                    {l.ids.map((id) => (
                      <div className="w-[68px] shrink-0" key={id} title={byId(id).title}>
                        <BookCover book={byId(id)} compact />
                      </div>
                    ))}
                  </div>
                  {!visitor && (
                    <select
                      aria-label={`Adicionar livro à lista ${l.name}`}
                      className={`${inputClass} mt-4 w-full`}
                      onChange={(e) => {
                        addToList(l.id, Number(e.target.value))
                        e.target.value = ""
                      }}
                      defaultValue=""
                    >
                      <option value="">Adicionar livro à lista…</option>
                      {books.filter((b) => !l.ids.includes(b.id)).map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  )}
                </article>
              ))}
            </div>
            {lists.length === 0 && <Empty icon="list" text="Crie listas para reunir livros relacionados." title="Nenhuma lista criada" />}
          </div>
        )}

        {current === "estatisticas" && (
          <div>
            <SectionTitle
              aside={
                <div className="flex gap-2 overflow-x-auto">
                  {(Object.keys(periods) as (keyof typeof periods)[]).map((k) => (
                    <button
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        period === k ? "bg-[#245947] text-white" : "border border-[#d4cdbf] bg-[#f8f5ef] text-[#656159]"
                      }`}
                      key={k}
                      onClick={() => setPeriod(k)}
                      type="button"
                    >
                      {periods[k].label}
                    </button>
                  ))}
                </div>
              }
              eyebrow={p.note}
              title="Suas estatísticas de leitura"
            />
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { label: "Livros lidos", mine: p.books, avg: p.avgBooks },
                { label: "Páginas lidas", mine: p.pages, avg: p.avgPages },
              ].map((s) => {
                const max = Math.max(s.mine, s.avg)
                const diff = Math.round(((s.mine - s.avg) / s.avg) * 100)
                return (
                  <article className="rounded-2xl border border-[#ded8cb] bg-white/60 p-6" key={s.label}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8d6e57]">{s.label}</p>
                    <p className="mt-2 font-serif text-5xl font-semibold">{fmt(s.mine)}</p>
                    <p className={`mt-1 text-sm font-semibold ${diff >= 0 ? "text-[#245947]" : "text-[#a8402b]"}`}>
                      {diff >= 0 ? "+" : ""}{diff}% em relação à média global
                    </p>
                    <div className="mt-6 space-y-3">
                      {[
                        ["Você", s.mine, "bg-[#b55f40]"],
                        ["Média global", s.avg, "bg-[#245947]/50"],
                      ].map(([l, v, c]) => (
                        <div key={l as string}>
                          <div className="mb-1 flex justify-between text-xs text-[#77736a]">
                            <span>{l}</span>
                            <span className="font-semibold text-[#25251f]">{fmt(v as number)}</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-[#dfdcd4]">
                            <div className={`h-full rounded-full ${c}`} style={{ width: `${((v as number) / max) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-[#77736a]">A média global considera todos os outros usuários da plataforma no mesmo período.</p>
          </div>
        )}

        {current === "avaliacoes" && (
          <div>
            <SectionTitle eyebrow="Sua opinião na página do livro" title="Avaliações e comentários" />
            <div className="grid gap-4 lg:grid-cols-2">
              {reviews.map((r) => {
                const b = byId(r.id)
                return (
                  <article className="flex gap-4 rounded-2xl border border-[#ded8cb] bg-white/60 p-5" key={r.id}>
                    <div className="w-[72px] shrink-0">
                      <BookCover book={b} compact />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-lg font-semibold">{b.title}</h3>
                      <div className="mt-1 flex items-center gap-3">
                        <Stars value={r.stars} />
                        <span className="text-xs text-[#77736a]">{r.date}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#4a483f]">“{r.text}”</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {current === "assinatura" && (
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionTitle eyebrow="Titular da conta" title="Seu plano" />
              <div className="space-y-3" role="radiogroup" aria-label="Plano de assinatura">
                {([
                  ["individual", "Individual", "1 acesso. Exclusivo para maiores de 18 anos.", "R$ 19,90/mês"],
                  ["familiar", "Familiar", "Até 4 acessos com uma única assinatura.", "R$ 34,90/mês"],
                ] as const).map(([id, title, text, price]) => (
                  <button
                    aria-checked={plan === id}
                    className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                      plan === id ? "border-[#245947] bg-[#245947]/5 ring-1 ring-[#245947]" : "border-[#ded8cb] bg-white/60 hover:border-[#245947]/50"
                    }`}
                    key={id}
                    onClick={() => changePlan(id)}
                    role="radio"
                    type="button"
                  >
                    <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${plan === id ? "border-[#245947] bg-[#245947] text-white" : "border-[#bfb7a7]"}`}>
                      {plan === id && <Icon className="h-3 w-3" name="check" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <strong className="font-serif text-xl">{title}</strong>
                        <span className="text-sm font-semibold text-[#a35d3e]">{price}</span>
                      </span>
                      <span className="mt-1 block text-sm text-[#77736a]">{text}</span>
                    </span>
                  </button>
                ))}
              </div>
              {planError && <p className="mt-3 text-sm text-[#a8402b]" role="alert">{planError}</p>}
            </div>

            <div>
              <SectionTitle
                aside={<span className="text-sm font-semibold text-[#77736a]">{members.length} de {plan === "familiar" ? 4 : 1} acessos</span>}
                eyebrow="Perfis da assinatura"
                title="Quem lê com você"
              />
              <ul className="divide-y divide-[#ded8cb] overflow-hidden rounded-2xl border border-[#ded8cb] bg-white/60">
                {members.map((m) => (
                  <li className="flex flex-wrap items-center gap-4 p-4 sm:px-5" key={m.id}>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e7ded0] font-serif font-semibold text-[#6c503d]">
                      {m.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{m.name}{m.owner && <span className="ml-2 text-xs font-bold uppercase tracking-[0.12em] text-[#245947]">Titular</span>}</p>
                      <p className="text-xs text-[#77736a]">{ageBand(m.age)}{m.age < 18 && " · conteúdo limitado pela idade"}</p>
                    </div>
                    {m.owner ? (
                      <span className="inline-flex items-center gap-1 text-sm text-[#77736a]"><Icon className="h-4 w-4" name="lock" /> {m.age} anos</span>
                    ) : (
                      <>
                        <label className="flex items-center gap-2 text-sm text-[#77736a]">
                          Idade
                          <input
                            aria-label={`Idade de ${m.name}`}
                            className={`${inputClass} h-10 w-20 px-3`}
                            max={110}
                            min={0}
                            onChange={(e) => setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, age: Math.max(0, Number(e.target.value)) } : x)))}
                            type="number"
                            value={m.age}
                          />
                        </label>
                        <button
                          className="text-xs font-semibold text-[#a8402b] hover:underline"
                          onClick={() => setMembers((list) => list.filter((x) => x.id !== m.id))}
                          type="button"
                        >
                          Remover
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {plan === "familiar" && members.length < 4 && (
                <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={addMember}>
                  <input aria-label="Nome do perfil" className={`${inputClass} flex-1`} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="Nome do perfil" value={newMember.name} />
                  <input aria-label="Idade do perfil" className={`${inputClass} sm:w-28`} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} placeholder="Idade" type="number" value={newMember.age} />
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#245947] px-5 text-sm font-bold text-white transition hover:bg-[#1b4637]" type="submit">
                    <Icon className="h-4 w-4" name="plus" /> Adicionar
                  </button>
                </form>
              )}
              <p className="mt-4 text-xs leading-5 text-[#77736a]">
                Só o titular configura a idade dos perfis menores de idade, e o catálogo exibido a cada perfil respeita essa faixa etária.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
