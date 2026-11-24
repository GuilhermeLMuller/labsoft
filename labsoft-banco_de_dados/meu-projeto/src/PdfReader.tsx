import { useEffect, useRef, useState } from "react"
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { updateUserBookRecord, type UserBookRecord } from "./api"

GlobalWorkerOptions.workerSrc = workerUrl
const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

type Props = {
  bookId: number
  title: string
  record: UserBookRecord
  onPage: (page: number) => void
  onClose: () => void
}

export default function PdfReader({ bookId, title, record, onPage, onClose }: Props) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(record.pagina_lendo && record.pagina_lendo > 0 ? record.pagina_lendo : 1)
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [closing, setClosing] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const pending = useRef<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saving = useRef<Promise<void> | null>(null)
  const onPageRef = useRef(onPage)
  onPageRef.current = onPage

  const flush = (): Promise<void> => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (saving.current) return saving.current.then(() => pending.current !== null ? flush() : undefined)
    if (pending.current === null) return Promise.resolve()
    const next = pending.current
    pending.current = null
    const task = updateUserBookRecord(record, "pagina", next).then(() => {
      onPageRef.current(next)
      setSaveError("")
    }).catch((err: unknown) => {
      if (pending.current === null) pending.current = next
      setSaveError(err instanceof Error ? err.message : "Não foi possível salvar o progresso.")
      throw err
    }).finally(() => {
      saving.current = null
    })
    saving.current = task
    return task.then(() => pending.current !== null ? flush() : undefined)
  }

  useEffect(() => {
    const loading = getDocument({ url: `${API_URL}/livro/${bookId}/pdf/conteudo` })
    let active = true
    loading.promise.then((pdf) => {
      if (!active) return
      setDocument(pdf)
      setPage((current) => Math.min(current, pdf.numPages))
      if (!record.pagina_lendo || record.pagina_lendo > pdf.numPages) {
        pending.current = Math.min(record.pagina_lendo || 1, pdf.numPages)
        timer.current = setTimeout(() => { void flush().catch(() => {}) }, 700)
      }
    }).catch(() => {
      if (active) setError("Não foi possível carregar o PDF deste livro.")
    })
    return () => {
      active = false
      void loading.destroy()
    }
  }, [bookId])

  useEffect(() => {
    if (!document || !canvas.current) return
    let cancelled = false
    let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined
    document.getPage(page).then((pdfPage) => {
      if (cancelled || !canvas.current) return
      const viewport = pdfPage.getViewport({ scale: 1 })
      const scale = Math.min(2, Math.max(0.5, (window.innerWidth - 48) / viewport.width))
      const scaled = pdfPage.getViewport({ scale })
      const outputScale = window.devicePixelRatio || 1
      const element = canvas.current
      element.width = Math.floor(scaled.width * outputScale)
      element.height = Math.floor(scaled.height * outputScale)
      element.style.width = `${scaled.width}px`
      element.style.height = `${scaled.height}px`
      renderTask = pdfPage.render({ canvas: element, viewport: scaled, transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0] })
      return renderTask.promise
    }).catch(() => {
      if (!cancelled) setError("Não foi possível exibir esta página do PDF.")
    })
    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [document, page])

  const changePage = (next: number) => {
    if (!document) return
    const value = Math.max(1, Math.min(document.numPages, next))
    if (value === page) return
    setPage(value)
    pending.current = value
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { void flush().catch(() => {}) }, 700)
  }

  const close = async () => {
    setClosing(true)
    try {
      await flush()
      onClose()
    } catch {
      setClosing(false)
    }
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
    void flush().catch(() => {})
  }, [])

  return (
    <div aria-label={`Leitor: ${title}`} aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-[#f3ecdc]" role="dialog">
      <div className="flex items-center gap-4 border-b border-[#ded8cb] px-4 py-3">
        <button className="font-semibold text-[#245947] disabled:opacity-50" disabled={closing} onClick={() => void close()} type="button">Fechar</button>
        <p className="min-w-0 flex-1 truncate text-center font-serif font-semibold">{title}</p>
      </div>
      {(error || saveError) && <p className="bg-red-100 p-3 text-center text-sm text-red-800" role="alert">{error || `Erro ao salvar progresso: ${saveError} Tente fechar novamente.`}</p>}
      <div className="flex flex-1 justify-center overflow-auto p-4">
        {!document && !error && <p>Carregando livro...</p>}
        <canvas className="h-fit max-w-full bg-white shadow-lg" ref={canvas} />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#ded8cb] px-4 py-3">
        <button className="rounded-full border border-[#245947] px-5 py-2 disabled:opacity-40" disabled={!document || page <= 1 || closing} onClick={() => changePage(page - 1)} type="button">Anterior</button>
        <span className="text-sm">Página {page} de {document?.numPages ?? "…"}</span>
        <button className="rounded-full bg-[#245947] px-5 py-2 text-white disabled:opacity-40" disabled={!document || page >= document.numPages || closing} onClick={() => changePage(page + 1)} type="button">Próxima</button>
      </div>
    </div>
  )
}
