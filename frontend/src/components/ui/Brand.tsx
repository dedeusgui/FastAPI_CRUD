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
          Organize tarefas, prioridades e conexões em um só lugar.
        </span>
      ) : null}
    </div>
  );
}
