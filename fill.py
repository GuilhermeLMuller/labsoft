import csv
from pathlib import Path

import requests

BASE_DIR = Path(__file__).resolve().parent

CANDIDATE_CSVS = [
    BASE_DIR / "downloads" / "pdfs" / "catalogo.csv",
]

CSV_PATH = next((path for path in CANDIDATE_CSVS if path.exists()), CANDIDATE_CSVS[0])

FILES_DIR = BASE_DIR / "downloads" / "pdfs"
if not FILES_DIR.exists():
    FILES_DIR = BASE_DIR / "downloads" / "pdfs"

CAPAS_DIR = FILES_DIR / "capas"
API_URL = "http://localhost:8000"


def find_existing_file(source_book_id: int):
    for suffix in (".pdf", ".epub", ".txt"):
        path = FILES_DIR / f"{source_book_id}{suffix}"
        if path.exists():
            return path
    return None


def find_cover(source_book_id: int):
    path = CAPAS_DIR / f"{source_book_id}.jpg"
    if path.exists():
        return path
    return None


def normalize_key(key):
    if key is None:
        return ""
    return str(key).replace("\ufeff", "").replace(";", "").strip().lower()


def read_csv_rows(path: Path):
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return []

    header = [normalize_key(cell) for cell in rows[0]]
    data = []
    for row in rows[1:]:
        if not row or not any(cell.strip() for cell in row):
            continue
        record = {}
        for index, key in enumerate(header):
            if index >= len(row):
                continue
            record[key] = row[index].strip()
        if record:
            data.append(record)
    return data


def find_book_in_db(title: str, author: str):
    url = f"{API_URL}/data/livros"
    params = {"titulo": title, "autor": author}
    response = requests.get(url, params=params, timeout=30)
    if response.status_code >= 400:
        print(f"[WARN] falha ao consultar o banco para {title}: {response.status_code} - {response.text[:300]}")
        return None

    try:
        books = response.json()
    except ValueError:
        print(f"[WARN] resposta inválida ao consultar o banco para {title}: {response.text[:300]}")
        return None

    if not isinstance(books, list):
        return None

    for book in books:
        if str(book.get("titulo", "")).strip().lower() == title.strip().lower() and str(book.get("autor", "")).strip().lower() == author.strip().lower():
            book_id = book.get("id")
            if book_id is None:
                book_id = book.get("id_livro")
            if book_id is not None:
                return int(book_id)

    return None


rows = read_csv_rows(CSV_PATH)

for row in rows:
    source_book_id = (row.get("id") or "").strip()
    title = (row.get("titulo") or "").strip()
    author = (row.get("autor") or "").strip()

    if not source_book_id or not title or not author:
        print(f"[WARN] linha ignorada por dados incompletos: {row}")
        continue

    book_id = find_book_in_db(title, author)
    if book_id is None:
        print(f"[WARN] livro não encontrado no banco: {title} | {author}")
        continue

    file_path = find_existing_file(int(source_book_id))
    if not file_path:
        print(f"[WARN] arquivo do livro {source_book_id} não encontrado. Pulando upload.")
        continue

    pdf_handle = open(file_path, "rb")
    files = {"pdf": (file_path.name, pdf_handle, "application/pdf")}
    handles = [pdf_handle]
    cover_path = find_cover(int(source_book_id))
    if cover_path:
        cover_handle = open(cover_path, "rb")
        files["capa"] = (cover_path.name, cover_handle, "image/jpeg")
        handles.append(cover_handle)

    try:
        upload_response = requests.put(
            f"{API_URL}/livro/{book_id}/upload",
            files=files,
            timeout=120,
        )
        print(f"[INFO] upload do livro id={book_id} ({title}) usando arquivo {file_path.name}")
        print(f"[INFO] status: {upload_response.status_code}")
        print(upload_response.text[:500])
    finally:
        for handle in handles:
            handle.close()