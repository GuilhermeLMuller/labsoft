CREATE TYPE tipo_usuario AS ENUM ('administrador', 'autor', 'leitor');

CREATE TABLE tipo_assinatura (
    id_tipo_assinatura INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0)
);

CREATE TABLE assinatura (
    id_assinatura INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    senha_hash TEXT NOT NULL,
    email_assinante VARCHAR(254) NOT NULL,
    tipo VARCHAR(50) NOT NULL REFERENCES tipo_assinatura (tipo),
    quantidade_de_usuarios INTEGER NOT NULL CHECK (quantidade_de_usuarios > 0)
);

CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    tipo tipo_usuario NOT NULL,
    id_assinatura INTEGER NOT NULL REFERENCES assinatura (id_assinatura),
    gostos TEXT[],
    favoritos TEXT[],
    idade SMALLINT CHECK (idade BETWEEN 0 AND 120),
    estatisticas JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE livros (
    id_livro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    autor VARCHAR(150) NOT NULL,
    ano_de_publicacao SMALLINT CHECK (ano_de_publicacao >= 0),
    pais VARCHAR(100),
    linguagem VARCHAR(100),
    sinopse TEXT,
    capa TEXT,
    descricao TEXT,
    genero VARCHAR(100),
    restricao_de_idade SMALLINT CHECK (restricao_de_idade >= 0)
);

CREATE TABLE avaliacao (
    id_avaliacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario (id_usuario),
    id_livro INTEGER NOT NULL REFERENCES livros (id_livro),
    comentario TEXT,
    estrelas SMALLINT NOT NULL CHECK (estrelas BETWEEN 1 AND 5)
);

CREATE TABLE livro_usuario (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario (id_usuario),
    id_livro INTEGER NOT NULL REFERENCES livros (id_livro),
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    baixado BOOLEAN NOT NULL DEFAULT FALSE,
    data_lido DATE,
    data_baixado DATE,
    lendo BOOLEAN NOT NULL DEFAULT FALSE,
    pagina_lendo INTEGER CHECK (pagina_lendo >= 0),
    data_favoritado DATE,
    favoritado BOOLEAN NOT NULL DEFAULT FALSE,
    visualizado BOOLEAN NOT NULL DEFAULT FALSE,
    data_visualizado DATE,
    UNIQUE (id_usuario, id_livro)
);
