import { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

// Controla qual tela é exibida: "welcome" | "login" | "register" | "home".
// TODO: trocar por react-router-dom quando o projeto tiver mais páginas.
export default function App() {
  const [page, setPage] = useState("welcome");

  if (page === "register") {
    return (
      <RegisterPage
        onSuccess={() => setPage("login")}
        onBack={() => setPage("welcome")}
      />
    );
  }

  if (page === "login") {
    return (
      <LoginPage
        onSuccess={() => setPage("home")}
        onBack={() => setPage("welcome")}
      />
    );
  }

  if (page === "home") {
    // TODO: substituir pela página principal do site (área logada).
    return (
      <main className="card">
        <h1>Você está logado</h1>
        <button type="button" className="btn btn-secondary" onClick={() => setPage("welcome")}>
          Sair
        </button>
      </main>
    );
  }

  return (
    <WelcomePage
      onCreateAccount={() => setPage("register")}
      onLogin={() => setPage("login")}
    />
  );
}
