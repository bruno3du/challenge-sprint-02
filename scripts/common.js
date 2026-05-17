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

document.addEventListener("DOMContentLoaded", () => {
  data();
  atualizarAvatarUsuario();
});

