document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card-rapido").forEach((btn) => {
    btn.addEventListener("click", () => {
      const esp = btn.dataset.especialidade;
      if (!esp) return;
      window.location.href = `./agendamento.html?especialidade=${encodeURIComponent(esp)}`;
    });
  });

  const lado1 = document.getElementById("especialidades-lado-1");
  const lado2 = document.getElementById("especialidades-lado-2");

  if (lado1 && lado2 && typeof especialidade === "object") {
    const nomes = Object.values(especialidade);
    const meio = Math.ceil(nomes.length / 2);
    nomes.forEach((nome, i) => {
      const btn = document.createElement("button");
      btn.className = "card";
      btn.textContent = nome;
      btn.dataset.especialidade = nome;
      btn.addEventListener("click", () => {
        const q = encodeURIComponent(nome);
        window.location.href = `./agendamento.html?especialidade=${q}`;
      });
      (i < meio ? lado1 : lado2).appendChild(btn);
    });
  }

  const searchInput = document.querySelector(".search-bar input");
  const cards = document.querySelectorAll(".especialidades .card");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const termo = e.target.value.toLowerCase();
      cards.forEach((card) => {
        const texto = card.textContent.toLowerCase();
        card.style.display = texto.includes(termo) ? "block" : "none";
        card.style.opacity = texto.includes(termo) ? "1" : "0";
      });
    });
  }

  const botoesEspecialidade = document.querySelectorAll(
    ".especialidades .card",
  );
  botoesEspecialidade.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoesEspecialidade.forEach((b) => b.classList.remove("selected"));
      botao.classList.add("selected");
      console.log("Especialidade selecionada: " + botao.textContent);
    });
  });

  function atualizarData() {
    const campoData = document.querySelector(".text-muted-ink");
    if (!campoData) return;
    const hoje = new Date();
    const opcoes = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    campoData.textContent = hoje.toLocaleDateString("pt-BR", opcoes);
  }
  atualizarData();

});
