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

## usuario ##

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

        usuario = models.Usuario(
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
        gostos = user.get("gostos", [])
        estatisticas = user.get("estatisticas", {})

        if not id_usuario or not id_assinatura or not nome or not tipo_usuario or idade is None:
            raise ValueError("Faltam dados obrigatorios")

        usuario = session.get(models.Usuario, id_usuario)
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

        usuario = session.get(models.Usuario, id_usuario)
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

        usuario = session.get(models.Usuario, id_usuario)
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

        usuario = session.get(models.Usuario, id_usuario)
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

        usuario = session.get(models.Usuario, id_usuario)
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
        autor = new_book.get("autor")
        ano_de_publicacao = new_book.get("ano_de_publicacao")
        pais = new_book.get("pais")
        linguagem = new_book.get("linguagem")
        sinopse = new_book.get("sinopse")
        titulo = new_book.get("titulo")
        genero = new_book.get("genero")
        restricao_de_idade = new_book.get("restricao_de_idade")

        # Apenas 'autor' tem NOT NULL no SQL, mas 'titulo' costuma ser essencial.
        if not autor:
            raise ValueError("Faltam dados obrigatórios (autor)")

        if ano_de_publicacao is not None and ano_de_publicacao < 0:
            raise ValueError("Ano de publicação não pode ser negativo")
            
        if restricao_de_idade is not None and restricao_de_idade < 0:
            raise ValueError("Restrição de idade não pode ser negativa")

        livro = models.Livro(
            autor=autor,
            ano_de_publicacao=ano_de_publicacao,
            pais=pais,
            linguagem=linguagem,
            sinopse=sinopse,
            titulo=titulo,
            genero=genero,
            restricao_de_idade=restricao_de_idade,
        )
        session.add(livro)
        session.commit()
        session.refresh(livro)

        return {
            "message": "Livro criado com sucesso",
            "livro": {
                "id_livro": livro.id_livro,
                "titulo": livro.titulo,
                "autor": livro.autor
            },
        }
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def replace_book(book):
    session = SessionLocal()
    try:
        id_livro = book.get("id_livro") or book.get("id")
        autor = book.get("autor")
        ano_de_publicacao = book.get("ano_de_publicacao")
        restricao_de_idade = book.get("restricao_de_idade")

        if not id_livro or not autor:
            raise ValueError("Faltam dados obrigatórios (id_livro, autor)")

        if ano_de_publicacao is not None and ano_de_publicacao < 0:
            raise ValueError("Ano de publicação não pode ser negativo")
            
        if restricao_de_idade is not None and restricao_de_idade < 0:
            raise ValueError("Restrição de idade não pode ser negativa")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.autor = autor
        livro.ano_de_publicacao = ano_de_publicacao
        livro.pais = book.get("pais")
        livro.linguagem = book.get("linguagem")
        livro.sinopse = book.get("sinopse")
        livro.titulo = book.get("titulo")
        livro.genero = book.get("genero")
        livro.restricao_de_idade = restricao_de_idade

        session.commit()
        return {"message": "Livro atualizado por completo com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_autor(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        novo_autor = book_data.get("autor") or book_data.get("novo_autor")

        if not id_livro or not novo_autor:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.autor = novo_autor
        session.commit()
        return {"message": "Autor do livro atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_ano(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        novo_ano = book_data.get("ano_de_publicacao") or book_data.get("ano")

        if not id_livro or novo_ano is None:
            raise ValueError("Faltam dados obrigatórios")

        if novo_ano < 0:
            raise ValueError("Ano de publicação não pode ser negativo")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.ano_de_publicacao = novo_ano
        session.commit()
        return {"message": "Ano de publicação atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_pais(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        novo_pais = book_data.get("pais")

        if not id_livro or not novo_pais:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.pais = novo_pais
        session.commit()
        return {"message": "País do livro atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_linguagem(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        nova_linguagem = book_data.get("linguagem")

        if not id_livro or not nova_linguagem:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.linguagem = nova_linguagem
        session.commit()
        return {"message": "Linguagem do livro atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_sinopse(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        nova_sinopse = book_data.get("sinopse")

        if not id_livro or not nova_sinopse:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.sinopse = nova_sinopse
        session.commit()
        return {"message": "Sinopse do livro atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_capa(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        nova_capa = book_data.get("capa")

        if not id_livro or not nova_capa:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.capa = nova_capa
        session.commit()
        return {"message": "Capa do livro atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_idade(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        nova_idade = book_data.get("restricao_de_idade") or book_data.get("idade")

        if not id_livro or nova_idade is None:
            raise ValueError("Faltam dados obrigatórios")
            
        if nova_idade < 0:
            raise ValueError("Restrição de idade não pode ser negativa")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.restricao_de_idade = nova_idade
        session.commit()
        return {"message": "Restrição de idade do livro atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_titulo(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        novo_titulo = book_data.get("titulo")

        if not id_livro or not novo_titulo:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.titulo = novo_titulo
        session.commit()
        return {"message": "Título do livro atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_book_genero(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        novo_genero = book_data.get("genero")

        if not id_livro or not novo_genero:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        livro.genero = novo_genero
        session.commit()
        return {"message": "Gênero do livro atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def delete_book(book_data):
    session = SessionLocal()
    try:
        id_livro = book_data.get("id_livro") or book_data.get("id")
        
        if not id_livro:
            raise ValueError("Faltam dados obrigatórios")

        livro = session.get(models.Livro, id_livro)
        if not livro:
            raise ValueError("Livro não encontrado")

        session.delete(livro)
        session.commit()
        return {"message": "Livro removido com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


## assinatura ##
from models import Assinatura

def create_assinatura(new_assinatura):
    session = SessionLocal()
    try:
        id_tipo_assinatura = new_assinatura.get("id_tipo_assinatura")
        email = new_assinatura.get("email")
        senha_hash = new_assinatura.get("senha_hash")

        if not id_tipo_assinatura or not email or not senha_hash:
            raise ValueError("Faltam dados obrigatórios")

        # Verifica se o e-mail já existe
        if session.query(Assinatura).filter(Assinatura.email == email).first():
            raise ValueError("E-mail já cadastrado")

        assinatura = Assinatura(
            id_tipo_assinatura=id_tipo_assinatura,
            email=email,
            senha_hash=senha_hash,
        )
        session.add(assinatura)
        session.commit()
        session.refresh(assinatura)

        return {
            "message": "Assinatura criada com sucesso",
            "assinatura": {
                "id_assinatura": assinatura.id_assinatura,
                "email": assinatura.email,
            },
        }
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def replace_assinatura(assinatura_data):
    session = SessionLocal()
    try:
        id_assinatura = assinatura_data.get("id_assinatura") or assinatura_data.get("id")
        id_tipo_assinatura = assinatura_data.get("id_tipo_assinatura")
        email = assinatura_data.get("email")
        senha_hash = assinatura_data.get("senha_hash")

        if not id_assinatura or not id_tipo_assinatura or not email or not senha_hash:
            raise ValueError("Faltam dados obrigatórios")

        assinatura = session.get(Assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        assinatura.id_tipo_assinatura = id_tipo_assinatura
        assinatura.email = email
        assinatura.senha_hash = senha_hash

        session.commit()
        return {"message": "Assinatura atualizada por completo com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_assinatura_tipo(assinatura_data):
    session = SessionLocal()
    try:
        id_assinatura = assinatura_data.get("id_assinatura") or assinatura_data.get("id")
        novo_id_tipo = assinatura_data.get("id_tipo_assinatura")

        if not id_assinatura or not novo_id_tipo:
            raise ValueError("Faltam dados obrigatórios")

        assinatura = session.get(Assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        assinatura.id_tipo_assinatura = novo_id_tipo
        session.commit()
        return {"message": "Tipo de assinatura atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_assinatura_email(assinatura_data):
    session = SessionLocal()
    try:
        id_assinatura = assinatura_data.get("id_assinatura") or assinatura_data.get("id")
        novo_email = assinatura_data.get("email")

        if not id_assinatura or not novo_email:
            raise ValueError("Faltam dados obrigatórios")

        assinatura = session.get(Assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        # Verifica unicidade do novo e-mail (garante que não seja de outra pessoa)
        email_existente = session.query(Assinatura).filter(Assinatura.email == novo_email).first()
        if email_existente and email_existente.id_assinatura != id_assinatura:
            raise ValueError("E-mail já está em uso por outra conta")

        assinatura.email = novo_email
        session.commit()
        return {"message": "E-mail da assinatura atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_assinatura_senha(assinatura_data):
    session = SessionLocal()
    try:
        id_assinatura = assinatura_data.get("id_assinatura") or assinatura_data.get("id")
        nova_senha_hash = assinatura_data.get("senha_hash")

        if not id_assinatura or not nova_senha_hash:
            raise ValueError("Faltam dados obrigatórios")

        assinatura = session.get(Assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        assinatura.senha_hash = nova_senha_hash
        session.commit()
        return {"message": "Senha atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def delete_assinatura(assinatura_data):
    session = SessionLocal()
    try:
        id_assinatura = assinatura_data.get("id_assinatura") or assinatura_data.get("id")
        if not id_assinatura:
            raise ValueError("Faltam dados obrigatórios")

        assinatura = session.get(Assinatura, id_assinatura)
        if not assinatura:
            raise ValueError("Assinatura não encontrada")

        session.delete(assinatura)
        session.commit()
        return {"message": "Assinatura removida com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


## avaliação
from models import Avaliacao

def create_avaliacao(new_avaliacao):
    session = SessionLocal()
    try:
        id_usuario = new_avaliacao.get("id_usuario")
        id_livro = new_avaliacao.get("id_livro")
        comentario = new_avaliacao.get("comentario")
        estrelas = new_avaliacao.get("estrelas")

        if not id_usuario or not id_livro or estrelas is None:
            raise ValueError("Faltam dados obrigatórios (id_usuario, id_livro, estrelas)")

        if not (1 <= estrelas <= 5):
            raise ValueError("A avaliação deve ser entre 1 e 5 estrelas")

        avaliacao = Avaliacao(
            id_usuario=id_usuario,
            id_livro=id_livro,
            comentario=comentario,
            estrelas=estrelas,
        )
        session.add(avaliacao)
        session.commit()
        session.refresh(avaliacao)

        return {
            "message": "Avaliação criada com sucesso",
            "avaliacao": {
                "id_avaliacao": avaliacao.id_avaliacao,
                "id_livro": avaliacao.id_livro,
                "estrelas": avaliacao.estrelas,
            },
        }
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def replace_avaliacao(avaliacao_data):
    session = SessionLocal()
    try:
        id_avaliacao = avaliacao_data.get("id_avaliacao") or avaliacao_data.get("id")
        id_usuario = avaliacao_data.get("id_usuario")
        id_livro = avaliacao_data.get("id_livro")
        comentario = avaliacao_data.get("comentario")
        estrelas = avaliacao_data.get("estrelas")

        if not id_avaliacao or not id_usuario or not id_livro or estrelas is None:
            raise ValueError("Faltam dados obrigatórios")

        if not (1 <= estrelas <= 5):
            raise ValueError("A avaliação deve ser entre 1 e 5 estrelas")

        avaliacao = session.get(Avaliacao, id_avaliacao)
        if not avaliacao:
            raise ValueError("Avaliação não encontrada")

        avaliacao.id_usuario = id_usuario
        avaliacao.id_livro = id_livro
        avaliacao.comentario = comentario
        avaliacao.estrelas = estrelas

        session.commit()
        return {"message": "Avaliação atualizada por completo com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_avaliacao_comentario(avaliacao_data):
    session = SessionLocal()
    try:
        id_avaliacao = avaliacao_data.get("id_avaliacao") or avaliacao_data.get("id")
        novo_comentario = avaliacao_data.get("comentario")

        if not id_avaliacao:
            raise ValueError("Faltam dados obrigatórios (id_avaliacao)")

        # Comentário pode ser None ou vazio, então não bloqueamos se for vazio, 
        # a menos que essa seja a regra de negócio.

        avaliacao = session.get(Avaliacao, id_avaliacao)
        if not avaliacao:
            raise ValueError("Avaliação não encontrada")

        avaliacao.comentario = novo_comentario
        session.commit()
        return {"message": "Comentário da avaliação atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_avaliacao_estrelas(avaliacao_data):
    session = SessionLocal()
    try:
        id_avaliacao = avaliacao_data.get("id_avaliacao") or avaliacao_data.get("id")
        novas_estrelas = avaliacao_data.get("estrelas")

        if not id_avaliacao or novas_estrelas is None:
            raise ValueError("Faltam dados obrigatórios")

        if not (1 <= novas_estrelas <= 5):
            raise ValueError("A avaliação deve ser entre 1 e 5 estrelas")

        avaliacao = session.get(Avaliacao, id_avaliacao)
        if not avaliacao:
            raise ValueError("Avaliação não encontrada")

        avaliacao.estrelas = novas_estrelas
        session.commit()
        return {"message": "Estrelas da avaliação atualizadas com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def delete_avaliacao(avaliacao_data):
    session = SessionLocal()
    try:
        id_avaliacao = avaliacao_data.get("id_avaliacao") or avaliacao_data.get("id")
        
        if not id_avaliacao:
            raise ValueError("Faltam dados obrigatórios")

        avaliacao = session.get(Avaliacao, id_avaliacao)
        if not avaliacao:
            raise ValueError("Avaliação não encontrada")

        session.delete(avaliacao)
        session.commit()
        return {"message": "Avaliação removida com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


## livrousuário ##
from datetime import date
from models import LivroUsuario

def create_livro_usuario(new_livro_usuario):
    session = SessionLocal()
    try:
        if not new_livro_usuario.get("id_usuario") or not new_livro_usuario.get("id_livro"):
            raise ValueError("Faltam dados obrigatórios (id_usuario, id_livro)")

        # Configura a data de visualização
        new_livro_usuario["data_visualizado"] = date.today()

        # Injeta as datas automaticamente se o booleano vier como True
        for campo in ["lido", "baixado", "favoritado"]:
            if new_livro_usuario.get(campo):
                new_livro_usuario[f"data_{campo}"] = date.today()

        # O modelo assumirá os defaults para o que não for passado
        livro_usuario = LivroUsuario(**new_livro_usuario)
        
        session.add(livro_usuario)
        session.commit()
        session.refresh(livro_usuario)

        return {
            "message": "Registro de livro do usuário criado com sucesso",
            "livro_usuario": {
                "id_livro_usuario": livro_usuario.id_livro_usuario,
                "id_usuario": livro_usuario.id_usuario,
                "id_livro": livro_usuario.id_livro,
            },
        }
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def replace_livro_usuario(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.pop("id_livro_usuario", None) or livro_usuario_data.pop("id", None)
        
        if not id_livro_usuario or not livro_usuario_data.get("id_usuario") or not livro_usuario_data.get("id_livro"):
            raise ValueError("Faltam dados obrigatórios")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro de livro do usuário não encontrado")

        # Atualiza a data de visualização no replace
        livro_usuario_data["data_visualizado"] = date.today()
        
        # Atualiza as datas dos pares caso tenham sido alteradas
        for campo in ["lido", "baixado", "favoritado"]:
            if campo in livro_usuario_data:
                livro_usuario_data[f"data_{campo}"] = date.today() if livro_usuario_data[campo] else None

        # Aplica todos os dados do dicionário no objeto
        for key, value in livro_usuario_data.items():
            setattr(livro_usuario, key, value)

        session.commit()
        return {"message": "Registro atualizado por completo com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def update_livro_usuario_lido(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.get("id_livro_usuario") or livro_usuario_data.get("id")
        lido = livro_usuario_data.get("lido")

        if not id_livro_usuario or lido is None:
            raise ValueError("Faltam dados obrigatórios (id_livro_usuario, lido)")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro não encontrado")

        livro_usuario.lido = lido
        livro_usuario.data_lido = date.today() if lido else None

        session.commit()
        return {"message": "Status de leitura atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_livro_usuario_baixado(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.get("id_livro_usuario") or livro_usuario_data.get("id")
        baixado = livro_usuario_data.get("baixado")

        if not id_livro_usuario or baixado is None:
            raise ValueError("Faltam dados obrigatórios (id_livro_usuario, baixado)")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro não encontrado")

        livro_usuario.baixado = baixado
        livro_usuario.data_baixado = date.today() if baixado else None

        session.commit()
        return {"message": "Status de download atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_livro_usuario_favoritado(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.get("id_livro_usuario") or livro_usuario_data.get("id")
        favoritado = livro_usuario_data.get("favoritado")

        if not id_livro_usuario or favoritado is None:
            raise ValueError("Faltam dados obrigatórios (id_livro_usuario, favoritado)")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro não encontrado")

        livro_usuario.favoritado = favoritado
        livro_usuario.data_favoritado = date.today() if favoritado else None

        session.commit()
        return {"message": "Status de favorito atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_livro_usuario_lendo(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.get("id_livro_usuario") or livro_usuario_data.get("id")
        lendo = livro_usuario_data.get("lendo")

        if not id_livro_usuario or lendo is None:
            raise ValueError("Faltam dados obrigatórios (id_livro_usuario, lendo)")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro não encontrado")

        livro_usuario.lendo = lendo
        session.commit()
        return {"message": "Status 'lendo' atualizado com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def update_livro_usuario_pagina(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.get("id_livro_usuario") or livro_usuario_data.get("id")
        pagina_lendo = livro_usuario_data.get("pagina_lendo")

        if not id_livro_usuario or pagina_lendo is None:
            raise ValueError("Faltam dados obrigatórios (id_livro_usuario, pagina_lendo)")

        if pagina_lendo < 0:
            raise ValueError("A página não pode ser negativa")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro não encontrado")

        livro_usuario.pagina_lendo = pagina_lendo
        session.commit()
        return {"message": "Página atual de leitura atualizada com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def delete_livro_usuario(livro_usuario_data):
    session = SessionLocal()
    try:
        id_livro_usuario = livro_usuario_data.get("id_livro_usuario") or livro_usuario_data.get("id")
        
        if not id_livro_usuario:
            raise ValueError("Faltam dados obrigatórios")

        livro_usuario = session.get(LivroUsuario, id_livro_usuario)
        if not livro_usuario:
            raise ValueError("Registro não encontrado")

        session.delete(livro_usuario)
        session.commit()
        return {"message": "Registro removido com sucesso"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()