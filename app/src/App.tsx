import { useEffect, useMemo, useState } from "react";
import { useStore } from "./store";
import { consolidate } from "./lib/bom";
import { Home } from "./components/Home";
import { CategoriaView } from "./components/CategoriaView";
import { ResultadoView } from "./components/ResultadoView";
import { PreviewPanel } from "./components/PreviewPanel";
import { PrecosView } from "./components/precos/PrecosView";
import { RelatoriosView } from "./components/relatorios/RelatoriosView";
import { ClientesView } from "./components/clientes/ClientesView";
import { ClienteDetalheView } from "./components/clientes/ClienteDetalheView";
import { ConsultaOrcamentosView } from "./components/consulta/ConsultaOrcamentosView";
import { DetalheOrcamentoView } from "./components/detalhe/DetalheOrcamentoView";
import { ConfiguracoesView } from "./components/orcamento/ConfiguracoesView";
import { UpdateToast } from "./components/UpdateToast";
import { TelaLicenca } from "./components/TelaLicenca";
import { ensureActivated, type StatusLicenca } from "./lib/license/activation";

export default function App() {
  const loaded = useStore((s) => s.loaded);
  const loadError = useStore((s) => s.loadError);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const goBack = useStore((s) => s.goBack);
  const podeVoltar = useStore((s) => s.viewHistory.length > 0);
  const load = useStore((s) => s.load);

  // Gate de licença: roda no boot (após o SQLite). null = verificando.
  const [licenca, setLicenca] = useState<StatusLicenca | null>(null);
  const verificarLicenca = () => {
    setLicenca(null);
    ensureActivated().then(setLicenca).catch(() => setLicenca({ ok: true }));
  };
  useEffect(() => { verificarLicenca(); }, []);

  const itens = useStore((s) => s.itens);
  const obraInsumos = useStore((s) => s.obraInsumos);
  const estruturas = useStore((s) => s.estruturas);
  const insumos = useStore((s) => s.insumos);
  const materials = useStore((s) => s.materials);

  useEffect(() => { load(); }, [load]);

  const cons = useMemo(
    () => consolidate(estruturas, insumos, itens, obraInsumos, materials),
    [estruturas, insumos, itens, obraInsumos, materials],
  );

  const nLinhas = itens.length + obraInsumos.length;

  const inicioAtivo =
    view.name === "home" || view.name === "categoria";

  // Gate de licença vem ANTES de tudo (não apaga dados; só decide o acesso).
  if (licenca === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-slate-500">Verificando licença…</div>
      </div>
    );
  }
  if (!licenca.ok) {
    return <TelaLicenca status={licenca} onResolvido={verificarLicenca} />;
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Erro ao carregar a base de dados</h2>
          <p className="mt-2 text-sm">{loadError}</p>
          <p className="mt-2 text-xs text-red-600">
            Verifique se os arquivos JSON estão em <code>public/data/</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-slate-500">Carregando base de materiais…</div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <UpdateToast />
      <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <button
            onClick={goBack}
            disabled={!podeVoltar}
            title="Voltar"
            aria-label="Voltar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => setView({ name: "home" })}
            className="flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-slate-50"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-600 font-bold text-white shadow-sm">RM</div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-tight text-slate-900">
                Relação de Materiais
              </div>
              <div className="text-xs leading-tight text-slate-500">
                Redes de Distribuição — Média Tensão
              </div>
            </div>
          </button>

          {/* Navegação principal */}
          <nav className="ml-auto flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <NavButton active={inicioAtivo} onClick={() => setView({ name: "home" })}>
              Início
            </NavButton>
            <NavButton
              active={view.name === "clientes" || view.name === "cliente_detalhe"}
              onClick={() => setView({ name: "clientes" })}
            >
              Clientes
            </NavButton>
            <NavButton active={view.name === "consulta"} onClick={() => setView({ name: "consulta" })}>
              Consulta
            </NavButton>
            <NavButton active={view.name === "precos"} onClick={() => setView({ name: "precos" })}>
              Preços
            </NavButton>
            <NavButton active={view.name === "relatorios"} onClick={() => setView({ name: "relatorios" })}>
              Relatórios
            </NavButton>
            <NavButton
              active={view.name === "configuracoes"}
              onClick={() => setView({ name: "configuracoes" })}
              title="Configurações"
            >
              <span aria-hidden="true">⚙</span>
              <span className="hidden lg:inline"> Configurações</span>
            </NavButton>
          </nav>

          {/* Resumo + CTA */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1.5 xl:flex">
              <Chip label="Estruturas" value={cons.totalEstruturas} />
              <Chip label="Itens" value={cons.totalItens} />
            </div>
            <button
              onClick={() => setView({ name: "resultado" })}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors ${
                view.name === "resultado"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
            >
              Lista de Obra{nLinhas > 0 ? ` (${nLinhas})` : ""}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {view.name === "resultado" ? (
          <ResultadoView consolidation={cons} />
        ) : view.name === "precos" ? (
          <PrecosView />
        ) : view.name === "relatorios" ? (
          <RelatoriosView />
        ) : view.name === "clientes" ? (
          <ClientesView />
        ) : view.name === "consulta" ? (
          <ConsultaOrcamentosView />
        ) : view.name === "detalhe" ? (
          <DetalheOrcamentoView id={view.id} />
        ) : view.name === "cliente_detalhe" ? (
          <ClienteDetalheView id={view.id} />
        ) : view.name === "configuracoes" ? (
          <ConfiguracoesView />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0">
              {view.name === "home" && <Home />}
              {view.name === "categoria" && <CategoriaView categoria={view.categoria} />}
            </div>
            <PreviewPanel consolidation={cons} />
          </div>
        )}
      </main>

      <footer className="no-print py-4 text-center text-[11px] text-slate-400">
        desenvolvido pela SIGMA - SOFTWARE HOUSE
      </footer>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-white text-sky-700 shadow-sm"
          : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
      <span className="font-semibold text-slate-900">{value}</span> {label}
    </div>
  );
}
