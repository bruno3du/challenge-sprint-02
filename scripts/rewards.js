document.addEventListener("DOMContentLoaded", () => {
  const pointsEl = document.querySelector(".points-value");

  const atualizarPontosUI = (valor) => {
    if (pointsEl) pointsEl.textContent = Number(valor).toLocaleString("pt-BR");
  };

  if (pointsEl) {
    let points = localStorage.getItem("userPoints");
    if (points) {
      points = parseInt(points, 10);
    } else {
      points = parseInt(pointsEl.textContent.replace(/\D/g, ""), 10) || 0;
      localStorage.setItem("userPoints", points);
    }
    atualizarPontosUI(points);

    let current = 0;
    const step = Math.max(1, Math.ceil(points / 60));
    const interval = setInterval(() => {
      current += step;
      if (current >= points) {
        current = points;
        clearInterval(interval);
      }
      atualizarPontosUI(current);
    }, 16);
  }

  const toggleBtn = document.getElementById("dark-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const icon = toggleBtn.querySelector("i");
      if (document.body.classList.contains("dark-mode")) {
        icon.classList.replace("bi-moon", "bi-sun");
      } else {
        icon.classList.replace("bi-sun", "bi-moon");
      }
    });
  }

  const gerarCodigoCupom = (esp) => {
    const prefixo = (esp || "RWD").slice(0, 4).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `RWD-${prefixo}-${rand}`;
  };

  const cuponsDoUsuario = () => {
    const login = typeof get === "function" ? get("login") : null;
    const todos = (typeof get === "function" && get("cupons")) || [];
    if (!login?.email) return todos.filter((c) => !c.usuarioEmail);
    return todos.filter(
      (c) => !c.usuarioEmail || c.usuarioEmail === login.email,
    );
  };

  const renderCupons = () => {
    const wrap = document.getElementById("cupons-ativos-wrap");
    const lista = document.getElementById("cupons-lista");
    const count = document.getElementById("cupons-count");
    if (!wrap || !lista) return;

    const ativos = cuponsDoUsuario().filter((c) => !c.usado);
    if (ativos.length === 0) {
      wrap.classList.add("d-none");
      lista.innerHTML = "";
      return;
    }
    wrap.classList.remove("d-none");
    if (count) count.textContent = `${ativos.length} ativo${ativos.length > 1 ? "s" : ""}`;

    lista.innerHTML = ativos
      .map(
        (c) => `
        <div class="cupom-card">
          <div class="cupom-info">
            <span class="cupom-codigo">${c.codigo}</span>
            <span class="cupom-desc">${c.desconto}% off em ${c.especialidade}</span>
          </div>
          <a class="btn-usar" href="./agendamento.html?cupom=${encodeURIComponent(c.codigo)}">
            Usar agora
          </a>
        </div>`,
      )
      .join("");
  };

  const atualizarEstadoCards = () => {
    const ativos = cuponsDoUsuario().filter((c) => !c.usado);
    const espComCupom = new Set(
      ativos.map((c) => (c.especialidade || "").toLowerCase()),
    );

    document.querySelectorAll(".reward-card").forEach((card) => {
      const esp = (card.dataset.especialidade || "").toLowerCase();
      const btn = card.querySelector(".redeem-btn");
      card.querySelector(".badge-ativo")?.remove();

      if (espComCupom.has(esp)) {
        card.classList.add("has-cupom");
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Cupom ativo";
        }
        const badge = document.createElement("span");
        badge.className = "badge-ativo";
        badge.textContent = "RESGATADO";
        card.appendChild(badge);
      } else {
        card.classList.remove("has-cupom");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Resgatar";
        }
      }
    });
  };

  document.querySelectorAll(".redeem-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const card = btn.closest(".reward-card");
      const esp = card?.dataset.especialidade;
      const desconto = parseInt(card?.dataset.desconto || "0", 10);
      const cost = parseInt(card?.dataset.cost || "0", 10);

      let currentPoints = parseInt(localStorage.getItem("userPoints"), 10) || 0;
      if (currentPoints < cost) {
        alert("Você não tem pontos suficientes!");
        return;
      }

      const login = typeof get === "function" ? get("login") : null;
      const cupons = (typeof get === "function" && get("cupons")) || [];
      const codigo = gerarCodigoCupom(esp);
      cupons.push({
        codigo,
        especialidade: esp,
        desconto,
        custo: cost,
        usuarioEmail: login?.email || null,
        usado: false,
        criadoEm: new Date().toISOString(),
      });
      if (typeof save === "function") save("cupons", cupons);

      currentPoints -= cost;
      localStorage.setItem("userPoints", currentPoints);
      atualizarPontosUI(currentPoints);
      renderCupons();
      atualizarEstadoCards();

      const usar = confirm(
        `Cupom gerado: ${codigo}\n${desconto}% de desconto em ${esp}.\n\nDeseja ir para o agendamento agora?`,
      );
      if (usar) {
        window.location.href = `./agendamento.html?cupom=${encodeURIComponent(codigo)}`;
      }
    });
  });

  const resetBtn = document.getElementById("reset-points");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Resetar pontos para 3.000 e remover seus cupons ativos?")) return;
      const defaultPoints = 3000;
      localStorage.setItem("userPoints", defaultPoints);
      atualizarPontosUI(defaultPoints);

      const login = typeof get === "function" ? get("login") : null;
      const todos = (typeof get === "function" && get("cupons")) || [];
      const filtrados = todos.filter(
        (c) =>
          c.usado ||
          (login?.email && c.usuarioEmail && c.usuarioEmail !== login.email),
      );
      if (typeof save === "function") save("cupons", filtrados);

      renderCupons();
      atualizarEstadoCards();
    });
  }

  renderCupons();
  atualizarEstadoCards();
});
