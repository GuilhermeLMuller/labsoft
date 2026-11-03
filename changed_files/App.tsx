import { useMemo, useState } from "react"
import AuthPage, { type AuthMode } from "./AuthPage"
import { BookCover, Icon, books, genres } from "./shared"
import ProfilePage from "./ProfilePage"
import BookPage, { initialReviews, type Review } from "./BookPage"
import type { BookList } from "./shared"

export default function App() {
  const [query, setQuery] = useState("")
  const [genre, setGenre] = useState("Todos")
  const [favorites, setFavorites] = useState<number[]>([3])
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [user, setUser] = useState<string | null>(null)
  const [view, setView] = useState<"home" | "profile" | "book">("home")
  const [bookId, setBookId] = useState(1)
  const [progress, setProgressMap] = useState<Record<number, number>>({ 1: 126, 2: 78 })
  const [downloaded, setDownloaded] = useState<number[]>([3, 4, 1, 5])
  const [lists, setLists] = useState<BookList[]>([
    { id: 1, name: "Para ler nas férias", ids: [2, 1] },
    { id: 2, name: "Clássicos do afeto", ids: [3, 5] },
  ])
  const [reviewsByBook, setReviewsByBook] = useState<Record<number, Review[]>>(initialReviews)
  const openBook = (id: number) => {
    setBookId(id)
    setView("book")
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }
  const goHome = (hash = "") => {
    setView("home")
    setMenuOpen(false)
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 0)
    else window.scrollTo(0, 0)
  }

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
            <a className={view === "home" ? "font-semibold text-[#245947]" : "transition hover:text-[#245947]"} href="#inicio" onClick={(e) => { e.preventDefault(); goHome() }}>
              Início
            </a>
            <a className="transition hover:text-[#245947]" href="#explorar" onClick={(e) => { e.preventDefault(); goHome("#explorar") }}>
              Explorar
            </a>
            {user && (
              <>
                <a className="transition hover:text-[#245947]" href="#biblioteca" onClick={(e) => { e.preventDefault(); goHome("#biblioteca") }}>
                  Minha biblioteca
                </a>
                <a className={view === "profile" ? "font-semibold text-[#245947]" : "transition hover:text-[#245947]"} href="#perfil" onClick={(e) => { e.preventDefault(); setView("profile"); window.scrollTo(0, 0) }}>
                  Meu perfil
                </a>
              </>
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
              onClick={() => { setView("profile"); window.scrollTo(0, 0) }}
              title="Abrir meu perfil"
              type="button"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7ded0] text-[#6c503d]">
                <Icon name="user" className="h-4 w-4" />
              </span>
              {user}
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
              {(user ? ["Início", "Explorar", "Minha biblioteca", "Meu perfil"] : ["Início", "Explorar"]).map((item) => (
                <a
                  className="rounded-lg px-3 py-2.5 font-medium hover:bg-[#eee9df]"
                  href="#inicio"
                  key={item}
                  onClick={(e) => {
                    e.preventDefault()
                    if (item === "Meu perfil") { setView("profile"); setMenuOpen(false); window.scrollTo(0, 0) }
                    else goHome(item === "Explorar" ? "#explorar" : item === "Minha biblioteca" ? "#biblioteca" : "")
                  }}
                >
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

      {view === "profile" && user && (
        <ProfilePage
          favorites={favorites}
          name={user}
          onBack={() => goHome()}
          onLogout={() => { setUser(null); goHome() }}
          onToggleFavorite={toggleFavorite}
          onOpenBook={openBook}
          progress={progress}
          lists={lists}
          setLists={setLists}
          downloaded={downloaded}
          setDownloaded={setDownloaded}
        />
      )}

      {view === "book" && (
        <BookPage
          bookId={bookId}
          downloaded={downloaded}
          favorites={favorites}
          lists={lists}
          onBack={() => goHome("#explorar")}
          onOpenBook={openBook}
          onRequireAuth={() => setAuthMode("login")}
          onReview={(id, review) => setReviewsByBook((m) => ({ ...m, [id]: [review, ...(m[id] ?? [])] }))}
          onToggleFavorite={toggleFavorite}
          progress={progress}
          reviews={reviewsByBook[bookId] ?? []}
          setDownloaded={setDownloaded}
          setLists={setLists}
          setProgress={(id, page) => setProgressMap((m) => ({ ...m, [id]: page }))}
          user={user}
        />
      )}

      <main id="inicio" hidden={view === "book" || (view === "profile" && !!user)}>
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
                  <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#245947]" onClick={() => openBook(book.id)} type="button">
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
                        <button aria-label={`Ver detalhes de ${book.title}`} className="block w-full text-left transition group-hover:-translate-y-1" onClick={() => openBook(book.id)} type="button">
                          <BookCover book={book} />
                        </button>
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
                        <h3 className="mt-1 truncate font-serif text-lg font-semibold">
                          <button className="hover:underline" onClick={() => openBook(book.id)} type="button">{book.title}</button>
                        </h3>
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
