const obterMedicos = () => {
  try {
    return JSON.parse(window.localStorage.getItem("medicos")) || [];
  } catch (err) {
    return [];
  }
};

const chaveDia = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const PERIODOS = {
  manha: { label: "Manhã", min: 0, max: 12 },
  tarde: { label: "Tarde", min: 12, max: 18 },
  noite: { label: "Noite", min: 18, max: 24 },
};

const periodoDeIso = (iso) => {
  const h = new Date(iso).getUTCHours();
  if (h < 12) return "manha";
  if (h < 18) return "tarde";
  return "noite";
};

const agruparDisponibilidadesPorDia = (medicos, ano, mes, periodoAlvo) => {
  const mapa = new Map();
  medicos.forEach((m) => {
    (m.disponibilidades || []).forEach((d) => {
      const inicio = new Date(d.dataInicio);
      if (inicio.getFullYear() !== ano || inicio.getMonth() !== mes) return;
      if (periodoAlvo && periodoDeIso(d.dataInicio) !== periodoAlvo) return;
      const chave = chaveDia(inicio);
      if (!mapa.has(chave)) mapa.set(chave, new Map());
      const porEsp = mapa.get(chave);
      const esp = m.especialidade;
      if (!porEsp.has(esp)) porEsp.set(esp, { count: 0, slots: [] });
      const reg = porEsp.get(esp);
      reg.count += 1;
      reg.slots.push({
        medico: m.nome,
        dataInicio: d.dataInicio,
        dataFim: d.dataFim,
      });
    });
  });
  return mapa;
};

document.addEventListener("DOMContentLoaded", () => {
  let modal = null;
  try {
    modal = new bootstrap.Modal(document.getElementById("scheduleModal"));
  } catch (err) {
    console.warn("Bootstrap modal indisponível:", err);
  }
  let slotsDoDiaSelecionado = [];
  let dataSelecionada = null;

  const formatarHora = (iso) => {
    const d = new Date(iso);
    return `${String(d.getUTCHours()).padStart(2, "0")}h`;
  };

  const renderizarSlots = (chave, especialidadeAlvo) => {
    const lista = document.getElementById("schedule-slots-list");
    const subtitulo = document.getElementById("scheduleModalSubtitle");
    if (!lista) return;
    const porEsp = buscarPorChave(chave);
    slotsDoDiaSelecionado = [];
    if (!porEsp) {
      lista.innerHTML =
        '<p class="text-muted-ink small m-0">Nenhum horário disponível.</p>';
      return;
    }
    [...porEsp.entries()].forEach(([nomeEsp, info]) => {
      if (
        especialidadeAlvo &&
        nomeEsp.toLowerCase() !== especialidadeAlvo.toLowerCase()
      )
        return;
      info.slots.forEach((s) =>
        slotsDoDiaSelecionado.push({ ...s, especialidade: nomeEsp }),
      );
    });
    slotsDoDiaSelecionado.sort(
      (a, b) => new Date(a.dataInicio) - new Date(b.dataInicio),
    );
    if (slotsDoDiaSelecionado.length === 0) {
      lista.innerHTML =
        '<p class="text-muted-ink small m-0">Nenhum horário disponível.</p>';
      return;
    }
    if (subtitulo && dataSelecionada) {
      const d = new Date(dataSelecionada + "T00:00:00");
      subtitulo.textContent = `Horários disponíveis — ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`;
    }
    lista.innerHTML = slotsDoDiaSelecionado
      .map((s, i) => {
        const inicio = formatarHora(s.dataInicio);
        const fim = formatarHora(s.dataFim);
        return `
          <label class="time-row d-flex align-items-center gap-3 p-3 rounded m-0">
            <input type="radio" name="schedule-time" value="${i}" ${i === 0 ? "checked" : ""} />
            <span class="time-radio"></span>
            <span class="time-label">${inicio} – ${fim}</span>
            <span class="time-doctor ms-auto small">${s.medico} · ${s.especialidade}</span>
          </label>`;
      })
      .join("");
  };

  document.getElementById("cal-table").addEventListener("click", (e) => {
    if (e.target.closest(".cal-more")) return;
    const cell = e.target.closest(".cal-cell");
    if (!cell || cell.classList.contains("is-past")) return;
    if (!e.target.closest(".cal-pill, .cal-cell") || !modal) return;
    dataSelecionada = cell.dataset.date;
    const pill = e.target.closest(".cal-pill");
    const espAlvo = pill
      ? pill.dataset.especialidade
      : window.especialidadeFiltro || null;
    renderizarSlots(dataSelecionada, espAlvo);
    modal.show();
  });

  const btnConfirmar = document.getElementById("btn-confirmar-agendamento");
  if (btnConfirmar) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    btnConfirmar.addEventListener("click", async () => {
      const sel = document.querySelector('input[name="schedule-time"]:checked');
      if (!sel) return;
      const slot = slotsDoDiaSelecionado[parseInt(sel.value, 10)];
      if (!slot) return;
      const login = get("login");
      if (!login) {
        alert("Nenhum usuário logado.");
        window.location.href = "./index.html";
        return;
      }
      const usuarios = get("usuarios") || [];
      const idx = usuarios.findIndex((u) => u.email === login.email);
      if (idx === -1) {
        alert("Usuário não encontrado.");
        return;
      }
      const textoOriginal = btnConfirmar.innerHTML;
      btnConfirmar.disabled = true;
      btnConfirmar.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Agendando...';
      await sleep(1200);
      const cupom = window.cupomAtivo || null;
      if (
        cupom &&
        cupom.especialidade &&
        slot.especialidade.toLowerCase() !== cupom.especialidade.toLowerCase()
      ) {
        alert(
          `O cupom ${cupom.codigo} é válido apenas para ${cupom.especialidade}.`,
        );
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = textoOriginal;
        return;
      }
      const consulta = {
        medico: slot.medico,
        especialidade: slot.especialidade,
        dataInicio: slot.dataInicio,
        dataFim: slot.dataFim,
        paciente:
          [login.nome, login.sobrenome].filter(Boolean).join(" ") || login.nome,
        status: "agendado",
        endereco: login.endereco || "",
        ...(cupom
          ? {
              cupom: cupom.codigo,
              desconto: cupom.desconto,
            }
          : {}),
      };
      const idxReagendar = window.reagendarIdx;
      if (
        Number.isInteger(idxReagendar) &&
        usuarios[idx].consultas?.[idxReagendar]
      ) {
        usuarios[idx].consultas[idxReagendar].status = "reagendado";
        usuarios[idx].consultas[idxReagendar].reagendadoEm = new Date().toISOString();
      }
      usuarios[idx].consultas = [...(usuarios[idx].consultas || []), consulta];
      save("usuarios", usuarios);
      save("login", usuarios[idx]);

      if (cupom) {
        const cupons = get("cupons") || [];
        const cIdx = cupons.findIndex((x) => x.codigo === cupom.codigo);
        if (cIdx !== -1) {
          cupons[cIdx].usado = true;
          cupons[cIdx].usadoEm = new Date().toISOString();
          save("cupons", cupons);
        }
      }

      const medicosStorage = get("medicos") || [];
      const mIdx = medicosStorage.findIndex(
        (m) => m.nome === slot.medico && m.especialidade === slot.especialidade,
      );
      if (mIdx !== -1) {
        medicosStorage[mIdx].disponibilidades = (
          medicosStorage[mIdx].disponibilidades || []
        ).filter(
          (d) =>
            !(d.dataInicio === slot.dataInicio && d.dataFim === slot.dataFim),
        );
        save("medicos", medicosStorage);
      }
      btnConfirmar.innerHTML = textoOriginal;
      btnConfirmar.disabled = false;
      window.location.href = "./consultas.html";
    });
  }

  const nomesEspecialidades =
    typeof especialidade === "object" ? Object.values(especialidade) : [];

  // PRNG determinístico por semente (Mulberry32)
  const rngFrom = (seed) => {
    let t = seed >>> 0;
    return () => {
      t = (t + 0x6d2b79f5) >>> 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const MESES_CURTO = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const DIAS_SEMANA = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  const params = new URLSearchParams(window.location.search);

  const reagendarIdx = parseInt(params.get("reagendar"), 10);
  let consultaReagendar = null;
  if (Number.isInteger(reagendarIdx)) {
    const login = typeof get === "function" ? get("login") : null;
    const c = login?.consultas?.[reagendarIdx];
    if (c) {
      consultaReagendar = c;
      if (c.especialidade && !params.get("especialidade")) {
        params.set("especialidade", c.especialidade);
      }
      const heroBand = document.querySelector(".hero-band");
      if (heroBand) {
        const dataOriginal = Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(c.dataInicio));
        const banner = document.createElement("div");
        banner.className = "alert alert-warning d-flex align-items-center gap-2 mb-3";
        banner.setAttribute("role", "alert");
        banner.innerHTML = `
          <i class="bi bi-arrow-repeat"></i>
          <div class="flex-grow-1">
            <strong>Reagendamento:</strong>
            consulta de <strong>${c.especialidade}</strong> com ${c.medico}
            em ${dataOriginal} (filtro travado nesta especialidade).
          </div>`;
        heroBand.insertAdjacentElement("afterend", banner);
      }
      window.reagendarIdx = reagendarIdx;
    }
  }

  const codigoCupom = params.get("cupom");
  let cupomAtivo = null;
  if (codigoCupom) {
    const login = typeof get === "function" ? get("login") : null;
    const cupons = (typeof get === "function" && get("cupons")) || [];
    const c = cupons.find((x) => x.codigo === codigoCupom);
    if (!c) {
      alert("Cupom inválido ou não encontrado.");
    } else if (c.usado) {
      alert(`Cupom ${c.codigo} já foi utilizado.`);
    } else if (login && c.usuarioEmail && c.usuarioEmail !== login.email) {
      alert("Esse cupom pertence a outro usuário.");
    } else {
      const pontosAtuais =
        parseInt(localStorage.getItem("userPoints"), 10) || 0;
      cupomAtivo = c;
      if (!params.get("especialidade") && c.especialidade) {
        params.set("especialidade", c.especialidade);
      }
      const heroBand = document.querySelector(".hero-band");
      if (heroBand) {
        const banner = document.createElement("div");
        banner.className = "alert alert-success d-flex align-items-center gap-2 mb-3";
        banner.setAttribute("role", "alert");
        banner.innerHTML = `
          <i class="bi bi-gift-fill"></i>
          <div class="flex-grow-1">
            <strong>Cupom ${c.codigo} ativo:</strong>
            ${c.desconto}% de desconto em <strong>${c.especialidade}</strong>
            (válido apenas para esta especialidade).
            <div class="small text-muted-ink">Você possui <strong>${pontosAtuais.toLocaleString("pt-BR")}</strong> pontos acumulados. O desconto será aplicado ao confirmar o agendamento.</div>
          </div>`;
        heroBand.insertAdjacentElement("afterend", banner);
      }
      window.cupomAtivo = cupomAtivo;
    }
  }

  const hoje = new Date();
  const mesParam = parseInt(params.get("mes"), 10);
  const anoParam = parseInt(params.get("ano"), 10);
  let anoAtual = Number.isInteger(anoParam) ? anoParam : hoje.getFullYear();
  if (anoAtual < hoje.getFullYear()) anoAtual = hoje.getFullYear();
  let mesAtual =
    Number.isInteger(mesParam) && mesParam >= 0 && mesParam <= 11
      ? mesParam
      : hoje.getMonth();
  if (anoAtual === hoje.getFullYear() && mesAtual < hoje.getMonth())
    mesAtual = hoje.getMonth();

  const topbarDate = document.getElementById("topbar-date");
  if (topbarDate) {
    topbarDate.textContent = `${DIAS_SEMANA[hoje.getDay()]}, ${hoje.getDate()} de ${MESES[hoje.getMonth()].toLowerCase()} de ${hoje.getFullYear()}`;
  }

  const selectMes = document.getElementById("cal-month");
  const selectAno = document.getElementById("cal-year");
  const popularMeses = (ano, mesSelecionado) => {
    if (!selectMes) return;
    const mesMinimo = ano === hoje.getFullYear() ? hoje.getMonth() : 0;
    selectMes.innerHTML = MESES.map((m, i) =>
      i < mesMinimo
        ? ""
        : `<option value="${i}" ${i === mesSelecionado ? "selected" : ""}>${m}</option>`,
    ).join("");
  };
  if (selectAno) {
    const anos = [];
    for (let y = hoje.getFullYear(); y <= hoje.getFullYear() + 5; y++)
      anos.push(y);
    selectAno.innerHTML = anos
      .map(
        (y) =>
          `<option value="${y}" ${y === anoAtual ? "selected" : ""}>${y}</option>`,
      )
      .join("");
  }
  popularMeses(anoAtual, mesAtual);
  const recarregar = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mes", selectMes.value);
    url.searchParams.set("ano", selectAno.value);
    window.location.href = url.toString();
  };
  if (selectAno) {
    selectAno.addEventListener("change", () => {
      const novoAno = parseInt(selectAno.value, 10);
      const mesMinimo = novoAno === hoje.getFullYear() ? hoje.getMonth() : 0;
      const mesAtualSel = parseInt(selectMes.value, 10);
      popularMeses(novoAno, Math.max(mesAtualSel, mesMinimo));
      recarregar();
    });
  }
  if (selectMes) selectMes.addEventListener("change", recarregar);

  const calBody = document.getElementById("cal-body");
  if (calBody) {
    calBody.innerHTML = "";
    const primeiro = new Date(anoAtual, mesAtual, 1);
    const diaSemanaInicio = primeiro.getDay();
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const diasMesAnterior = new Date(anoAtual, mesAtual, 0).getDate();
    const mesAnteriorIdx = (mesAtual + 11) % 12;
    const mesProximoIdx = (mesAtual + 1) % 12;

    const hojeMidnight = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );
    const totalCelulas = Math.ceil((diaSemanaInicio + diasNoMes) / 7) * 7;
    for (let i = 0; i < totalCelulas; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      const numDiv = document.createElement("div");
      numDiv.className = "cal-num";
      let dataCelula;
      if (i < diaSemanaInicio) {
        const d = diasMesAnterior - diaSemanaInicio + 1 + i;
        cell.classList.add("is-muted");
        numDiv.textContent =
          d === diasMesAnterior
            ? `${d} ${MESES_CURTO[mesAnteriorIdx]}`
            : `${d}`;
        dataCelula = new Date(anoAtual, mesAtual - 1, d);
      } else if (i >= diaSemanaInicio + diasNoMes) {
        const d = i - (diaSemanaInicio + diasNoMes) + 1;
        cell.classList.add("is-muted");
        numDiv.textContent =
          d === 1 ? `1 ${MESES_CURTO[mesProximoIdx]}` : `${d}`;
        dataCelula = new Date(anoAtual, mesAtual + 1, d);
      } else {
        const d = i - diaSemanaInicio + 1;
        numDiv.textContent = d === 1 ? `1 ${MESES_CURTO[mesAtual]}` : `${d}`;
        dataCelula = new Date(anoAtual, mesAtual, d);
        if (dataCelula.getTime() === hojeMidnight.getTime()) {
          cell.classList.add("is-today");
        }
      }
      if (dataCelula < hojeMidnight) cell.classList.add("is-past");
      cell.dataset.date = chaveDia(dataCelula);
      cell.appendChild(numDiv);
      calBody.appendChild(cell);
    }
  }

  if (typeof seed === "function" && !(get && get("medicos"))) {
    try {
      seed();
    } catch (e) {
      /* noop */
    }
  }
  const medicos = typeof obterMedicos === "function" ? obterMedicos() : [];
  const periodoParam = params.get("periodo");
  const periodoFiltro = PERIODOS[periodoParam] ? periodoParam : null;
  const dispMesAtual = agruparDisponibilidadesPorDia(
    medicos,
    anoAtual,
    mesAtual,
    periodoFiltro,
  );
  const dispMesAnterior = agruparDisponibilidadesPorDia(
    medicos,
    mesAtual === 0 ? anoAtual - 1 : anoAtual,
    mesAtual === 0 ? 11 : mesAtual - 1,
    periodoFiltro,
  );
  const dispMesProximo = agruparDisponibilidadesPorDia(
    medicos,
    mesAtual === 11 ? anoAtual + 1 : anoAtual,
    mesAtual === 11 ? 0 : mesAtual + 1,
    periodoFiltro,
  );
  const buscarPorChave = (chave) =>
    dispMesAtual.get(chave) ||
    dispMesAnterior.get(chave) ||
    dispMesProximo.get(chave);

  const cells = document.querySelectorAll("#cal-table .cal-cell");
  cells.forEach((cell) => {
    cell.querySelectorAll(".cal-pill").forEach((p) => p.remove());
    const porEsp = buscarPorChave(cell.dataset.date);
    if (!porEsp || porEsp.size === 0) return;

    const content = document.createElement("div");
    content.className = "cal-content";
    const wrap = document.createElement("div");
    wrap.className = "cal-pills-wrap";
    [...porEsp.entries()].forEach(([nome, info]) => {
      const pill = document.createElement("div");
      pill.className = "cal-pill";
      pill.dataset.especialidade = nome;
      pill.innerHTML = `<span>${nome}</span><span class="badge-count">${info.count}</span>`;
      wrap.appendChild(pill);
    });
    content.appendChild(wrap);
    cell.appendChild(content);
  });

  const esp = params.get("especialidade");

  const listaFiltro = document.getElementById("filter-especialidades-list");
  if (listaFiltro && nomesEspecialidades.length) {
    listaFiltro.innerHTML = "";
    nomesEspecialidades.forEach((nome, i) => {
      const id = `filter-esp-${i}`;
      const checked =
        esp && nome.toLowerCase() === esp.toLowerCase() ? "checked" : "";
      const row = document.createElement("label");
      row.className =
        "time-row d-flex align-items-center gap-3 p-3 rounded m-0";
      row.setAttribute("for", id);
      row.innerHTML = `
        <input type="radio" name="filter-especialidade" id="${id}" value="${nome}" ${checked} />
        <span class="time-radio"></span>
        <span class="time-label">${nome}</span>
      `;
      listaFiltro.appendChild(row);
    });
  }

  const listaPeriodo = document.getElementById("filter-periodo-list");
  if (listaPeriodo) {
    listaPeriodo.innerHTML = "";
    Object.entries(PERIODOS).forEach(([key, info], i) => {
      const id = `filter-periodo-${i}`;
      const checked = periodoFiltro === key ? "checked" : "";
      const row = document.createElement("label");
      row.className =
        "time-row d-flex align-items-center gap-3 p-3 rounded m-0";
      row.setAttribute("for", id);
      row.innerHTML = `
        <input type="radio" name="filter-periodo" id="${id}" value="${key}" ${checked} />
        <span class="time-radio"></span>
        <span class="time-label">${info.label} <span class="text-muted-ink small">(${String(info.min).padStart(2, "0")}h – ${String(info.max).padStart(2, "0")}h)</span></span>
      `;
      listaPeriodo.appendChild(row);
    });
  }

  const btnAplicar = document.getElementById("btn-aplicar-filtro");
  if (btnAplicar) {
    btnAplicar.addEventListener("click", () => {
      const url = new URL(window.location.href);
      const selEsp = document.querySelector(
        'input[name="filter-especialidade"]:checked',
      );
      const selPer = document.querySelector(
        'input[name="filter-periodo"]:checked',
      );
      if (selEsp) url.searchParams.set("especialidade", selEsp.value);
      if (selPer) url.searchParams.set("periodo", selPer.value);
      if (!selEsp && !selPer) return;
      window.location.href = url.toString();
    });
  }

  const btnLimpar = document.getElementById("btn-limpar-filtro");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("especialidade");
      url.searchParams.delete("periodo");
      window.location.href = url.pathname + url.hash;
    });
  }

  const construirUrlSem = (chave) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(chave);
    return url.pathname + url.search + url.hash;
  };
  const linkLimpEsp = document.getElementById("limpar-filtro-especialidade");
  if (linkLimpEsp) {
    linkLimpEsp.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = construirUrlSem("especialidade");
    });
  }
  const linkLimpPer = document.getElementById("limpar-filtro-periodo");
  if (linkLimpPer) {
    linkLimpPer.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = construirUrlSem("periodo");
    });
  }

  if (periodoFiltro) {
    const chip = document.getElementById("filtro-periodo");
    const nome = document.getElementById("filtro-periodo-nome");
    if (chip && nome) {
      nome.textContent = PERIODOS[periodoFiltro].label;
      chip.classList.remove("d-none");
      chip.classList.add("d-inline-flex");
    }
  }

  const valido =
    esp &&
    nomesEspecialidades.some((v) => v.toLowerCase() === esp.toLowerCase());

  if (valido) {
    const chip = document.getElementById("filtro-especialidade");
    document.getElementById("filtro-especialidade-nome").textContent = esp;
    chip.classList.remove("d-none");
    chip.classList.add("d-inline-flex");
    window.especialidadeFiltro = esp;

    const alvo = esp.toLowerCase();
    cells.forEach((cell) => {
      let visiveis = 0;
      cell.querySelectorAll(".cal-pill").forEach((pill) => {
        const match = (pill.dataset.especialidade || "").toLowerCase() === alvo;
        pill.style.display = match ? "" : "none";
        if (match) visiveis++;
      });
      cell.classList.toggle("is-empty", visiveis === 0);
    });
  }

  cells.forEach((cell) => {
    const wrap = cell.querySelector(".cal-pills-wrap");
    const content = cell.querySelector(".cal-content");
    if (!wrap || !content) return;
    if (wrap.scrollHeight > wrap.clientHeight + 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-more";
      btn.setAttribute("aria-label", "Ver mais especialidades");
      btn.innerHTML =
        '<svg class="cal-more-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.6 4.3a1 1 0 0 1 1.4 0L8 9.3l5-5a1 1 0 1 1 1.4 1.4l-5.7 5.7a1 1 0 0 1-1.4 0L1.6 5.7a1 1 0 0 1 0-1.4z"/></svg>';
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        document
          .querySelectorAll("#cal-table .cal-cell.is-expanded")
          .forEach((c) => {
            if (c !== cell) {
              c.classList.remove("is-expanded", "is-expand-up");
              const icn = c.querySelector(".cal-more .cal-more-icon");
              if (icn) icn.style.transform = "";
            }
          });
        const expanded = cell.classList.toggle("is-expanded");
        cell.classList.remove("is-expand-up");
        if (expanded) {
          const rect = content.getBoundingClientRect();
          const margin = 8;
          const overflowBottom = rect.bottom - (window.innerHeight - margin);
          if (overflowBottom > 0) {
            const cellRect = cell.getBoundingClientRect();
            const spaceAbove = cellRect.top - margin;
            const spaceBelow = window.innerHeight - margin - cellRect.top - 32;
            if (spaceAbove > spaceBelow) cell.classList.add("is-expand-up");
          }
        }
        btn.querySelector(".cal-more-icon").style.transform = expanded
          ? "rotate(180deg)"
          : "";
        btn.setAttribute(
          "aria-label",
          expanded ? "Ver menos" : "Ver mais especialidades",
        );
      });
      content.appendChild(btn);
    }
  });

  const fecharExpandidas = (exceto) => {
    document
      .querySelectorAll("#cal-table .cal-cell.is-expanded")
      .forEach((c) => {
        if (c === exceto) return;
        c.classList.remove("is-expanded", "is-expand-up");
        const icn = c.querySelector(".cal-more .cal-more-icon");
        if (icn) icn.style.transform = "";
        const btn = c.querySelector(".cal-more");
        if (btn) btn.setAttribute("aria-label", "Ver mais especialidades");
      });
  };

  document.addEventListener("click", (e) => {
    const dentro = e.target.closest("#cal-table .cal-cell.is-expanded");
    if (!dentro) fecharExpandidas(null);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharExpandidas(null);
  });
});
