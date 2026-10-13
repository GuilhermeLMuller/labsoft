from database import SessionLocal
import models


def list_subscription_types():
    session = SessionLocal()
    try:
        plans = (
            session.query(models.TipoAssinatura)
            .order_by(models.TipoAssinatura.id_tipo_assinatura)
            .all()
        )
        return [
            {
                "id": plan.id_tipo_assinatura,
                "name": plan.nome,
                "price": plan.valor,
                "max_users": plan.maximo_acessos,
            }
            for plan in plans
        ]
    finally:
        session.close()


def register_account(new_account):
    session = SessionLocal()
    try:
        nome = new_account.get("name")
        email = new_account.get("email")
        password = new_account.get("password")
        subscription_type_id = new_account.get("subscription_type_id")

        if not nome or not email or not password or not subscription_type_id:
            raise ValueError("Nome, e-mail e senha são obrigatórios.")

        existing_account = (
            session.query(models.Assinatura)
            .filter(models.Assinatura.email == email)
            .first()
        )
        if existing_account:
            raise ValueError("E-mail já cadastrado.")

        plan = (
            session.query(models.TipoAssinatura)
            .filter(
                models.TipoAssinatura.id_tipo_assinatura == subscription_type_id
            )
            .first()
        )
        if not plan:
            raise ValueError("O plano selecionado não existe.")

        assinatura = models.Assinatura(
            id_tipo_assinatura=plan.id_tipo_assinatura,
            email=email,
            senha_hash=password,
        )
        session.add(assinatura)
        session.flush()

        usuario = models.Usuario(
            id_assinatura=assinatura.id_assinatura,
            nome=nome,
            tipo="leitor",
        )
        session.add(usuario)
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

        assinatura = (
            session.query(models.Assinatura)
            .filter(models.Assinatura.email == email)
            .first()
        )
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

## usuario ##
from models import SessionLocal, Usuario, Assinatura

def create_user(new_user):
    session = SessionLocal()
    try:
        id_assinatura = new_user.get("id_assinatura")
        nome = new_user.get("nome")
        tipo_usuario = new_user.get("tipo_usuario")
        idade = new_user.get("idade")
        gostos = new_user.get("gostos", [])
        estatisticas = new_user.get("estatisticas", {})

        if not id_assinatura or not nome or not tipo_usuario or idade is None:
            raise ValueError("Faltam dados obrigatorios")

        assinatura = session.get(assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        usuario = Usuario(
            id_assinatura=id_assinatura,
            nome=nome,
            tipo=tipo_usuario,
            idade=idade,
            gostos=gostos,
            estatisticas=estatisticas,
        )
        session.add(usuario)
        session.commit()
        session.refresh(usuario)

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


def replace_user(user):
    session = SessionLocal()
    try:
        id_usuario = user.get("id_usuario")
        id_assinatura = user.get("id_assinatura")
        nome = user.get("nome")
        tipo_usuario = user.get("tipo_usuario") or user.get("tipo")
        idade = user.get("idade")
        gostos = new_user.get("gostos", [])
        estatisticas = new_user.get("estatisticas", {})

        if not id_usuario or not id_assinatura or not nome or not tipo_usuario or idade is None:
            raise ValueError("Faltam dados obrigatorios")

        usuario = session.get(Usuario, id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        assinatura = session.get(assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        usuario.id_assinatura = id_assinatura
        usuario.nome = nome
        usuario.tipo = tipo_usuario
        usuario.idade = idade
        usuario.gostos = user.get("gostos", [])
        usuario.estatisticas = user.get("estatisticas", {})

        session.commit()
        return {"message": "Usuário atualizado por completo com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_user_name(user_data):
    session = SessionLocal()
    try:
        id_usuario = user_data.get("id_usuario") or user_data.get("id")
        novo_nome = user_data.get("nome") or user_data.get("novo_nome")

        if not id_usuario or not novo_nome:
            raise ValueError("Faltam dados obrigatorios")

        usuario = session.get(Usuario, id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        usuario.nome = novo_nome
        session.commit()
        return {"message": "Nome do usuário atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_user_tipo(user_data):
    session = SessionLocal()
    try:
        id_usuario = user_data.get("id_usuario") or user_data.get("id")
        novo_tipo = (
            user_data.get("tipo_usuario")
            or user_data.get("tipo")
            or user_data.get("novo_tipo")
        )

        if not id_usuario or not novo_tipo:
            raise ValueError("Faltam dados obrigatorios")

        usuario = session.get(Usuario, id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        usuario.tipo = novo_tipo
        session.commit()
        return {"message": "Tipo do usuário atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_user_idade(user_data):
    session = SessionLocal()
    try:
        id_usuario = user_data.get("id_usuario") or user_data.get("id")
        nova_idade = user_data.get("idade")
        if nova_idade is None:
            nova_idade = user_data.get("nova_idade")

        if not id_usuario or nova_idade is None:
            raise ValueError("Faltam dados obrigatorios")

        if not (0 <= nova_idade <= 120):
            raise ValueError("Idade deve estar entre 0 e 120")

        usuario = session.get(Usuario, id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        usuario.idade = nova_idade
        session.commit()
        return {"message": "Idade do usuário atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def delete_user(user_data):
    session = SessionLocal()
    try:
        id_usuario = user_data.get("id_usuario")
        if not id_usuario:
            raise ValueError("Faltam dados obrigatorios")

        usuario = session.get(Usuario, id_usuario)
        if not usuario:
            raise ValueError("Usuário não encontrado")

        session.delete(usuario)
        session.commit()
        return {"message": "Usuário removido com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

## livros ##
def create_book(new_book):
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
def replace_book(book):
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_autor()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_ano()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_pais()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_linguagem()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_sinopse()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_capa()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_book_idade()
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def delete_book(book):
    session = SessionLocal()
    try:

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
