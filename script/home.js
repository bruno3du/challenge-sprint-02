document.addEventListener("DOMContentLoaded", () => {
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

  const botoesEspecialidade = document.querySelectorAll(".especialidades .card");
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
    const opcoes = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    campoData.textContent = hoje.toLocaleDateString("pt-BR", opcoes);
  }
  atualizarData();

  const toggleBtn = document.getElementById("dark-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const icon = toggleBtn.querySelector("i");
      const dark = document.body.classList.contains("dark-mode");
      icon.classList.replace(dark ? "bi-moon" : "bi-sun", dark ? "bi-sun" : "bi-moon");

      const aviso = document.createElement("div");
      aviso.textContent = dark ? "🌙 Dark mode ativado" : "☀️ Light mode ativado";
      aviso.style.position = "fixed";
      aviso.style.bottom = "20px";
      aviso.style.right = "20px";
      aviso.style.background = "rgba(0,0,0,0.7)";
      aviso.style.color = "#fff";
      aviso.style.padding = "10px 20px";
      aviso.style.borderRadius = "8px";
      aviso.style.fontSize = "14px";
      aviso.style.zIndex = "9999";
      aviso.style.transition = "opacity 0.5s ease";

      document.body.appendChild(aviso);
      setTimeout(() => {
        aviso.style.opacity = "0";
        setTimeout(() => aviso.remove(), 500);
      }, 2000);
    });
  }
});
