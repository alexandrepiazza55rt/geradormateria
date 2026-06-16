import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type { Cliente } from "../../lib/orcamento/types";
import { buscar_clientes } from "../../lib/orcamento/clientesHelpers";
import { ClientesFiltros } from "./ClientesFiltros";
import { ClientesLista } from "./ClientesLista";
import { ClienteForm } from "./ClienteForm";

export function ClientesView() {
  const clientes = useStore((s) => s.clientes);
  const orcamentosSalvos = useStore((s) => s.orcamentosSalvos);
  const criarCliente = useStore((s) => s.criarCliente);
  const atualizarCliente = useStore((s) => s.atualizarCliente);
  const excluirCliente = useStore((s) => s.excluirCliente);
  const restaurarCliente = useStore((s) => s.restaurarCliente);
  const setView = useStore((s) => s.setView);

  const [busca, setBusca] = useState("");
  const [incluir_excluidos, setIncluirExcluidos] = useState(false);
  const [form_aberto, set_form_aberto] = useState<{ tipo: "novo" } | { tipo: "editar"; cliente: Cliente } | null>(null);

  const filtrados = useMemo(
    () => buscar_clientes(clientes, busca, incluir_excluidos),
    [clientes, busca, incluir_excluidos],
  );

  function handle_excluir(c: Cliente) {
    const n = orcamentosSalvos.filter((o) => o.cliente_id === c.id).length;
    const aviso =
      n > 0
        ? `Cliente "${c.nome}" tem ${n} orçamento(s) vinculado(s). Esses orçamentos vão perder o vínculo (ficam sem cliente). Continuar?`
        : `Excluir cliente "${c.nome}"?`;
    if (!window.confirm(aviso)) return;
    excluirCliente(c.id);
  }

  function handle_restaurar(c: Cliente) {
    restaurarCliente(c.id);
  }

  function handle_salvar(c: Cliente) {
    if (form_aberto?.tipo === "editar") {
      atualizarCliente(c.id, c);
    } else {
      criarCliente(c);
    }
    set_form_aberto(null);
  }

  const total_ativos = clientes.filter((c) => !c.excluido_em).length;
  const total_excluidos = clientes.length - total_ativos;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cadastro de clientes que recebem orçamentos. Os dados ficam no seu
          navegador (LocalStorage).
        </p>
      </div>

      <ClientesFiltros
        busca={busca}
        incluir_excluidos={incluir_excluidos}
        onChangeBusca={setBusca}
        onChangeIncluirExcluidos={setIncluirExcluidos}
        onNovo={() => set_form_aberto({ tipo: "novo" })}
      />

      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{filtrados.length}</span>{" "}
        de {total_ativos} ativos
        {total_excluidos > 0 && ` · ${total_excluidos} excluído(s)`}
      </div>

      <ClientesLista
        clientes={filtrados}
        onVer={(c) => setView({ name: "cliente_detalhe", id: c.id })}
        onEditar={(c) => set_form_aberto({ tipo: "editar", cliente: c })}
        onExcluir={handle_excluir}
        onRestaurar={handle_restaurar}
      />

      {form_aberto && (
        <ClienteForm
          cliente={form_aberto.tipo === "editar" ? form_aberto.cliente : undefined}
          onSalvar={handle_salvar}
          onCancelar={() => set_form_aberto(null)}
        />
      )}
    </div>
  );
}
