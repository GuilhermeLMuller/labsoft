import type React from "react"

export type IconName =
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
  | "download" | "check" | "plus" | "users" | "star" | "list" | "eye" | "logout" | "lock" | "pen"

const iconPaths: Record<IconName, React.ReactNode> = {
  download: <path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14a6.5 6.5 0 0 1 3.5 6" /></>),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  eye: (<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
  logout: <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />,
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  pen: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
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

export function Icon({ name, className = "h-5 w-5", filled = false }: { name: IconName; className?: string; filled?: boolean }) {
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

export const books = [
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

export const genres = ["Todos", "Romance", "Aventura", "Ciência", "Contos"]

export function BookCover({ book, compact = false }: { book: (typeof books)[number]; compact?: boolean }) {
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

export type BookList = { id: number; name: string; ids: number[] }
