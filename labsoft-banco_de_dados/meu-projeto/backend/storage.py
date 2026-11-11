from pathlib import Path
#Configs do client
import boto3
import os
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

r2 = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT_URL"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
    region_name="auto",
    config=Config(signature_version="s3v4"),
)

#def book_path(id_livro: int) -> Path:
 #   return STORAGE_DIR / "livros" / f"{id_livro}.pdf"

def gerar_url_book(client, bucket: str, id_livro: int, titulo: str) -> str:
    return client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": bucket,
            "Key": f"livros/{id_livro}.pdf",
            "ResponseContentType": "application/pdf",
            "ResponseContentDisposition": (
                f'inline; filename="{titulo}.pdf"'
            ),
        },
        ExpiresIn=300,
    )

def gerar_url_book_download(client, bucket: str, id_livro: int, titulo: str) -> str:
    return client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": bucket,
            "Key": f"livros/{id_livro}.pdf",
            "ResponseContentType": "application/pdf",
            "ResponseContentDisposition": (
                f'attachment; filename="{titulo}.pdf"'
            ),
        },
        ExpiresIn=300,
    )

def gerar_url_cover(client, bucket: str, id_livro: int, titulo: str) -> str:
    return client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": bucket,
            "Key": f"capas/{id_livro}.jpg",
            "ResponseContentType": "image/jpeg",
            "ResponseContentDisposition": (
                f'inline; filename="{titulo}.jpg"'
            ),
        },
        ExpiresIn=300,
    )
