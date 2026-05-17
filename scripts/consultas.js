const consultas = () => {
  const usuario = get("login");
  if (!usuario) {
    alert("Usuário não encontrado. Faça login novamente.");
    window.location.href = "index.html";
    return;
  }

  // Extraímos todas as consultas de um usuário
  const listaConsultas = usuario.consultas || [];

  // Ordena as consultas: futuras primeiro (mais próximas) e passadas por último (mais antigas no fim)
  const agora = new Date();
  listaConsultas.sort((a, b) => {
    const dataA = new Date(a.dataInicio);
    const dataB = new Date(b.dataInicio);
    const isAFutura = dataA >= agora;
    const isBFutura = dataB >= agora;

    // Se uma é futura e a outra passada, a futura tem prioridade (-1)
    if (isAFutura && !isBFutura) return -1;
    if (!isAFutura && isBFutura) return 1;

    // Se ambas são futuras, a mais próxima de hoje vem primeiro
    if (isAFutura && isBFutura) return dataA - dataB;
    // Se ambas são passadas, a mais recente vem primeiro para a mais antiga ficar no final
    return dataB - dataA;
  });

  // Atualiza o storage com a nova ordem para que os índices de exclusão/reagendamento funcionem corretamente
  save("login", usuario);

  const tbody = document.getElementById("consultas-tbody");

  if (!tbody) return;

  // Limpa as linhas estáticas de exemplo do HTML
  tbody.innerHTML = "";

  const fragment = document.createDocumentFragment();

  listaConsultas.forEach((consulta, index) => {
    const tr = document.createElement("tr");

    // Formata o status para exibição e adiciona uma classe CSS correspondente 
    const statusClass = consulta.status ? consulta.status.toUpperCase() : "";

    tr.innerHTML = `
      <td>${consulta.especialidade || "Geral"}</td>
      <td>${consulta.medico || "Médico não especificado"}</td>
      <td>${Intl.DateTimeFormat("pt-BR").format(new Date(consulta.dataInicio))}</td>
      <td><span class="status ${statusClass}">${consulta.status}</span></td>
      <td>${consulta.endereco}</td>
      <td class="d-flex justify-content-between align-items-center">
        <a href="#" title="Abrir Localização da Consulta" class="btn-abrir" data-index="${index}">
          <img src="assets/abrir.svg" alt="Abrir" width="20" height="20" />
        </a>
        <a href="#" title="Reagendar">
          <img src="assets/reagendar.svg" alt="Reagendar" width="20" height="20" />
        </a>
        <a href="#" title="Cancelar" class="btn-cancelar" data-index="${index}">
          <img src="assets/cancelar.svg" alt="Cancelar" width="20" height="20" />
        </a>
      </td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);

  // Configura o evento de clique apenas uma vez (usando delegação de eventos no tbody)
  if (!tbody.dataset.listener) {
    tbody.addEventListener("click", (e) => {
      const target = e.target;

      // Lógica para Abrir Localização
      const btnAbrir = target.closest(".btn-abrir");
      if (btnAbrir) {
        e.preventDefault();
        const index = btnAbrir.dataset.index;
        const endereco = listaConsultas[index]?.endereco;
        if (endereco) {
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
          window.open(url, "_blank");
        }
      }

      // Lógica para Cancelar
      const btnCancelar = target.closest(".btn-cancelar");
      if (btnCancelar && confirm("Deseja realmente cancelar esta consulta?")) {
        e.preventDefault();
        const index = btnCancelar.dataset.index;
        const user = get("login");
        const todosUsuarios = get("usuarios") || [];

        // 1. Remove a consulta do array do usuário logado
        user.consultas.splice(index, 1);
        save("login", user);

        // 2. Sincroniza com a lista global de usuários para persistência
        const userIdx = todosUsuarios.findIndex((u) => u.email === user.email);
        if (userIdx !== -1) {
          todosUsuarios[userIdx] = user;
          save("usuarios", todosUsuarios);
        }

        // 3. Atualiza a interface
        consultas();
      }
    });
    tbody.dataset.listener = "true";
  }
};

document.addEventListener("DOMContentLoaded", consultas);