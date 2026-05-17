const CONSULTAS_POR_PAGINA = 10;
let paginaAtualConsultas = 1;

const STATUS_BADGE = {
  agendado:   { cls: "bg-primary",           icon: "bi-calendar-check",  label: "Agendado" },
  confirmado: { cls: "bg-info text-dark",    icon: "bi-check2-circle",   label: "Confirmado" },
  concluido:  { cls: "bg-success",           icon: "bi-check-circle",    label: "Concluído" },
  realizado:  { cls: "bg-success",           icon: "bi-check-circle",    label: "Realizado" },
  cancelado:  { cls: "bg-danger",            icon: "bi-x-circle",        label: "Cancelado" },
  reagendado: { cls: "bg-warning text-dark", icon: "bi-arrow-repeat",    label: "Reagendado" },
  pendente:   { cls: "bg-warning text-dark", icon: "bi-hourglass-split", label: "Pendente" },
};

const PERIODO_TEMPORAL = {
  proximas:    { label: "Próximas" },
  passadas:    { label: "Passadas" },
  hoje:        { label: "Hoje" },
  semana:      { label: "Esta semana" },
  mes:         { label: "Este mês" },
};

const normalizar = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const lerFiltros = () => {
  const p = new URLSearchParams(window.location.search);
  return {
    status: (p.get("status") || "").split(",").filter(Boolean),
    periodo: p.get("periodo") || "",
    especialidade: p.get("especialidade") || "",
    q: p.get("q") || "",
  };
};

const escreverFiltros = (filtros) => {
  const url = new URL(window.location.href);
  const sp = url.searchParams;
  ["status", "periodo", "especialidade", "q"].forEach((k) => sp.delete(k));
  if (filtros.status?.length) sp.set("status", filtros.status.join(","));
  if (filtros.periodo) sp.set("periodo", filtros.periodo);
  if (filtros.especialidade) sp.set("especialidade", filtros.especialidade);
  if (filtros.q) sp.set("q", filtros.q);
  paginaAtualConsultas = 1;
  history.replaceState(null, "", url.toString());
};

const aplicarFiltros = (lista, filtros) => {
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);
  const inicioSemana = new Date(inicioHoje);
  inicioSemana.setDate(inicioHoje.getDate() - inicioHoje.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 7);
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  return lista.filter((c) => {
    if (filtros.status?.length) {
      if (!filtros.status.includes(normalizar(c.status))) return false;
    }
    if (filtros.periodo) {
      const d = new Date(c.dataInicio);
      if (filtros.periodo === "proximas" && d < agora) return false;
      if (filtros.periodo === "passadas" && d >= agora) return false;
      if (filtros.periodo === "hoje" && (d < inicioHoje || d >= fimHoje)) return false;
      if (filtros.periodo === "semana" && (d < inicioSemana || d >= fimSemana)) return false;
      if (filtros.periodo === "mes" && (d < inicioMes || d >= fimMes)) return false;
    }
    if (filtros.especialidade) {
      if (normalizar(c.especialidade) !== normalizar(filtros.especialidade)) return false;
    }
    if (filtros.q) {
      const alvo = normalizar(filtros.q);
      const hay = normalizar(
        `${c.medico || ""} ${c.especialidade || ""} ${c.endereco || ""}`,
      );
      if (!hay.includes(alvo)) return false;
    }
    return true;
  });
};

const renderPaginacao = (totalPaginas, pagina, onChange) => {
  const ul = document.getElementById("consultas-pagination");
  if (!ul) return;
  ul.innerHTML = "";
  if (totalPaginas <= 1) return;

  const item = (label, page, { disabled = false, active = false, ariaLabel } = {}) => {
    const li = document.createElement("li");
    li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`;
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.innerHTML = label;
    if (ariaLabel) a.setAttribute("aria-label", ariaLabel);
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (disabled || active) return;
      onChange(page);
    });
    li.appendChild(a);
    return li;
  };

  ul.appendChild(item('<i class="bi bi-chevron-left"></i>', pagina - 1, { disabled: pagina === 1, ariaLabel: "Anterior" }));
  for (let p = 1; p <= totalPaginas; p++) {
    ul.appendChild(item(String(p), p, { active: p === pagina }));
  }
  ul.appendChild(item('<i class="bi bi-chevron-right"></i>', pagina + 1, { disabled: pagina === totalPaginas, ariaLabel: "Próxima" }));
};

const renderChips = (filtros, onRemove) => {
  const box = document.getElementById("chips-filtros-consultas");
  if (!box) return;
  box.innerHTML = "";
  const chip = (texto, onClick) => {
    const span = document.createElement("span");
    span.className = "badge text-bg-light border d-inline-flex align-items-center gap-2 px-3 py-2";
    span.innerHTML = `<span>${texto}</span><a href="#" class="text-decoration-none" aria-label="Remover filtro"><i class="bi bi-x-lg"></i></a>`;
    span.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      onClick();
    });
    return span;
  };
  filtros.status?.forEach((s) => {
    const lbl = STATUS_BADGE[s]?.label || s;
    box.appendChild(chip(`Status: ${lbl}`, () => onRemove({ status: s })));
  });
  if (filtros.periodo) {
    const lbl = PERIODO_TEMPORAL[filtros.periodo]?.label || filtros.periodo;
    box.appendChild(chip(`Período: ${lbl}`, () => onRemove({ periodo: true })));
  }
  if (filtros.especialidade) {
    box.appendChild(chip(`Especialidade: ${filtros.especialidade}`, () => onRemove({ especialidade: true })));
  }
  if (filtros.q) {
    box.appendChild(chip(`Busca: ${filtros.q}`, () => onRemove({ q: true })));
  }
};

const popularModal = (filtros) => {
  const statusBox = document.getElementById("filtro-cons-status");
  if (statusBox) {
    statusBox.innerHTML = "";
    Object.entries(STATUS_BADGE).forEach(([key, info]) => {
      const id = `flt-status-${key}`;
      const checked = filtros.status?.includes(key) ? "checked" : "";
      const wrap = document.createElement("label");
      wrap.className = "time-row d-flex align-items-center gap-2 p-2 rounded m-0";
      wrap.setAttribute("for", id);
      wrap.innerHTML = `
        <input type="checkbox" id="${id}" value="${key}" ${checked} />
        <span class="badge rounded-pill ${info.cls} d-inline-flex align-items-center gap-1 px-3 py-2"><i class="bi ${info.icon}"></i>${info.label}</span>
      `;
      statusBox.appendChild(wrap);
    });
  }

  const perBox = document.getElementById("filtro-cons-periodo");
  if (perBox) {
    perBox.innerHTML = "";
    [["", "Qualquer"], ...Object.entries(PERIODO_TEMPORAL).map(([k, v]) => [k, v.label])].forEach(
      ([key, label], i) => {
        const id = `flt-per-${i}`;
        const checked = (filtros.periodo || "") === key ? "checked" : "";
        const wrap = document.createElement("label");
        wrap.className = "time-row d-flex align-items-center gap-2 p-2 rounded m-0";
        wrap.setAttribute("for", id);
        wrap.innerHTML = `
          <input type="radio" name="flt-periodo" id="${id}" value="${key}" ${checked} />
          <span class="time-label">${label}</span>
        `;
        perBox.appendChild(wrap);
      },
    );
  }

  const espSel = document.getElementById("filtro-cons-especialidade");
  if (espSel) {
    const nomes =
      typeof especialidade === "object" ? Object.values(especialidade) : [];
    espSel.innerHTML =
      `<option value="">Todas</option>` +
      nomes
        .map(
          (n) =>
            `<option value="${n}" ${normalizar(n) === normalizar(filtros.especialidade) ? "selected" : ""}>${n}</option>`,
        )
        .join("");
  }
};

const consultas = () => {
  const usuario = get("login");
  if (!usuario) {
    alert("Usuário não encontrado. Faça login novamente.");
    window.location.href = "./index.html";
    return;
  }

  const listaConsultas = usuario.consultas || [];

  const agora = new Date();
  listaConsultas.sort((a, b) => {
    const dataA = new Date(a.dataInicio);
    const dataB = new Date(b.dataInicio);
    const isAFutura = dataA >= agora;
    const isBFutura = dataB >= agora;
    if (isAFutura && !isBFutura) return -1;
    if (!isAFutura && isBFutura) return 1;
    if (isAFutura && isBFutura) return dataA - dataB;
    return dataB - dataA;
  });
  save("login", usuario);

  const filtros = lerFiltros();
  const filtradas = aplicarFiltros(listaConsultas, filtros);

  const tbody = document.getElementById("consultas-tbody");
  if (!tbody) return;

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / CONSULTAS_POR_PAGINA));
  if (paginaAtualConsultas > totalPaginas) paginaAtualConsultas = totalPaginas;
  if (paginaAtualConsultas < 1) paginaAtualConsultas = 1;

  const inicio = (paginaAtualConsultas - 1) * CONSULTAS_POR_PAGINA;
  const fim = inicio + CONSULTAS_POR_PAGINA;
  const pagina = filtradas.slice(inicio, fim);

  tbody.innerHTML = "";

  if (filtradas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" class="text-center text-muted-ink py-4">Nenhuma consulta encontrada com os filtros atuais.</td>`;
    tbody.appendChild(tr);
  }

  const fragment = document.createDocumentFragment();
  pagina.forEach((consulta) => {
    const indexReal = listaConsultas.indexOf(consulta);
    const tr = document.createElement("tr");

    const statusKey = normalizar(consulta.status);
    const badge = STATUS_BADGE[statusKey] || {
      cls: "bg-secondary",
      icon: "bi-question-circle",
      label: consulta.status || "—",
    };

    tr.innerHTML = `
      <td data-label="Especialidade">${consulta.especialidade || "Geral"}</td>
      <td data-label="Médico">${consulta.medico || "Médico não especificado"}</td>
      <td data-label="Horário">${Intl.DateTimeFormat("pt-BR").format(new Date(consulta.dataInicio))}</td>
      <td data-label="Status"><span class="badge rounded-pill ${badge.cls} d-inline-flex align-items-center gap-1 px-3 py-2"><i class="bi ${badge.icon}"></i>${badge.label}</span></td>
      <td data-label="Endereço">${consulta.endereco}</td>
      <td class="col-acoes" data-label="Ações"><div class="d-inline-flex align-items-center gap-3">
        <a href="#" title="Abrir Localização da Consulta" class="btn-abrir" data-index="${indexReal}">
          <img src="assets/abrir.svg" alt="Abrir" width="20" height="20" />
        </a>
        <a href="./agendamento.html?reagendar=${indexReal}&especialidade=${encodeURIComponent(consulta.especialidade || "")}" title="Reagendar" class="btn-reagendar">
          <img src="assets/reagendar.svg" alt="Reagendar" width="20" height="20" />
        </a>
        <a href="#" title="Cancelar" class="btn-cancelar" data-index="${indexReal}">
          <img src="assets/cancelar.svg" alt="Cancelar" width="20" height="20" />
        </a>
      </div></td>
    `;
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);

  renderPaginacao(totalPaginas, paginaAtualConsultas, (p) => {
    paginaAtualConsultas = p;
    consultas();
  });

  renderChips(filtros, (remocao) => {
    const novos = { ...filtros };
    if (remocao.status) novos.status = filtros.status.filter((s) => s !== remocao.status);
    if (remocao.periodo) novos.periodo = "";
    if (remocao.especialidade) novos.especialidade = "";
    if (remocao.q) novos.q = "";
    escreverFiltros(novos);
    const busca = document.getElementById("busca-consultas");
    if (busca && remocao.q) busca.value = "";
    consultas();
  });

  popularModal(filtros);

  if (!tbody.dataset.listener) {
    tbody.addEventListener("click", (e) => {
      const target = e.target;

      const btnAbrir = target.closest(".btn-abrir");
      if (btnAbrir) {
        e.preventDefault();
        const index = btnAbrir.dataset.index;
        const user = get("login");
        const endereco = user?.consultas?.[index]?.endereco;
        if (endereco) {
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
          window.open(url, "_blank");
        }
      }

      const btnCancelar = target.closest(".btn-cancelar");
      if (btnCancelar && confirm("Deseja realmente cancelar esta consulta?")) {
        e.preventDefault();
        const index = parseInt(btnCancelar.dataset.index, 10);
        const user = get("login");
        const todosUsuarios = get("usuarios") || [];

        if (user.consultas?.[index]) {
          user.consultas[index].status = "cancelado";
          user.consultas[index].canceladoEm = new Date().toISOString();
        }
        save("login", user);

        const userIdx = todosUsuarios.findIndex((u) => u.email === user.email);
        if (userIdx !== -1) {
          todosUsuarios[userIdx] = user;
          save("usuarios", todosUsuarios);
        }

        consultas();
      }
    });
    tbody.dataset.listener = "true";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const busca = document.getElementById("busca-consultas");
  if (busca) {
    const filtros = lerFiltros();
    busca.value = filtros.q || "";
    let debounce;
    busca.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const f = lerFiltros();
        f.q = busca.value.trim();
        escreverFiltros(f);
        consultas();
      }, 250);
    });
  }

  const btnAplicar = document.getElementById("btn-aplicar-filtros-consultas");
  if (btnAplicar) {
    btnAplicar.addEventListener("click", () => {
      const status = [...document.querySelectorAll('#filtro-cons-status input[type="checkbox"]:checked')].map(
        (i) => i.value,
      );
      const periodo =
        document.querySelector('#filtro-cons-periodo input[name="flt-periodo"]:checked')?.value || "";
      const esp = document.getElementById("filtro-cons-especialidade")?.value || "";
      const f = lerFiltros();
      f.status = status;
      f.periodo = periodo;
      f.especialidade = esp;
      escreverFiltros(f);
      consultas();
      const modalEl = document.getElementById("filterConsultasModal");
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
    });
  }

  const btnLimpar = document.getElementById("btn-limpar-filtros-consultas");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      escreverFiltros({ status: [], periodo: "", especialidade: "", q: "" });
      const busca = document.getElementById("busca-consultas");
      if (busca) busca.value = "";
      consultas();
      const modalEl = document.getElementById("filterConsultasModal");
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
    });
  }

  consultas();
});
