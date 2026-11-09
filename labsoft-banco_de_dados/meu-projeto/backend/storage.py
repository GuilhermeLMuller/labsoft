import os
from pathlib import Path

import boto3
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
R2_BUCKET_NAME = os.environ["R2_BUCKET_NAME"]

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
class R2StorageError(Exception):
    pass


def upload_file_to_r2(file_obj, object_key: str, content_type: str) -> str:
    try:
        r2.upload_fileobj(
            file_obj,
            R2_BUCKET_NAME,
            object_key,
            ExtraArgs={"ContentType": content_type},
        )
    except Exception as exc:
        raise R2StorageError("Falha ao enviar arquivo para o armazenamento.") from exc
    return object_key