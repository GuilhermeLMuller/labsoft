// Tela inicial: o usuário escolhe entre criar uma conta ou entrar.
export default function WelcomePage({ onCreateAccount, onLogin }) {
  return (
    <main className="card">
      <h1>Bem-vindo</h1>
      <p className="subtitle">Crie uma conta ou entre para continuar.</p>

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onCreateAccount}>
          Criar conta
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLogin}>
          Entrar
        </button>
      </div>
    </main>
  );
}
