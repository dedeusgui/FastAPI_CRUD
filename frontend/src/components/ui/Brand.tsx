import logo from "../../assets/avel.png";

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="brand-lockup">
      <img
        className={compact ? "brand-mark brand-mark-compact" : "brand-mark"}
        src={logo}
        alt="Logo da Avel"
      />
      {!compact ? (
        <span className="brand-caption">
          Organização clara para acompanhar tarefas, conexões e progresso com
          tranquilidade.
        </span>
      ) : null}
    </div>
  );
}
