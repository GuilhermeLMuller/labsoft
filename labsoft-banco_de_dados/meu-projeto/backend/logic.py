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
        gostos = user.get("gostos", [])
        estatisticas = user.get("estatisticas", {})

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

        livro = Livro(
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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

        livro = session.get(Livro, id_livro)
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