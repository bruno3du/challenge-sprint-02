// ------------------------------
// Função de validação do perfil
// Usa funções já existentes do formRegister.js
// ------------------------------
function validarPerfil() {
  const email = document.getElementById("email");
  const cpf = document.getElementById("cpf");
  const nome = document.getElementById("firstName");
  const sobrenome = document.getElementById("lastName");

  // Executa validações básicas
  const validacoes = [
    validateRequired(nome, "Informe o primeiro nome."), // Verifica se o nome foi preenchido
    validateRequired(sobrenome, "Informe o sobrenome."), // Verifica se o sobrenome foi preenchido
    validateEmail(email), // Valida formato do email
    validateCpf(cpf), // Valida CPF com 11 dígitos
  ];

  // Retorna true se todas as validações passaram
  return !validacoes.includes(false);
}

// ------------------------------
// Função para coletar dados do formulário
// ------------------------------
function coletarDados() {
  const dados = {
    nome: document.getElementById("firstName").value,
    sobrenome: document.getElementById("lastName").value,
    cpf: document.getElementById("cpf").value,
    rg: document.getElementById("rg").value,
    nascimento: document.getElementById("dob").value,
    email: document.getElementById("email").value,
    endereco: document.getElementById("address").value,
    cidade: document.getElementById("city").value,
    estado: document.getElementById("state").value,
    cep: document.getElementById("zip").value,
  };

  console.log("Dados coletados:", dados);
  return dados;
}

// ------------------------------
// Evento do botão Atualizar
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const btnAtualizar = document.querySelector(".btn-primary");

  btnAtualizar.addEventListener("click", (e) => {
    e.preventDefault();

    // Primeiro valida os campos
    if (!validarPerfil()) {
      alert("Revise os campos destacados.");
      return;
    }

    // Depois coleta os dados
    const dados = coletarDados();

    // Envia para o backend via Fetch API
    fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Dados atualizados com sucesso!");
        console.log("Resposta do servidor:", data);
      })
      .catch((error) => console.error("Erro ao enviar dados:", error));
  });
});

// ------------------------------
// Automatização dos ícones da sidebar
// Cada ícone redireciona para uma página específica
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".bi-grid-3x3-gap").addEventListener("click", () => {
    window.location.href = "/dashboard.html"; // Ícone de Dashboard
  });

  document.querySelector(".bi-clock").addEventListener("click", () => {
    window.location.href = "/historico.html"; // Ícone de Histórico
  });

  document.querySelector(".bi-people").addEventListener("click", () => {
    window.location.href = "/usuarios.html"; // Ícone de Usuários
  });

  document.querySelector(".bi-person").addEventListener("click", () => {
    window.location.href = "/perfil.html"; // Ícone de Perfil
  });

  document.querySelector(".bi-gear").addEventListener("click", () => {
    window.location.href = "/configuracoes.html"; // Ícone de Configurações
  });
});
