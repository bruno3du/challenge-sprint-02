document.addEventListener("DOMContentLoaded", () => {
  let modal = null;
  try {
    modal = new bootstrap.Modal(document.getElementById("scheduleModal"));
  } catch (err) {
    console.warn("Bootstrap modal indisponível:", err);
  }
  document.getElementById("cal-table").addEventListener("click", (e) => {
    if (e.target.closest(".cal-more")) return;
    const cell = e.target.closest(".cal-cell");
    if (!cell || cell.classList.contains("is-past")) return;
    if (e.target.closest(".cal-pill, .cal-cell") && modal) modal.show();
  });

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
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const MESES_CURTO = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const DIAS_SEMANA = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
  ];

  const params = new URLSearchParams(window.location.search);

  const hoje = new Date();
  const mesParam = parseInt(params.get("mes"), 10);
  const anoParam = parseInt(params.get("ano"), 10);
  let anoAtual = Number.isInteger(anoParam) ? anoParam : hoje.getFullYear();
  if (anoAtual < hoje.getFullYear()) anoAtual = hoje.getFullYear();
  let mesAtual = Number.isInteger(mesParam) && mesParam >= 0 && mesParam <= 11 ? mesParam : hoje.getMonth();
  if (anoAtual === hoje.getFullYear() && mesAtual < hoje.getMonth()) mesAtual = hoje.getMonth();

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
    for (let y = hoje.getFullYear(); y <= hoje.getFullYear() + 5; y++) anos.push(y);
    selectAno.innerHTML = anos
      .map((y) => `<option value="${y}" ${y === anoAtual ? "selected" : ""}>${y}</option>`)
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

    const hojeMidnight = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
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
        numDiv.textContent = d === diasMesAnterior ? `${d} ${MESES_CURTO[mesAnteriorIdx]}` : `${d}`;
        dataCelula = new Date(anoAtual, mesAtual - 1, d);
      } else if (i >= diaSemanaInicio + diasNoMes) {
        const d = i - (diaSemanaInicio + diasNoMes) + 1;
        cell.classList.add("is-muted");
        numDiv.textContent = d === 1 ? `1 ${MESES_CURTO[mesProximoIdx]}` : `${d}`;
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
      cell.appendChild(numDiv);
      calBody.appendChild(cell);
    }
  }

  const cells = document.querySelectorAll("#cal-table .cal-cell");
  cells.forEach((cell, idx) => {
    cell.querySelectorAll(".cal-pill").forEach((p) => p.remove());
    if (!nomesEspecialidades.length) return;

    const rand = rngFrom(idx + 1);
    const qtd = nomesEspecialidades.length;
    const baralho = [...nomesEspecialidades].sort(() => rand() - 0.5);
    const escolhidas = baralho.slice(0, qtd);

    const content = document.createElement("div");
    content.className = "cal-content";
    const wrap = document.createElement("div");
    wrap.className = "cal-pills-wrap";
    escolhidas.forEach((nome) => {
      const pill = document.createElement("div");
      pill.className = "cal-pill";
      pill.dataset.especialidade = nome;
      const count = 1 + Math.floor(rand() * 4);
      pill.innerHTML = `<span>${nome}</span><span class="badge-count">${count}</span>`;
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

  const btnAplicar = document.getElementById("btn-aplicar-filtro");
  if (btnAplicar) {
    btnAplicar.addEventListener("click", () => {
      const sel = document.querySelector(
        'input[name="filter-especialidade"]:checked',
      );
      if (!sel) return;
      const url = new URL(window.location.href);
      url.searchParams.set("especialidade", sel.value);
      window.location.href = url.toString();
    });
  }

  const btnLimpar = document.getElementById("btn-limpar-filtro");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("especialidade");
      window.location.href = url.pathname + url.hash;
    });
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
        const match =
          (pill.dataset.especialidade || "").toLowerCase() === alvo;
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
