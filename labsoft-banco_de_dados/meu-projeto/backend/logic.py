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
def list_assinaturas():
    session = SessionLocal()
    try:
        assinaturas = session.query(models.Assinatura).all()
        return [
            {
                "id": assinatura.id_assinatura,
                "email": assinatura.email,
                "subscription_type_id": assinatura.id_tipo_assinatura,
            }
            for assinatura in assinaturas
        ]
    finally:
        session.close()
def list_usuarios():
    session = SessionLocal()
    try:
        usuarios = session.query(models.Usuario).all()
        return [
            {
                "id": usuario.id_usuario,
                "name": usuario.nome,
                "subscription_id": usuario.id_assinatura,
                "age": usuario.idade,
            }
            for usuario in usuarios
        ]
    finally:
        session.close()
def list_livros():
    session = SessionLocal()
    try:
        livros = session.query(models.Livro).all()
        return [
            {
                "id": livro.id_livro,
                "capa": livro.capa,
                "author": livro.autor,
                "publication_ano": livro.ano_de_publicacao,
                "genero": livro.genero,
                "pais": livro.pais,
                "sinopse": livro.sinopse,
                "lingua": livro.linguagem,
            }
            for livro in livros
        ]
    finally:
        session.close()
def list_avaliacoes():
    session = SessionLocal()
    try:
        avaliacoes = session.query(models.Avaliacao).all()
        return [
            {
                "id": avaliacao.id_avaliacao,
                "user_id": avaliacao.id_usuario,
                "book_id": avaliacao.id_livro,
                "rating": avaliacao.estrelas,
                "comment": avaliacao.comentario,
            }
            for avaliacao in avaliacoes
        ]
    finally:
        session.close()

def list_livro_usuario():
    session = SessionLocal()
    try:
        livro_usuario = session.query(models.LivroUsuario).all()
        return [
            {
                "id": item.id_livro_usuario,
                "book_id": item.id_livro,
                "user_id": item.id_usuario,
                "lido": item.lido,
                "baixado": item.baixado,
                "data_lido": item.data_lido,
                "data_baixado": item.data_baixado,
                "lendo": item.lendo,
                "pagina_lendo": item.pagina_lendo,
                "data_favoritado": item.data_favoritado,
                "favoritado": item.favoritado,
                "visualizado": item.visualizado,
                "data_visualizado": item.data_visualizado,
            }
            for item in livro_usuario
        ]
    finally:
        session.close()