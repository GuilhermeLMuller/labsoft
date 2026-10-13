import { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DatabasePage from "./pages/DatabasePage";
import "./App.css";

// Controla qual tela é exibida: "welcome" | "login" | "register" | "home".
// TODO: trocar por react-router-dom quando o projeto tiver mais páginas.
export default function App() {
  const [page, setPage] = useState("welcome");
  const [user, setUser] = useState(null);

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
        onSuccess={(data) => {
          setUser(data);
          setPage("home");
        }}
        onBack={() => setPage("welcome")}
      />
    );
  }

  if (page === "home") {
    return (
      <DatabasePage
        user={user}
        onLogout={() => {
          setUser(null);
          setPage("welcome");
        }}
      />
    );
  }

  return (
    <WelcomePage
      onCreateAccount={() => setPage("register")}
      onLogin={() => setPage("login")}
    />
  );
}
