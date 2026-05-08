const consultas = () => {
  const usuario = get("login") ;
  if (!usuario) {
    alert("Usuário não encontrado. Faça login novamente.");
    window.location.href = "index.html";
    return;
  }
  
  // Extraímos todas as consultas de um usuário
  const listaConsultas = usuario.consultas || [];

  const tbody = document.getElementById("consultas-tbody");

  if (!tbody) return;

  // Limpa as linhas estáticas de exemplo do HTML
  tbody.innerHTML = "";

  const fragment = document.createDocumentFragment();

  listaConsultas.forEach((consulta) => {
    const tr = document.createElement("tr");

    // Formatação da classe de status para o CSS (ex: "Agendado" -> "agendado")
    const statusClass = consulta.status ? consulta.status.toLowerCase() : "";

    tr.innerHTML = `
      <td>${consulta.especialidade || "Geral"}</td>
      <td>${consulta.paciente}</td>
      <td>${Intl.DateTimeFormat("pt-BR").format(new Date(consulta.dataInicio))}</td>
      <td><span class="status ${statusClass}">${consulta.status}</span></td>
      <td>${consulta.endereco}</td>
      <td>
        <a href="#" title="Abrir">
          <img src="assets/abrir.svg" alt="Abrir" width="20" height="20" />
        </a>
        <a href="#" title="Reagendar">
          <img src="assets/reagendar.svg" alt="Reagendar" width="20" height="20" />
        </a>
        <a href="#" title="Cancelar">
          <img src="assets/cancelar.svg" alt="Cancelar" width="20" height="20" />
        </a>
        <a href="#" title="Nova Consulta">
            <img src="assets/trocarHorario.svg" alt="Criar nova Consulta com este Profissional" width="20" height="20" />
        </a>
      </td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
};

document.addEventListener("DOMContentLoaded", consultas);