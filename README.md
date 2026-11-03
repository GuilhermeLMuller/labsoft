Para rodar o projeto localmente:

-Rodar o backend: 
entre na pasta /labsoft/labsoft-banco_de_dados/meu-projeto
crie o ambiente virtual: python3 -m venv .venv
ative o ambiente virtual: source .venv/bin/activate
instale os requisitos: pip install -r requirements.txt
entre na pasta do backend: cd backend
inicie o backend: uvicorn routes:app --host 0.0.0.0 --port 8000 --reload

-Roda o frontend:
em outro terminal, entre na pasta: /labsoft/labsoft-banco_de_dados/meu-projeto
ative o ambiente virtual que foi criado anteriormente: source .venv/bin/activate
instale os pacotes necessários: npm install
inicie a execução do frontend: PORT=8443 npm run dev -- --host 0.0.0.0

acesse o site no seu computador: http://localhost:8443