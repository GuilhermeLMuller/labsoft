import { useState } from "react";
import { registerUser } from "../api/auth";

// Tela de criação de conta.
export default function RegisterPage({ onSuccess, onBack }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Validação simples no front-end (o back-end deve validar de novo).
    if (form.password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // Chamada à API de registro (ainda não implementada no back-end).
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      onSuccess(); // TODO: decidir o fluxo após o cadastro (ir para login ou já logar).
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="card">
      <h1>Criar conta</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" type="text" autoComplete="name"
          value={form.name} onChange={handleChange} required />

        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} required />

        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="new-password"
          value={form.password} onChange={handleChange} required />

        <label htmlFor="confirmPassword">Confirmar senha</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
          value={form.confirmPassword} onChange={handleChange} required />

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <button type="button" className="btn-link" onClick={onBack}>Voltar</button>
    </main>
  );
}
