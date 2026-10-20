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

def list_assinaturas(email = None, id_tipo_assinatura = None, offset: int = 0, limit: int = 20):
    session = SessionLocal()
    try:
        assinaturas = session.query(models.Assinatura)
        if email:
            assinaturas = assinaturas.filter(models.Assinatura.email.ilike(f"%{email}%"))
        if id_tipo_assinatura is not None:
            assinaturas = assinaturas.filter(models.Assinatura.id_tipo_assinatura == id_tipo_assinatura)
        total = assinaturas.count()
        assinaturas = (
            assinaturas.order_by(models.Assinatura.id_assinatura)
            .offset(offset)
            .limit(limit)
            .all()
        )
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
def list_usuarios(nome = None, tipo = None, idade = None, offset: int = 0, limit: int = 20):
    session = SessionLocal()
    try:
        usuarios = session.query(models.Usuario)
        if nome:
            usuarios = usuarios.filter(models.Usuario.nome.ilike(f"%{nome}%"))
        if tipo:
            usuarios = usuarios.filter(models.Usuario.tipo.ilike(f"%{tipo}%"))
        if idade is not None:
            usuarios = usuarios.filter(models.Usuario.idade == idade)
        total = usuarios.count()
        usuarios = (
            usuarios.order_by(models.Usuario.id_usuario)
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            {
                "id": usuario.id_usuario,
                "name": usuario.nome,
                "subscription_id": usuario.id_assinatura,
                "age": usuario.idade,
                "type": usuario.tipo,
                "tastes": usuario.gostos,
            }
            for usuario in usuarios
        ]
    finally:
        session.close()
def list_livros(genero = None, autor = None, pais = None, linguagem = None, titulo = None, ano_publicacao = None, offset: int = 0, limit: int = 20):
    session = SessionLocal()
    try:
        livros = session.query(models.Livro)
        if genero:
            livros = livros.filter(models.Livro.genero.ilike(f"%{genero}%"))
        if autor:
            livros = livros.filter(models.Livro.autor.ilike(f"%{autor}%"))
        if pais:
            livros = livros.filter(models.Livro.pais.ilike(f"%{pais}%"))
        if linguagem:
            livros = livros.filter(models.Livro.linguagem.ilike(f"%{linguagem}%"))
        if titulo:
            livros = livros.filter(models.Livro.titulo.ilike(f"%{titulo}%"))
        if ano_publicacao:
            livros = livros.filter(models.Livro.ano_de_publicacao.ilike(f"%{ano_publicacao}%"))
        total = livros.count()
        livros = (
            livros.order_by(models.Livro.id_livro)
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            {
                "id": livro.id_livro,
                "titulo": livro.titulo,
                "autor": livro.autor,
                "ano_de_publicação": livro.ano_de_publicacao,
                "genero": livro.genero,
                "pais": livro.pais,
                "sinopse": livro.sinopse,
                "lingua": livro.linguagem,
            }
            for livro in livros
        ]
    finally:
        session.close()
def list_avaliacoes(id_usuario = None, id_livro = None, estrelas = None, offset: int = 0, limit: int = 20):
    session = SessionLocal()
    try:
        avaliacoes = session.query(models.Avaliacao)
        if id_usuario:
            avaliacoes = avaliacoes.filter(models.Avaliacao.id_usuario == id_usuario)
        if id_livro:
            avaliacoes = avaliacoes.filter(models.Avaliacao.id_livro == id_livro)
        if estrelas is not None:
            avaliacoes = avaliacoes.filter(models.Avaliacao.estrelas == estrelas)
        total = avaliacoes.count()
        avaliacoes = (
            avaliacoes.order_by(models.Avaliacao.id_avaliacao)
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            {
                "id": avaliacao.id_avaliacao,
                "id_usuario": avaliacao.id_usuario,
                "id_livro": avaliacao.id_livro,
                "rating": avaliacao.estrelas,
                "comment": avaliacao.comentario,
            }
            for avaliacao in avaliacoes
        ]
    finally:
        session.close()

def list_livro_usuario(id_usuario=None, id_livro=None, offset: int = 0, limit: int = 20):
    session = SessionLocal()
    try:
        livro_usuario = session.query(models.LivroUsuario)
        if id_usuario:
            livro_usuario = livro_usuario.filter(models.LivroUsuario.id_usuario == id_usuario)
        if id_livro:
            livro_usuario = livro_usuario.filter(models.LivroUsuario.id_livro == id_livro)
        total = livro_usuario.count()
        livro_usuario = (
            livro_usuario.order_by(models.LivroUsuario.id_livro_usuario)
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            {
                "id": item.id_livro_usuario,
                "id_livro": item.id_livro,
                "id_usuario": item.id_usuario,
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