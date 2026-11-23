import csv
from pathlib import Path

import requests

BASE_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = BASE_DIR / "downloads" / "gutenberg"
CAPAS_DIR = DOWNLOADS_DIR / "capas"
CAPAS_DIR.mkdir(parents=True, exist_ok=True)


def load_metadata():
    catalog_path = DOWNLOADS_DIR / "catalogo.csv"
    if not catalog_path.exists():
        return {}

    rows = {}
    with catalog_path.open("r", encoding="utf-8", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            book_id = (row.get("id") or row.get("book_id") or "").strip()
            if not book_id:
                continue
            rows[str(book_id)] = {
                "titulo": (row.get("titulo") or "").strip(),
                "autor": (row.get("autor") or "").strip(),
            }
    return rows


def get_cover_candidates(title: str, author: str):
    candidates = []
    terms = []
    for value in [title, author]:
        if value:
            terms.append(value)

    query = " ".join(terms)
    if not query:
        return candidates

    try:
        response = requests.get(
            "https://openlibrary.org/search.json",
            params={"q": query, "limit": 5},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except Exception:
        return candidates

    for doc in payload.get("docs", []):
        cover_id = doc.get("cover_i")
        if cover_id:
            candidates.append(f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg")

        for isbn in (doc.get("isbn") or [])[:3]:
            if isbn:
                candidates.append(f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg")

    return candidates


def save_cover(url: str, output_path: Path) -> bool:
    try:
        response = requests.get(url, timeout=20)
        if response.status_code != 200:
            return False
        if "image" not in response.headers.get("Content-Type", ""):
            return False
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(response.content)
        return True
    except Exception:
        return False


def main():
    metadata_by_id = load_metadata()
    files = []

    if not DOWNLOADS_DIR.exists():
        print(f"Pasta não encontrada: {DOWNLOADS_DIR}")
        return

    for file_path in sorted(DOWNLOADS_DIR.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() in {".txt", ".epub", ".pdf"}:
            files.append(file_path)

    if not files:
        print(f"Nenhum arquivo encontrado em: {DOWNLOADS_DIR}")
        return

    for file_path in files:
        book_id = file_path.stem
        output_path = CAPAS_DIR / f"{book_id}.jpg"

        if output_path.exists():
            print(f"[OK] capa já existe: {output_path.name}")
            continue

        meta = metadata_by_id.get(book_id, {})
        title = meta.get("titulo") or file_path.stem.replace("_", " ")
        author = meta.get("autor") or ""

        candidates = get_cover_candidates(title, author)

        found = False
        for url in candidates:
            if save_cover(url, output_path):
                print(f"[OK] capa salva para {book_id}: {output_path.name}")
                found = True
                break

        if not found:
            print(f"[WARN] capa não encontrada para {book_id}: {title}")

    print(f"\nCapas salvas em: {CAPAS_DIR}")


if __name__ == "__main__":
    main()
