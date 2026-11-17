import csv
import time
from pathlib import Path

import requests

BOOKS = [
    {"id": 74, "title": "The Adventures of Tom Sawyer", "author": "Mark Twain"},
    {"id": 76, "title": "Adventures of Huckleberry Finn", "author": "Mark Twain"},
    {"id": 345, "title": "The Picture of Dorian Gray", "author": "Oscar Wilde"},
    {"id": 521, "title": "The Importance of Being Earnest", "author": "Oscar Wilde"},
    {"id": 1342, "title": "Pride and Prejudice", "author": "Jane Austen"},
    {"id": 1400, "title": "Great Expectations", "author": "Charles Dickens"},
    {"id": 16328, "title": "The War of the Worlds", "author": "H. G. Wells"},
    {"id": 2701, "title": "Moll Flanders", "author": "Daniel Defoe"},
    {"id": 27827, "title": "The Time Machine", "author": "H. G. Wells"},
    {"id": 30254, "title": "A Study in Scarlet", "author": "Arthur Conan Doyle"},
    {"id": 244, "title": "A Tale of Two Cities", "author": "Charles Dickens"},
    {"id": 236, "title": "The Trial", "author": "Franz Kafka"},
    {"id": 43, "title": "The Strange Case of Dr. Jekyll and Mr. Hyde", "author": "Robert Louis Stevenson"},
    {"id": 100, "title": "The Metamorphosis", "author": "Franz Kafka"},
    {"id": 84, "title": "Frankenstein; Or, The Modern Prometheus", "author": "Mary Shelley"},
    {"id": 11, "title": "Alice's Adventures in Wonderland", "author": "Lewis Carroll"},
    {"id": 12, "title": "Through the Looking-Glass", "author": "Lewis Carroll"},
    {"id": 219, "title": "Heart of Darkness", "author": "Joseph Conrad"},
    {"id": 120, "title": "Treasure Island", "author": "Robert Louis Stevenson"},
    {"id": 42, "title": "The Iron Heel", "author": "Jack London"},
    {"id": 1635, "title": "Zarathustra", "author": "Friedrich Nietzsche"},
    {"id": 55, "title": "The Wonderful Wizard of Oz", "author": "L. Frank Baum"},
    {"id": 364, "title": "The Black Cat", "author": "Edgar Allan Poe"},
    {"id": 3207, "title": "The Legend of Sleepy Hollow", "author": "Washington Irving"},
    {"id": 2600, "title": "War and Peace", "author": "Leo Tolstoy"},
    {"id": 1232, "title": "The Prince and the Pauper", "author": "Mark Twain"},
]

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "downloads" / "gutenberg"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
METADATA_PATH = OUTPUT_DIR / "catalogo.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "Accept": "text/plain,*/*;q=0.8",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def download_candidate(url: str, file_path: Path) -> bool:
    try:
        response = SESSION.get(url, timeout=30)
        response.raise_for_status()
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(response.content)
        return True
    except requests.RequestException as exc:
        print(f"[WARN] Falha ao baixar {url}: {exc}")
        return False


def main():
    rows = []
    downloaded = 0

    for index, book in enumerate(BOOKS, start=1):
        book_id = book["id"]
        title = book["title"]
        author = book["author"]

        candidates = [
            ("pdf", OUTPUT_DIR / f"{book_id}.pdf", f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.pdf"),
            ("epub", OUTPUT_DIR / f"{book_id}.epub", f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.epub"),
            ("txt", OUTPUT_DIR / f"{book_id}.txt", f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"),
        ]

        saved = False
        for format_name, file_path, url in candidates:
            if download_candidate(url, file_path):
                saved = True
                downloaded += 1
                rows.append({
                    "id": book_id,
                    "titulo": title,
                    "autor": author,
                    "arquivo": file_path.name,
                    "formato": format_name,
                    "status": "baixado",
                })
                print(f"[OK] {index}/{len(BOOKS)} - {title} ({format_name})")
                break

        if not saved:
            rows.append({
                "id": book_id,
                "titulo": title,
                "autor": author,
                "arquivo": "",
                "formato": "",
                "status": "falhou",
            })
            print(f"[ERRO] {index}/{len(BOOKS)} - {title}")

        time.sleep(1)

    with METADATA_PATH.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=["id", "titulo", "autor", "arquivo", "formato", "status"]
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nResumo: {downloaded} baixados de {len(BOOKS)}.")
    print(f"CSV salvo em: {METADATA_PATH}")
    print(f"Arquivos salvos em: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()