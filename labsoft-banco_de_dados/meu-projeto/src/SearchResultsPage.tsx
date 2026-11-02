import { useEffect, useState } from "react"
import { Icon } from "./shared"

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

type SearchBook = {
  id: number
  titulo: string | null
  autor: string | null
  genero: string | null
  sinopse: string | null
  ano_de_publicação?: number | null
  pais?: string | null
  lingua?: string | null
}

export default function SearchResultsPage({ query, onBack, onOpenBook }: { query: string; onBack: () => void; onOpenBook: (id: number) => void }) {
  const [books, setBooks] = useState<SearchBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const term = query.trim()

    if (!term) {
      setBooks([])
      setLoading(false)
      setError("")
      return
    }

    const controller = new AbortController()

    const loadBooks = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`${API_URL}/data/livros/busca?query=${encodeURIComponent(term)}&limit=20`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Não foi possível buscar os livros no momento.")
        }

        const payload = (await response.json()) as SearchBook[]
        setBooks(payload)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setError(err instanceof Error ? err.message : "Não foi possível buscar os livros.")
        setBooks([])
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadBooks()

    return () => controller.abort()
  }, [query])

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#25251f]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
        <button className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#245947]" onClick={onBack} type="button">
          <Icon className="h-4 w-4 rotate-180" name="chevron" /> Voltar ao catálogo
        </button>

        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a35d3e]">Busca por livros</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Resultados para “{query}”</h1>
          </div>
          {!loading && !error && <span className="text-sm text-[#5a574f]">{books.length} livro{books.length === 1 ? "" : "s"} encontrado{books.length === 1 ? "" : "s"}</span>}
        </div>

        {loading && <p className="text-sm text-[#5a574f]">Buscando livros...</p>}

        {!loading && error && <div className="rounded-2xl border border-[#e9d7cf] bg-[#fff6f3] p-4 text-sm text-[#8d3b2d]">{error}</div>}

        {!loading && !error && books.length === 0 && (
          <div className="rounded-2xl border border-[#ded8cb] bg-white/60 p-6 text-sm text-[#5a574f]">
            Nenhum livro foi encontrado para esta busca. Tente outro título, autor ou gênero.
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {books.map((book) => {
              const coverUrl = `${API_URL}/livro/${book.id}/capa`
              const title = book.titulo || "Livro sem título"

              return (
                <li className="flex h-full" key={book.id}>
                  <button className="flex w-full flex-col gap-3 rounded-2xl border border-[#ded8cb] bg-white/80 p-3 text-left shadow-[0_8px_18px_rgba(29,23,15,0.04)] transition hover:-translate-y-0.5 hover:border-[#245947]" onClick={() => onOpenBook(book.id)} type="button">
                    <div className="flex items-start gap-3">
                      <div className="h-[120px] w-[82px] shrink-0 overflow-hidden rounded-lg border border-[#e5dfd2] bg-[#ece6dc]">
                        <img alt={`Capa do livro ${title}`} className="h-full w-full object-cover" src={coverUrl} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          {book.genero && <span className="rounded-full bg-[#245947] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white">{book.genero}</span>}
                          {book.ano_de_publicação && <span className="text-[10px] text-[#77736a]">{book.ano_de_publicação}</span>}
                        </div>

                        <h2 className="font-serif text-lg font-semibold text-[#1d1a17]">{title}</h2>
                        <p className="mt-1 text-xs text-[#5a574f]">por <span className="font-semibold text-[#245947]">{book.autor || "Autor desconhecido"}</span></p>
                      </div>
                    </div>

                    <p className="line-clamp-4 text-xs leading-5 text-[#4a483f]">
                      {book.sinopse || "Sinopse não disponível para este livro no momento."}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
