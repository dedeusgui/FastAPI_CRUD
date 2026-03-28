import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Brand } from "../../components/ui/Brand";
import { useAuth } from "../../context/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || password.trim().length < 6) {
      setError("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: trimmedName, email: trimmedEmail, password });
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar sua conta.",
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
          <span className="eyebrow">Criar conta</span>
          <h1>Comece com uma base organizada para acompanhar sua rotina desde o primeiro dia.</h1>
          <p>
            Crie sua conta para acessar um espaço de trabalho mais limpo, com
            prioridades visíveis, conexões organizadas e uma experiência de uso
            pensada como produto.
          </p>

          <div className="auth-benefits">
            <article className="auth-benefit-card">
              <strong>Entrada simples</strong>
              <p>Cadastro direto para você começar sem etapas desnecessárias.</p>
            </article>
            <article className="auth-benefit-card">
              <strong>Estrutura clara</strong>
              <p>O painel já nasce pronto para acompanhar tarefas e conexões com contexto.</p>
            </article>
          </div>
        </div>

        <div className="auth-panel auth-panel-form">
          <div className="auth-form-header">
            <span className="eyebrow">Nova conta</span>
            <h2>Criar conta na Avel</h2>
            <p>Use seu nome, um e-mail válido e uma senha com pelo menos 6 caracteres.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nome</span>
              <div className="field-input">
                <UserRound size={18} />
                <input
                  autoComplete="name"
                  placeholder="Seu nome"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </label>

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
                  autoComplete="new-password"
                  placeholder="Crie uma senha segura"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>

            {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

            <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Criando conta..." : "Criar conta"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
