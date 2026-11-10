# Como executar o projeto

O projeto usa um frontend React/Vite, um backend FastAPI e um banco PostgreSQL remoto. O Docker Compose inicia o frontend e o backend; não é necessário instalar PostgreSQL localmente.

## Pré-requisitos

- Docker com Docker Compose instalado e em execução.

### Instalar o Docker

Se você ainda não tiver o Docker instalado:

- **Windows ou macOS:** baixe e instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Linux:** siga as [instruções oficiais de instalação](https://docs.docker.com/engine/install/) para sua distribuição e instale também o [Docker Compose](https://docs.docker.com/compose/install/linux/).

Após a instalação, inicie o Docker Desktop ou o serviço Docker, conforme seu sistema. Para conferir a instalação, execute no terminal:

```bash
docker --version
docker compose version
```

## Iniciar com Docker

Na raiz do repositório, execute:

```bash
docker compose up --build
```

Na primeira execução, o Docker precisa baixar imagens e dependências. Quando os serviços estiverem prontos, acesse:

- Aplicação: http://localhost:8443
- Documentação da API: http://localhost:8000/docs

Para parar, pressione `Ctrl+C`. Para remover os contêineres criados pelo Compose, execute:

```bash
docker compose down
```