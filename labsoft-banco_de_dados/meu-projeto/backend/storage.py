from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BACKEND_DIR / "storage"

def book_path(id_livro: int) -> Path:
    return STORAGE_DIR / "livros" / f"{id_livro}.pdf"

def book_cover_path(id_livro: int) -> Path:
    return STORAGE_DIR / "capas" / f"{id_livro}.jpg"