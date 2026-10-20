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


def list_assinaturas(email=None, id_tipo_assinatura=None, offset=0, limit=20):
    session = SessionLocal()
    try:
        query = session.query(models.Assinatura)
        if email:
            query = query.filter(models.Assinatura.email.ilike(f"%{email}%"))
        if id_tipo_assinatura is not None:
            query = query.filter(
                models.Assinatura.id_tipo_assinatura == id_tipo_assinatura
            )
        assinaturas = (
            query.order_by(models.Assinatura.id_assinatura)
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            {
                "id_assinatura": assinatura.id_assinatura,
                "email": assinatura.email,
                "id_tipo_assinatura": assinatura.id_tipo_assinatura,
            }
            for assinatura in assinaturas
        ]
    finally:
        session.close()


def list_livros(
    genero=None,
    autor=None,
    pais=None,
    linguagem=None,
    titulo=None,
    ano_publicacao=None,
    offset=0,
    limit=20,
):
    session = SessionLocal()
    try:
        query = session.query(models.Livro)
        for field, value in (
            ("genero", genero),
            ("autor", autor),
            ("pais", pais),
            ("linguagem", linguagem),
            ("titulo", titulo),
        ):
            if value:
                query = query.filter(getattr(models.Livro, field).ilike(f"%{value}%"))
        if ano_publicacao is not None:
            query = query.filter(
                models.Livro.ano_de_publicacao == ano_publicacao
            )
        livros = (
            query.order_by(models.Livro.id_livro)
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            {
                "id_livro": livro.id_livro,
                "titulo": livro.titulo,
                "autor": livro.autor,
                "ano_de_publicacao": livro.ano_de_publicacao,
                "pais": livro.pais,
                "linguagem": livro.linguagem,
                "sinopse": livro.sinopse,
                "capa": livro.capa,
                "genero": livro.genero,
                "restricao_de_idade": livro.restricao_de_idade,
            }
            for livro in livros
        ]
    finally:
        session.close()


def create_book(book_data):
    session = SessionLocal()
    try:
        livro = models.Livro(**book_data)
        session.add(livro)
        session.commit()
        session.refresh(livro)
        return {
            "id_livro": livro.id_livro,
            "titulo": livro.titulo,
            "autor": livro.autor,
            "ano_de_publicacao": livro.ano_de_publicacao,
            "pais": livro.pais,
            "linguagem": livro.linguagem,
            "sinopse": livro.sinopse,
            "capa": livro.capa,
            "genero": livro.genero,
            "restricao_de_idade": livro.restricao_de_idade,
        }
    except Exception:
        session.rollback()
        raise
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