const consultas = () => {
  const usuario = get("login");
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

  listaConsultas.forEach((consulta, index) => {
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
        <a href="#" title="Abrir" class="btn-abrir" data-index="${index}">
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