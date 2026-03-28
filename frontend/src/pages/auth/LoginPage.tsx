import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Brand } from "../../components/ui/Brand";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Informe seu e-mail e sua senha para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: trimmedEmail, password });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível entrar agora.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <div className="auth-panel auth-panel-brand">
          <Brand />
          <span className="eyebrow">Entrar</span>
          <h1>Entre e retome sua rotina com mais clareza.</h1>
          <p>
            Acesse sua conta para acompanhar tarefas, conexões e o estado atual
            da aplicação em uma interface mais organizada e menos improvisada.
          </p>

          <div className="auth-benefits">
            <article className="auth-benefit-card">
              <strong>Fluxo objetivo</strong>
              <p>Menos ruído visual, mais hierarquia e feedbacks mais claros durante o acesso.</p>
            </article>
            <article className="auth-benefit-card">
              <strong>Sessão persistida</strong>
              <p>Autenticação real via cookie HTTP-only já suportada pela aplicação.</p>
            </article>
          </div>
        </div>

        <div className="auth-panel auth-panel-form">
          <div className="auth-form-header">
            <span className="eyebrow">Acesso</span>
            <h2>Entrar na sua conta</h2>
            <p>Use o e-mail e a senha cadastrados para continuar de onde parou.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>E-mail</span>
              <div className="field-input">
                <Mail size={18} />
                <input
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label className="field">
              <span>Senha</span>
              <div className="field-input">
                <LockKeyhole size={18} />
                <input
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>

            {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Entrando..." : "Entrar agora"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            Ainda não tem conta? <Link to="/criar-conta">Criar conta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
