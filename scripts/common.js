const especialidade = {
  Cardiologia: "Cardiologia",
  Psiquiatria: "Psiquiatria",
  Dermatologia: "Dermatologia",
  Ortopedia: "Ortopedia",
  Pediatria: "Pediatria",
  Neurologia: "Neurologia",
};

const data = () => {
    // Atualiza o cabeçalho com a data atual formatada (ex: Terça, 17 de julho de 2026)
  const campoData = document.querySelector(".topbar .text-muted-ink.small");
  if (campoData) {
    const hoje = new Date();
    const opcoes = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    let dataFormatada = hoje.toLocaleDateString("pt-BR", opcoes);
    // Remove o "-feira" para manter o formato simplificado solicitado
    dataFormatada = dataFormatada.replace("-feira", "");
    campoData.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  }
};

const atualizarAvatarUsuario = () => {
  const avatar = document.querySelector(".topbar .avatar");
  if (!avatar) return;
  const usuario = typeof get === "function" ? get("login") : null;
  const nome = (usuario?.nome || usuario?.email || "").trim();
  const inicial = nome ? nome.charAt(0).toUpperCase() : "?";
  avatar.textContent = inicial;
  if (nome) avatar.setAttribute("title", nome);
};

const adicionarBotaoLogout = () => {
  const topbar = document.querySelector(".topbar");
  if (!topbar || topbar.querySelector("#btn-logout")) return;
  const btn = document.createElement("button");
  btn.id = "btn-logout";
  btn.type = "button";
  btn.className = "btn btn-icon rounded-pill";
  btn.setAttribute("aria-label", "Sair");
  btn.title = "Sair";
  btn.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
  btn.addEventListener("click", () => {
    if (!confirm("Deseja realmente sair?")) return;
    if (typeof remove === "function") remove("login");
    else window.localStorage.removeItem("login");
    window.location.href = "./index.html";
  });
  const avatar = topbar.querySelector(".avatar");
  if (avatar) topbar.insertBefore(btn, avatar);
  else topbar.appendChild(btn);
};

document.addEventListener("DOMContentLoaded", () => {
  data();
  atualizarAvatarUsuario();
  adicionarBotaoLogout();
});

