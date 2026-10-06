from database import SessionLocal
import models


def register_account(new_account):
    session = SessionLocal()
    try:
        assinatura = models.Assinatura(
            #nome=new_account.get("name"),
            email=new_account.get("email"),
            email_assinante=new_account.get("email"),
            senha_hash=new_account.get("password"),
        )
        nome = new_account.get("name")

        if not nome or not assinatura.email or not assinatura.senha_hash:
            raise ValueError("Nome, e-mail e senha são obrigatórios.")

        existing_account = session.query(models.Assinatura).filter(models.Assinatura.email == assinatura.email).first()
        if existing_account:
            raise ValueError("E-mail já cadastrado.")

        session.add(assinatura)
        session.commit()
        session.refresh(assinatura)

        return {
            "message": "Conta criada com sucesso",
            "assinatura": {
                "id": assinatura.id_assinatura,
                "name": nome,
                "email": assinatura.email,
            },
        }
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def login_account(login_data):
    session = SessionLocal()
    try:
        email = login_data.get("email")
        password = login_data.get("password")

        if not email or not password:
            raise ValueError("E-mail e senha são obrigatórios.")

        assinatura = session.query(models.Assinatura).filter(models.Assinatura.email == email).first()
        if not assinatura or assinatura.senha_hash != password:
            raise ValueError("E-mail ou senha inválidos.")

        return {
            "message": "Login realizado com sucesso",
            "user": {
                "id": assinatura.id_assinatura,
                "email": assinatura.email,
            },
        }
    finally:
        session.close()