import { useMemo, useState } from "react"
import AuthPage, { type AuthMode } from "./AuthPage"

type IconName =
  | "book"
  | "bookmark"
  | "chevron"
  | "clock"
  | "heart"
  | "home"
  | "library"
  | "menu"
  | "search"
  | "user"

const iconPaths: Record<IconName, React.ReactNode> = {
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  library: (
    <>
      <path d="M4 19.5V4.8a1.8 1.8 0 0 1 1.8-1.8H9v16.5" />
      <path d="M9 5h5v14.5M14 7l4-1 3 12.5-4 .9L14 7Z" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
}

function Icon({ name, className = "h-5 w-5", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {iconPaths[name]}
    </svg>
  )
}

const books = [
  {
    id: 1,
    title: "A Vida Invisível",
    author: "Marta Reis",
    genre: "Romance",
    rating: "4,8",
    color: "from-[#2f604d] to-[#183b2e]",
    accent: "#e9d5a5",
    mark: "um romance",
  },
  {
    id: 2,
    title: "Além das Montanhas",
    author: "Caio Tavares",
    genre: "Aventura",
    rating: "4,7",
    color: "from-[#cb754a] to-[#8e3f31]",
    accent: "#f9e1b8",
    mark: "uma jornada",
  },
  {
    id: 3,
    title: "O Jardim de Inverno",
    author: "Helena Duarte",
    genre: "Romance",
    rating: "4,9",
    color: "from-[#768d84] to-[#344d46]",
    accent: "#eff1df",
    mark: "memórias",
  },
  {
    id: 4,
    title: "Breve História do Tempo",
    author: "André Lins",
    genre: "Ciência",
    rating: "4,6",
    color: "from-[#293a60] to-[#161d35]",
    accent: "#dbd5be",
    mark: "ideias",
  },
  {
    id: 5,
    title: "O Último Café",
    author: "Luiza Mota",
    genre: "Contos",
    rating: "4,5",
    color: "from-[#a45437] to-[#5b2d24]",
    accent: "#f5dfbe",
    mark: "encontros",
  },
]

const genres = ["Todos", "Romance", "Aventura", "Ciência", "Contos"]

function BookCover({ book, compact = false }: { book: (typeof books)[number]; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gradient-to-br ${book.color} ${compact ? "aspect-[3/4.15]" : "aspect-[3/4.35]"} shadow-[0_14px_30px_rgba(41,30,22,0.16)]`}
    >
      <div className="absolute inset-y-0 left-0 w-[7%] bg-black/15" />
      <div className="absolute left-[17%] right-[10%] top-[14%] h-px bg-white/35" />
      <div className="absolute inset-x-[12%] top-[23%] text-center">
        <p className="font-serif text-[9px] uppercase tracking-[0.25em] text-white/65 sm:text-[10px]">{book.mark}</p>
        <h3 className={`${compact ? "mt-2 text-lg" : "mt-3 text-xl sm:text-2xl"} font-serif leading-[1.05] text-white`}>
          {book.title}
        </h3>
      </div>
      <div
        className="absolute bottom-[18%] left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border border-white/40 opacity-70"
        style={{ boxShadow: `inset 0 0 0 8px ${book.accent}22` }}
      />
      <p className="absolute inset-x-0 bottom-[8%] text-center text-[8px] uppercase tracking-[0.22em] text-white/70">
        {book.author}
      </p>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState("")
  const [genre, setGenre] = useState("Todos")
  const [favorites, setFavorites] = useState<number[]>([3])
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [user, setUser] = useState<string | null>(null)

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR")
    return books.filter((book) => {
      const matchesGenre = genre === "Todos" || book.genre === genre
      const matchesQuery =
        !normalizedQuery ||
        `${book.title} ${book.author} ${book.genre}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
      return matchesGenre && matchesQuery
    })
  }, [genre, query])

  const toggleFavorite = (id: number) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#25251f]">
      <header className="sticky top-0 z-40 border-b border-[#ded8cb]/80 bg-[#f8f5ef]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-5 sm:px-8 lg:px-12">
          <a className="flex shrink-0 items-center gap-2.5" href="#" aria-label="POLIvraria, início">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#245947] text-white">
              <Icon name="book" className="h-[18px] w-[18px]" />
            </span>
            <span className="font-serif text-2xl font-semibold tracking-tight">POLIvraria</span>
          </a>

          <nav className="ml-8 hidden items-center gap-8 text-sm text-[#68665e] md:flex">
            <a className="font-semibold text-[#245947]" href="#inicio">
              Início
            </a>
            <a className="transition hover:text-[#245947]" href="#explorar">
              Explorar
            </a>
            {user && (
              <a className="transition hover:text-[#245947]" href="#biblioteca">
                Minha biblioteca
              </a>
            )}
          </nav>

          <label className="relative ml-auto hidden w-full max-w-[320px] lg:block">
            <span className="sr-only">Buscar livros</span>
            <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858178]" />
            <input
              className="h-11 w-full rounded-full border border-[#ddd7ca] bg-white/70 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#97938a] focus:border-[#648b7d] focus:ring-2 focus:ring-[#648b7d]/15"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, autor ou gênero"
              value={query}
            />
          </label>

          {user ? (
            <button
              className="hidden h-10 items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/70 px-3 text-sm font-medium sm:flex"
              onClick={() => setUser(null)}
              title="Sair"
              type="button"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7ded0] text-[#6c503d]">
                <Icon name="user" className="h-4 w-4" />
              </span>
              {user} · Sair
            </button>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                className="h-10 rounded-full px-4 text-sm font-semibold text-[#245947] transition hover:bg-[#245947]/10"
                onClick={() => setAuthMode("login")}
                type="button"
              >
                Entrar
              </button>
              <button
                className="h-10 rounded-full bg-[#245947] px-5 text-sm font-bold text-white transition hover:bg-[#1b4637]"
                onClick={() => setAuthMode("signup")}
                type="button"
              >
                Criar conta
              </button>
            </div>
          )}
          <button
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-[#ddd7ca] md:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <Icon name="menu" />
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-[#ded8cb] bg-[#f8f5ef] px-5 py-4 text-sm md:hidden">
            <div className="flex flex-col gap-1">
              {(user ? ["Início", "Explorar", "Minha biblioteca"] : ["Início", "Explorar"]).map((item) => (
                <a className="rounded-lg px-3 py-2.5 font-medium hover:bg-[#eee9df]" href="#inicio" key={item}>
                  {item}
                </a>
              ))}
              {!user && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#ded8cb] pt-4">
                  <button className="h-11 rounded-full border border-[#245947] font-semibold text-[#245947]" onClick={() => { setMenuOpen(false); setAuthMode("login") }} type="button">Entrar</button>
                  <button className="h-11 rounded-full bg-[#245947] font-bold text-white" onClick={() => { setMenuOpen(false); setAuthMode("signup") }} type="button">Criar conta</button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>
      {authMode && (
        <AuthPage
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
          onSuccess={(name) => { setUser(name); setAuthMode(null) }}
        />
      )}

      <main id="inicio">
        <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-7 sm:px-8 lg:px-12 lg:pb-16 lg:pt-10">
          <div className="relative min-h-[410px] overflow-hidden rounded-[28px] bg-[#1d493b]">
            <img
              alt="Espaço acolhedor de leitura com livros e uma poltrona"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-45 mix-blend-luminosity md:left-[42%] md:w-[58%] md:opacity-70"
              src="https://images.unsplash.com/photo-1708481480602-85fc2af8515d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1400"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#173e32] via-[#173e32]/95 to-[#173e32]/20" />
            <div className="relative z-10 flex min-h-[410px] max-w-[650px] flex-col justify-center px-7 py-12 text-white sm:px-12 lg:px-16">
              <span className="mb-5 w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                Sua próxima história
              </span>
              <h1 className="max-w-[570px] font-serif text-4xl leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-[58px]">
                Livros que acendem novas ideias.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-[#e6eee9]/85 sm:text-base">
                Explore histórias para todos os momentos, leia onde estiver e guarde cada descoberta na sua biblioteca.
              </p>
              <a
                className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#e7c98c] px-6 text-sm font-bold text-[#243329] transition hover:bg-[#efd8a7]"
                href="#explorar"
              >
                Explorar catálogo
                <Icon name="chevron" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <label className="relative mt-5 block lg:hidden">
            <span className="sr-only">Buscar livros</span>
            <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#858178]" />
            <input
              className="h-12 w-full rounded-full border border-[#ddd7ca] bg-white pl-12 pr-4 text-sm outline-none focus:border-[#648b7d]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar título, autor ou gênero"
              value={query}
            />
          </label>
        </section>

        {user && (
        <section className="mx-auto max-w-[1400px] px-5 pb-14 sm:px-8 lg:px-12" id="biblioteca">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#a35d3e]">Sua leitura</p>
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Continue de onde parou</h2>
            </div>
            <a className="hidden items-center gap-1 text-sm font-semibold text-[#245947] sm:flex" href="#explorar">
              Ver biblioteca <Icon name="chevron" className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {books.slice(0, 2).map((book, index) => (
              <article
                className="flex min-w-0 gap-5 rounded-2xl border border-[#ded8cb] bg-white/60 p-4 sm:items-center sm:gap-6 sm:p-5"
                key={book.id}
              >
                <div className="w-[92px] shrink-0 sm:w-[112px]">
                  <BookCover book={book} compact />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d6e57]">{book.genre}</span>
                  <h3 className="mt-1 truncate font-serif text-xl font-semibold">{book.title}</h3>
                  <p className="mt-1 text-sm text-[#77736a]">{book.author}</p>
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs text-[#77736a]">
                      <span>Página {index === 0 ? "126 de 284" : "78 de 310"}</span>
                      <span>{index === 0 ? "44%" : "25%"}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#dfdcd4]">
                      <div className="h-full rounded-full bg-[#b55f40]" style={{ width: index === 0 ? "44%" : "25%" }} />
                    </div>
                  </div>
                  <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#245947]" type="button">
                    <Icon name="book" className="h-4 w-4" />
                    Continuar lendo
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        <section className="border-y border-[#ddd7ca] bg-[#efeae0]/70 py-14 lg:py-16" id="explorar">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#a35d3e]">Escolhidos para você</p>
                <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Recomendados</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {genres.map((item) => (
                  <button
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      genre === item ? "bg-[#245947] text-white" : "border border-[#d4cdbf] bg-[#f8f5ef] text-[#656159]"
                    }`}
                    key={item}
                    onClick={() => setGenre(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {visibleBooks.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5">
                {visibleBooks.map((book) => {
                  const isFavorite = favorites.includes(book.id)
                  return (
                    <article className="group min-w-0" key={book.id}>
                      <div className="relative">
                        <BookCover book={book} />
                        <button
                          aria-label={isFavorite ? `Remover ${book.title} dos favoritos` : `Favoritar ${book.title}`}
                          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full shadow-sm transition ${
                            isFavorite ? "bg-[#b65c40] text-white" : "bg-[#fffdf8]/90 text-[#4f4c46] hover:text-[#b65c40]"
                          }`}
                          onClick={() => toggleFavorite(book.id)}
                          type="button"
                        >
                          <Icon name="heart" className="h-4 w-4" filled={isFavorite} />
                        </button>
                      </div>
                      <div className="pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#98735b]">{book.genre}</span>
                          <span className="text-xs font-semibold text-[#77736a]">★ {book.rating}</span>
                        </div>
                        <h3 className="mt-1 truncate font-serif text-lg font-semibold">{book.title}</h3>
                        <p className="mt-1 truncate text-xs text-[#77736a]">{book.author}</p>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-[#c9c1b2] py-16 text-center">
                <Icon name="search" className="mx-auto h-7 w-7 text-[#8c877d]" />
                <h3 className="mt-3 font-serif text-xl font-semibold">Nenhum livro encontrado</h3>
                <p className="mt-1 text-sm text-[#77736a]">Tente outro título, autor ou gênero.</p>
                <button
                  className="mt-5 text-sm font-bold text-[#245947]"
                  onClick={() => {
                    setQuery("")
                    setGenre("Todos")
                  }}
                  type="button"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </div>
        </section>

        {user && (
        <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="grid overflow-hidden rounded-[24px] bg-[#c76745] text-white lg:grid-cols-[1.15fr_0.85fr]">
            <div className="px-7 py-10 sm:px-12 lg:px-14 lg:py-14">
              <Icon name="clock" className="h-7 w-7 text-[#f5d79c]" />
              <h2 className="mt-5 max-w-md font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                Todo leitor tem seu próprio ritmo.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                Em março, você leu 428 páginas. São 18% a mais que no mês passado.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-white/20 lg:border-l lg:border-t-0">
              <div className="flex flex-col justify-center border-r border-white/20 p-7 text-center">
                <strong className="font-serif text-4xl sm:text-5xl">3</strong>
                <span className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">Livros lidos</span>
              </div>
              <div className="flex flex-col justify-center p-7 text-center">
                <strong className="font-serif text-4xl sm:text-5xl">12h</strong>
                <span className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">Tempo de leitura</span>
              </div>
            </div>
          </div>
        </section>
        )}
      </main>

      <footer className="border-t border-[#ddd7ca] py-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 text-xs text-[#77736a] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 font-serif text-base font-semibold text-[#34342e]">
            <Icon name="book" className="h-4 w-4 text-[#245947]" />
            POLIvraria
          </div>
          <p>Histórias para levar com você, onde estiver.</p>
          <div className="flex gap-5">
            <a href="#inicio">Ajuda</a>
            <a href="#inicio">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
