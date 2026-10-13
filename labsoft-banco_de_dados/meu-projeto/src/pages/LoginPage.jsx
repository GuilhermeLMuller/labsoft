import { useState } from "react";
import { loginUser } from "../api/auth";

// Tela de login para quem já tem conta.
export default function LoginPage({ onSuccess, onBack }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Chamada à API de login (ainda não implementada no back-end).
      const data = await loginUser(form);

      // TODO: guardar o token/sessão retornado pelo back-end
      // (ex.: localStorage, cookie httpOnly ou contexto global de autenticação).
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="card">
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} required />

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password"
          value={form.password} onChange={handleChange} required />

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <button type="button" className="btn-link" onClick={onBack}>Voltar</button>
    </main>
  );
}
