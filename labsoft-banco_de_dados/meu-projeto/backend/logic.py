from database import SessionLocal
import models


def register_user(new_user):
    session = SessionLocal()
    try:
        user = models.User(
            nome=new_user.get("name"),
            email=new_user.get("email"),
            senha_hash=new_user.get("password"),
        )

        if not user.nome or not user.email or not user.senha_hash:
            raise ValueError("Nome, e-mail e senha são obrigatórios.")

        existing_user = session.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise ValueError("E-mail já cadastrado.")

        session.add(user)
        session.commit()
        session.refresh(user)

        return {
            "message": "Conta criada com sucesso",
            "user": {
                "id": user.id,
                "name": user.nome,
                "email": user.email,
            },
        }
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def login_user(login_data):
    session = SessionLocal()
    try:
        email = login_data.get("email")
        password = login_data.get("password")

        if not email or not password:
            raise ValueError("E-mail e senha são obrigatórios.")

        user = session.query(models.User).filter(models.User.email == email).first()
        if not user or user.senha_hash != password:
            raise ValueError("E-mail ou senha inválidos.")

        return {
            "message": "Login realizado com sucesso",
            "user": {
                "id": user.id,
                "name": user.nome,
                "email": user.email,
            },
        }
    finally:
        session.close()