import { useEffect, useMemo, useState, type FormEvent } from "react"
import { createReview, createUserBookRecord, deleteReview, fetchBookReviews, updateReview } from "./api"
import { BookCover, Icon, books, type BookList } from "./shared"

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

export type Review = { id: number; author: string; stars: number; date: string; text: string; mine?: boolean }

type Props = {
  bookId: number
  userId: number | null
  user: string | null
  favorites: number[]
  onToggleFavorite: (id: number) => void
  lists: BookList[]
  setLists: React.Dispatch<React.SetStateAction<BookList[]>>
  downloaded: number[]
  setDownloaded: React.Dispatch<React.SetStateAction<number[]>>
  progress: Record<number, number>
  setProgress: (id: number, page: number) => void
  reviews: Review[]
  onReview: (bookId: number, review: Review) => void
  onRequireAuth: () => void
  onOpenBook: (id: number) => void
  onBack: () => void
}

export const bookDetails: Record<number, { pages: number; year: number; synopsis: string[]; size: string }> = {
   1: { pages: 284, year: 2023, size: "3,2 MB", synopsis: ["Depois da morte da mãe, Clara descobre uma caixa de cartas que nunca foram enviadas, todas endereçadas a alguém que ela não conhece.", "Entre o interior de Minas e uma São Paulo que já não existe, a busca vira um retrato sobre aquilo que as famílias escolhem não dizer."] },
   2: { pages: 310, year: 2022, size: "4,1 MB", synopsis: ["Quando o mapa do avô aparece com uma montanha que não existe em nenhuma carta oficial, Tomás larga o emprego e parte.", "Uma aventura de travessias duras e encontros inesperados, sobre o que se perde e o que se ganha ao seguir sem garantias."] },
   3: { pages: 256, year: 2024, size: "2,8 MB", synopsis: ["Numa casa de serra, três gerações de mulheres se reúnem para o último inverno antes da venda do terreno.", "Entre receitas, silêncios e um jardim que insiste em florescer, Helena Duarte escreve sobre herança e despedida com delicadeza rara."] },
   4: { pages: 224, year: 2021, size: "5,6 MB", synopsis: ["Do big bang aos buracos negros, André Lins conduz o leitor por grandes ideias da física sem exigir uma única fórmula.", "Um guia claro e curioso para quem sempre quis entender o tempo, mas nunca encontrou por onde começar."] },
   5: { pages: 178, year: 2023, size: "1,9 MB", synopsis: ["Doze contos sobre encontros marcados em cafés, quase sempre adiados e às vezes impossíveis.", "Luiza Mota captura em poucas páginas a pequena coragem de dizer o que importa antes que a xícara esfrie."] },
}

const seedReviews: Record<number, Review[]> = {
  1: [{ id: 101, author: "Beatriz S.", stars: 5, date: "02 out 2026", text: "Chorei no capítulo sete e não consegui largar até o fim." }, { id: 102, author: "Rodrigo P.", stars: 4, date: "18 set 2026", text: "Ritmo lento no começo, mas a recompensa vem." }],
  2: [{ id: 201, author: "Camila R.", stars: 5, date: "09 out 2026", text: "Li em dois dias. As paisagens são vívidas demais." }],
  3: [{ id: 301, author: "Joana M.", stars: 5, date: "14 out 2026", text: "Livro para ler devagar, com chá na mão." }, { id: 302, author: "Henrique T.", stars: 5, date: "30 set 2026", text: "A melhor leitura do ano até aqui." }],
  4: [{ id: 401, author: "Felipe A.", stars: 4, date: "21 set 2026", text: "Didático sem ser simplista." }],
  5: [{ id: 501, author: "Paula L.", stars: 4, date: "11 out 2026", text: "O conto final vale o livro inteiro." }],
}

export const initialReviews = seedReviews

const passages = [
  "A chuva começou antes que alguém tivesse coragem de fechar as janelas. Lá fora, a rua inteira parecia prender a respiração, como quem espera uma notícia que já sabe qual é.",
  "Havia, naquela hora da tarde, uma luz que fazia as coisas parecerem mais antigas do que eram. A xícara sobre a mesa, o relógio parado, o livro aberto na mesma página desde a véspera.",
  "— Você acha que as pessoas mudam? — perguntou ela, sem tirar os olhos do vidro embaçado. A resposta demorou tanto que virou outra coisa: uma forma de carinho.",
  "Aprendeu cedo que certas histórias não se contam de uma vez. Elas chegam em pedaços, trazidas por quem se lembra, e só no fim se juntam num desenho que ninguém pediu.",
  "O caminho de volta era mais curto, como sempre acontece. Ainda assim, ele caminhou devagar, guardando cada detalhe da paisagem, como se pudesse levar a cidade no bolso.",
  "Quando por fim abriu a carta, não leu as palavras. Reconheceu primeiro a letra, e foi a letra que disse tudo o que importava.",
]

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span aria-label={`${value.toFixed(1).replace(".", ",")} de 5 estrelas`} className="flex gap-0.5 text-[#b55f40]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon className={size} filled={n <= Math.round(value)} key={n} name="star" />
      ))}
    </span>
  )
}

function Reader({ bookId, startPage, onPage, onClose }: { bookId: number; startPage: number; onPage: (p: number) => void; onClose: () => void }) {
  const book = books.find((b) => b.id === bookId)!
  const total = bookDetails[bookId].pages
  const [page, setPage] = useState(startPage)

  useEffect(() => {
    onPage(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setPage((p) => Math.min(total, p + 1))
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1))
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose, total])

  const text = [0, 1, 2].map((i) => passages[(page * 2 + i) % passages.length])
  const pct = Math.round((page / total) * 100)

  return (
    <div aria-label={`Leitor: ${book.title}`} aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-[#f3ecdc]" role="dialog">
      <div className="flex h-14 items-center gap-4 border-b border-[#ded8cb] px-4 sm:px-8">
        <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#245947]" onClick={onClose} type="button">
          <Icon className="h-4 w-4 rotate-180" name="chevron" /> Fechar
        </button>
        <p className="min-w-0 flex-1 truncate text-center font-serif text-sm font-semibold">{book.title}</p>
        <span className="text-xs text-[#77736a]">{pct}%</span>
      </div>
      <div className="h-1 bg-[#dfdcd4]">
        <div className="h-full bg-[#b55f40] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <article className="mx-auto max-w-[620px]">
          {page === 1 ? (
            <header className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-[#98735b]">Capítulo 1</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold">{book.title}</h1>
            </header>
          ) : (
            <p className="mb-8 text-center text-xs uppercase tracking-[0.25em] text-[#98735b]">Capítulo {Math.ceil(page / 24)}</p>
          )}
          <div className="space-y-6 font-serif text-[19px] leading-[1.85] text-[#2c2a24]">
            {text.map((t, i) => (
              <p className={i === 0 && page === 1 ? "first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-[0.9] first-letter:text-[#245947]" : ""} key={i}>{t}</p>
            ))}
          </div>
        </article>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#ded8cb] px-4 py-3 sm:px-8">
        <button className="h-10 rounded-full border border-[#245947] px-5 text-sm font-semibold text-[#245947] transition hover:bg-[#245947]/10 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)} type="button">
          Anterior
        </button>
        <label className="flex items-center gap-2 text-sm text-[#5a574f]">
          Página
          <input
            aria-label="Ir para a página"
            className="h-9 w-16 rounded-lg border border-[#ddd7ca] bg-white text-center text-sm outline-none focus:border-[#245947]"
            max={total}
            min={1}
            onChange={(e) => setPage(Math.min(total, Math.max(1, Number(e.target.value) || 1)))}
            type="number"
            value={page}
          />
          de {total}
        </label>
        <button className="h-10 rounded-full bg-[#245947] px-5 text-sm font-bold text-white transition hover:bg-[#1b4637] disabled:opacity-40" disabled={page >= total} onClick={() => setPage(page + 1)} type="button">
          Próxima
        </button>
      </div>
    </div>
  )
}

export default function BookPage(p: Props) {
  const staticBook = books.find((b) => b.id === p.bookId) ?? {
    id: p.bookId,
    title: `Livro ${p.bookId}`,
    author: "Autor desconhecido",
    genre: "Geral",
    rating: "4,5",
    color: "from-[#245947] to-[#1b4637]",
    accent: "#e9d5a5",
    mark: "uma leitura",
  }
  const d = bookDetails[p.bookId] ?? { pages: 250, year: 2024, size: "1,0 MB", synopsis: ["Sinopse não disponível."] }
  const [reading, setReading] = useState(false)
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [listMenu, setListMenu] = useState(false)
  const [toast, setToast] = useState("")
  const [coverError, setCoverError] = useState(false)
  const [bookInfo, setBookInfo] = useState<{
    id: number
    titulo: string | null
    autor: string | null
    genero: string | null
    sinopse: string | null
    ano_de_publicação?: number | null
    pais?: string | null
    lingua?: string | null
    restricao_de_idade?: number | null
    capa?: string | null
  } | null>(null)

  useEffect(() => {
    setCoverError(false)
    let active = true

    async function loadBook() {
      try {
        const response = await fetch(`${API_URL}/livro/${p.bookId}`)
        if (!response.ok) throw new Error("Livro não encontrado")
        const data = (await response.json()) as typeof bookInfo
        if (active) setBookInfo(data)
      } catch {
        if (active) setBookInfo(null)
      }
    }

    loadBook()
    return () => {
      active = false
    }
  }, [p.bookId])

  useEffect(() => {
    let active = true
    setReviews([])
    fetchBookReviews(p.bookId)
      .then((items) => {
        if (!active) return
        setReviews(items.map((item) => ({
          id: item.id,
          author: item.nome_usuario,
          stars: item.rating,
          date: "Publicado",
          text: item.comment ?? "",
          mine: item.id_usuario === p.userId,
        })))
      })
      .catch((error: Error) => {
        if (active) setReviewError(error.message)
      })
    return () => {
      active = false
    }
  }, [p.bookId, p.userId])

  useEffect(() => {
    if (!p.userId) return
    let active = true
    createUserBookRecord(p.userId, p.bookId)
      .catch((error: Error) => {
        if (active) setToast(error.message)
      })
    return () => {
      active = false
    }
  }, [p.bookId, p.userId])

  const book = {
    id: staticBook.id,
    title: bookInfo?.titulo || staticBook.title,
    author: bookInfo?.autor || staticBook.author,
    genre: bookInfo?.genero || staticBook.genre,
    rating: staticBook.rating,
    color: staticBook.color,
    accent: staticBook.accent,
    mark: staticBook.mark,
  }
  const synopsis = bookInfo?.sinopse ? [bookInfo.sinopse] : d.synopsis
  const publicationYear = bookInfo?.ano_de_publicação ?? d.year
  const country = bookInfo?.pais || "Não informado"
  const language = bookInfo?.lingua || "Não informado"
  const ageRating = bookInfo?.restricao_de_idade == null ? "Não informado" : `${bookInfo.restricao_de_idade}+`
  const coverUrl = `${API_URL}/livro/${p.bookId}/capa`

  useEffect(() => {
    window.scrollTo(0, 0)
    setStars(0)
    setText("")
    setListMenu(false)
  }, [p.bookId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(""), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const isFavorite = p.favorites.includes(p.bookId)
  const isDownloaded = p.downloaded.includes(p.bookId)
  const saved = p.progress[p.bookId]

  const score = useMemo(() => {
    const count = reviews.length
    const sum = reviews.reduce((total, review) => total + review.stars, 0)
    return { value: count > 0 ? sum / count : 0, count }
  }, [reviews])

  const distribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((s) => {
      const extra = reviews.filter((r) => r.stars === s).length
      return { s, n: extra }
    })
  }, [reviews])
  const maxDist = Math.max(1, ...distribution.map((x) => x.n))

  const guard = (fn: () => void) => () => (p.user ? fn() : p.onRequireAuth())

  const download = guard(() => {
    if (!isDownloaded) p.setDownloaded((x) => [...x, p.bookId])
    const url = `${API_URL}/livro/${p.bookId}/pdf/download`
    const link = document.createElement("a")
    link.href = url
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    link.download = `${(book.title || "livro").replace(/[\\/:*?"<>|]/g, "")}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setToast(`Download de “${book.title}” iniciado (${d.size}).`)
  })

  const submitReview = async (e: FormEvent) => {
    e.preventDefault()
    if (!p.user) return p.onRequireAuth()
    if (stars === 0) return setReviewError("Escolha uma nota de 1 a 5 estrelas.")
    if (text.trim().length < 3) return setReviewError("Escreva um breve comentário.")
    if (!p.userId) return setReviewError("Não foi possível identificar sua conta.")
    setReviewError("")
    try {
      if (editingReview) {
        await updateReview(editingReview.id, p.userId, p.bookId, stars, text.trim())
        setReviews((items) => items.map((item) => item.id === editingReview.id ? { ...item, stars, text: text.trim() } : item))
        setToast("Avaliação atualizada.")
      } else {
        const response = await createReview(p.userId, p.bookId, stars, text.trim())
        const review = { id: response.avaliacao.id_avaliacao, author: p.user, stars, text: text.trim(), date: "Hoje", mine: true }
        setReviews((items) => [review, ...items])
        p.onReview(p.bookId, review)
        setToast("Avaliação publicada. Sua nota já entra no cálculo da média.")
      }

      setEditingReview(null)
      setStars(0)
      setText("")
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Não foi possível salvar a avaliação.")
    }
  }

  const removeEditingReview = async () => {
    if (!editingReview) return
    if (!window.confirm("Excluir sua avaliação? Essa ação não pode ser desfeita.")) return

    setReviewError("")
    try {
      await deleteReview(editingReview.id)
      setReviews((items) => items.filter((item) => item.id !== editingReview.id))
      setEditingReview(null)
      setStars(0)
      setText("")
      setToast("Avaliação excluída.")
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Não foi possível excluir a avaliação.")
    }
  }

  const toggleInList = (listId: number) => {
    p.setLists((ls) => ls.map((l) => (l.id === listId ? { ...l, ids: l.ids.includes(p.bookId) ? l.ids.filter((i) => i !== p.bookId) : [...l.ids, p.bookId] } : l)))
  }

  const related = books.filter((b) => b.id !== p.bookId).sort((a, b) => Number(b.genre === book.genre) - Number(a.genre === book.genre)).slice(0, 4)

  return (
    <main>
      <section className="mx-auto max-w-[1400px] px-5 pt-7 sm:px-8 lg:px-12 lg:pt-10">
        <button className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#245947]" onClick={p.onBack} type="button">
          <Icon className="h-4 w-4 rotate-180" name="chevron" /> Voltar ao catálogo
        </button>

        <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:gap-16">
          <div className="mx-auto w-full max-w-[280px] lg:max-w-none">
            <div className="rotate-[-1.5deg] transition hover:rotate-0">
              <div className="relative mx-auto w-full max-w-[230px] overflow-hidden rounded-[18px] border border-[#d7d0bf] bg-[#efeae0] shadow-[0_18px_35px_rgba(35,28,20,0.14)]">
                {!coverError && (
                  <img
                    alt={`Capa do livro ${book.title}`}
                    className="h-[320px] w-full object-cover sm:h-[360px]"
                    onError={() => setCoverError(true)}
                    src={coverUrl}
                  />
                )}
                {coverError && (
                  <div className={`flex h-[320px] w-full items-center justify-center bg-gradient-to-br ${book.color} p-5 text-center text-white sm:h-[360px]`}>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">{book.mark}</p>
                      <h2 className="mt-3 font-serif text-2xl leading-tight">{book.title}</h2>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{book.author}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#245947] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">{book.genre}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#ccc4b4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a574f]">
                <Icon className="h-3 w-3 text-[#245947]" name="check" /> Disponível na plataforma
              </span>
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">{book.title}</h1>
            <p className="mt-3 text-lg text-[#5a574f]">por <span className="font-semibold text-[#245947]">{book.author}</span></p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Stars size="h-5 w-5" value={score.value} />
              <strong className="font-serif text-xl">{score.value.toFixed(1).replace(".", ",")}</strong>
              <a className="text-sm text-[#77736a] underline underline-offset-4" href="#avaliacoes">{score.count.toLocaleString("pt-BR")} avaliações</a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[#245947] px-7 text-sm font-bold text-white transition hover:bg-[#1b4637]" onClick={guard(() => setReading(true))} type="button">
                <Icon className="h-4 w-4" name="book" /> {saved ? `Continuar na página ${saved}` : "Ler agora"}
              </button>
              <button className="inline-flex h-12 items-center gap-2 rounded-full border border-[#245947] px-6 text-sm font-bold text-[#245947] transition hover:bg-[#245947]/10" onClick={download} type="button">
                <Icon className="h-4 w-4" name={isDownloaded ? "check" : "download"} /> {isDownloaded ? "Baixado · baixar de novo" : "Baixar para ler offline"}
              </button>
              <button
                aria-pressed={isFavorite}
                className={`inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-bold transition ${isFavorite ? "border-[#b65c40] bg-[#b65c40] text-white" : "border-[#ccc4b4] text-[#4f4c46] hover:border-[#b65c40] hover:text-[#b65c40]"}`}
                onClick={guard(() => p.onToggleFavorite(p.bookId))}
                type="button"
              >
                <Icon className="h-4 w-4" filled={isFavorite} name="heart" /> {isFavorite ? "Favoritado" : "Favoritar"}
              </button>
              <div className="relative">
                <button aria-expanded={listMenu} className="inline-flex h-12 items-center gap-2 rounded-full border border-[#ccc4b4] px-5 text-sm font-bold text-[#4f4c46] transition hover:border-[#245947] hover:text-[#245947]" onClick={guard(() => setListMenu((o) => !o))} type="button">
                  <Icon className="h-4 w-4" name="list" /> Adicionar à lista
                </button>
                {listMenu && (
                  <div className="absolute left-0 top-14 z-20 w-64 rounded-2xl border border-[#ded8cb] bg-[#fffdf8] p-2 shadow-[0_18px_40px_rgba(41,30,22,0.16)]">
                    {p.lists.length === 0 && <p className="px-3 py-3 text-sm text-[#77736a]">Você ainda não tem listas. Crie uma no seu perfil.</p>}
                    {p.lists.map((l) => {
                      const inList = l.ids.includes(p.bookId)
                      return (
                        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[#eee9df]" key={l.id} onClick={() => toggleInList(l.id)} role="menuitemcheckbox" aria-checked={inList} type="button">
                          <span className={`grid h-5 w-5 place-items-center rounded border ${inList ? "border-[#245947] bg-[#245947] text-white" : "border-[#bfb7a7]"}`}>{inList && <Icon className="h-3.5 w-3.5" name="check" />}</span>
                          <span className="flex-1 truncate font-medium">{l.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            {!p.user && <p className="mt-3 text-sm text-[#77736a]">Entre na sua conta para ler, baixar, favoritar e avaliar.</p>}

            <div className="mt-10 max-w-2xl space-y-4 font-serif text-lg leading-8 text-[#3b3a33]">
              {synopsis.map((t) => <p key={t}>{t}</p>)}
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-y-5 border-t border-[#ded8cb] pt-6 text-sm sm:grid-cols-4">
              {[["Publicação", String(publicationYear)], ["País", country], ["Idioma", language], ["Classificação", ageRating]].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#8d6e57]">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mt-16 scroll-mt-24 border-y border-[#ddd7ca] bg-[#efeae0]/70 py-14 lg:py-16" id="avaliacoes">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[360px_1fr] lg:gap-16 lg:px-12">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#a35d3e]">Nota final</p>
            <p className="font-serif text-7xl font-semibold">{score.value.toFixed(1).replace(".", ",")}</p>
            <Stars size="h-5 w-5" value={score.value} />
            <p className="mt-2 text-sm text-[#77736a]">{score.count.toLocaleString("pt-BR")} avaliações · cada nova nota entra na média</p>
            <div className="mt-6 space-y-2">
              {distribution.map((x) => (
                <div className="flex items-center gap-3 text-xs text-[#77736a]" key={x.s}>
                  <span className="w-3 font-semibold">{x.s}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfdcd4]">
                    <div className="h-full rounded-full bg-[#b55f40]" style={{ width: `${(x.n / maxDist) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right">{x.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Deixe sua opinião</h2>
            <form className="mt-5 rounded-2xl border border-[#ded8cb] bg-[#fffdf8] p-5" onSubmit={submitReview}>
              {editingReview && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-[#efeae0] px-3 py-2 text-sm text-[#5a574f]">
                  <span>Editando sua avaliação</span>
                  <div className="flex items-center gap-3">
                    <button className="font-semibold text-[#a8402b] hover:underline" onClick={removeEditingReview} type="button">
                      Excluir
                    </button>
                    <button className="font-semibold text-[#245947] hover:underline" onClick={() => { setEditingReview(null); setStars(0); setText("") }} type="button">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3" onMouseLeave={() => setHover(0)}>
                <span className="text-sm font-semibold">Sua nota</span>
                <div className="flex gap-1 text-[#b55f40]" role="radiogroup" aria-label="Nota">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button aria-checked={stars === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`} className="p-0.5 transition hover:scale-110" key={n} onClick={() => setStars(n)} onMouseEnter={() => setHover(n)} role="radio" type="button">
                      <Icon className="h-7 w-7" filled={n <= (hover || stars)} name="star" />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                aria-label="Comentário"
                className="mt-4 min-h-[110px] w-full rounded-xl border border-[#ddd7ca] bg-white p-4 text-sm outline-none transition placeholder:text-[#9a968c] focus:border-[#245947] focus:ring-2 focus:ring-[#245947]/15"
                onChange={(e) => setText(e.target.value)}
                placeholder="O que você achou deste livro?"
                value={text}
              />
              {reviewError && <p className="mt-2 text-sm text-[#a8402b]" role="alert">{reviewError}</p>}
              <button className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#245947] px-6 text-sm font-bold text-white transition hover:bg-[#1b4637]" type="submit">
                <Icon className="h-4 w-4" name="pen" /> {p.user ? (editingReview ? "Salvar avaliação" : "Publicar avaliação") : "Entrar para avaliar"}
              </button>
            </form>

            <h3 className="mb-4 mt-10 font-serif text-xl font-semibold">Comentários ({reviews.length})</h3>
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li className="flex gap-4 rounded-2xl border border-[#ded8cb] bg-white/60 p-5" key={r.id}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7ded0] font-serif font-semibold text-[#6c503d]">{r.author.slice(0, 1)}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <strong className="text-sm">{r.author}{r.mine && <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#245947]">Você</span>}</strong>
                      <Stars value={r.stars} />
                      <span className="text-xs text-[#77736a]">{r.date}</span>
                      {r.mine && (
                        <button
                          className="text-xs font-semibold text-[#245947] hover:underline"
                          onClick={() => {
                            setEditingReview(r)
                            setStars(r.stars)
                            setText(r.text)
                            setReviewError("")
                          }}
                          type="button"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4a483f]">{r.text}</p>
                  </div>
                </li>
              ))}
              {reviews.length === 0 && <li className="text-sm text-[#77736a]">Seja a primeira pessoa a comentar.</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#a35d3e]">Continue explorando</p>
        <h2 className="mb-8 font-serif text-2xl font-semibold sm:text-3xl">Leitores deste livro também leram</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {related.map((b) => (
            <button className="group min-w-0 text-left" key={b.id} onClick={() => p.onOpenBook(b.id)} type="button">
              <div className="transition group-hover:-translate-y-1"><BookCover book={b} compact /></div>
              <h3 className="mt-4 truncate font-serif text-lg font-semibold">{b.title}</h3>
              <p className="truncate text-xs text-[#77736a]">{b.author} · ★ {b.rating}</p>
            </button>
          ))}
        </div>
      </section>

      {reading && <Reader bookId={p.bookId} onClose={() => setReading(false)} onPage={(pg) => p.setProgress(p.bookId, pg)} startPage={saved ?? 1} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#1d493b] px-5 py-3 text-sm font-medium text-white shadow-lg" role="status">{toast}</div>
      )}
    </main>
  )
}
