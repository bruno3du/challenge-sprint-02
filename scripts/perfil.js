//-----------------------------
// Validação da data
//-----------------------------
function validarData (input){
  
  if (!input.value) {

    setFieldError(
      input,
      "Selecione uma data."
    );

    return false;
  }

  setFieldError(input, "");

  return true;
}

// Validação do RG
function validateRg(input) {

  const value = input.value.toUpperCase();
  const regex = /^\d{2}\.\d{3}\.\d{3}-[0-9X]$/;
  if (!regex.test(value)) {

    setFieldError(
      input,
      "Digite um RG valido."
    );

    return false;
  }

  setFieldError(input, "");

  return true;
}

// ------------------------------
// Função de validação do perfil
// Usa algumas funções já existentes do formRegister.js
// ------------------------------
function validarPerfil() {
  const email = document.getElementById("email");
  const cpf = document.getElementById("cpf");
  const rg = document.getElementById("rg")
  const nome = document.getElementById("firstName");
  const sobrenome = document.getElementById("lastName");
  const nascimento = document.getElementById("dob");

  // Executa validações básicas
  const validacoes = [
    validateRequired(nome, "Informe o primeiro nome."),
    validateRequired(sobrenome, "Informe o sobrenome."),
    validateEmail(email),
    validateCpf(cpf),
    validateRg(rg),
    validarData(nascimento)
  ];

  // Retorna true se todas as validações passaram
  return !validacoes.includes(false);
}

// Formata data para padrão BR
function formatarDataBR(data) {

  if (!data) return "";

  const partes = data.split("-");

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
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
    cep: document.getElementById("zip").value
  };

  console.log("Dados coletados:", dados);

  return dados;
}

// ------------------------------
// Evento do botão Atualizar
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const btnAtualizar = document.getElementById("update-profile-btn");
  const rg = document.getElementById("rg");
  const nascimento = document.getElementById("dob");
  const estado = document.getElementById("state");
  const cep = document.getElementById("zip");
  const email = document.getElementById("email")

  // RG
  rg.addEventListener("input", () => {
    let value = rg.value.toUpperCase().replace(/[^0-9X]/g, "");
    
    value = value.slice(0, 9);
    
    value = value
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})([0-9X])$/, "$1-$2");

    rg.value = value;
  });

  

  // CEP
  cep.addEventListener("input", () => {
    let value = cep.value.replace(/\D/g, "").slice(0, 8);

    value = value.replace(/(\d{5})(\d)/, "$1-$2");

    cep.value = value;
  });

  //EMAIL
  email.addEventListener("input", () => {
    validateEmail(email);
  });


  btnAtualizar.addEventListener("click", (e) => {
    e.preventDefault();

    // Primeiro valida os campos
    if (!validarPerfil()) {
      alert("Revise os campos destacados.");
      return;
    }

    // Depois coleta os dados
    const dados = coletarDados();

    // Salva no localStorage
    save("perfil", dados);

    save("login", dados);

    // Atualiza cabeçalho
    document.querySelector(".profile-user h2").textContent =
      `${dados.nome} ${dados.sobrenome}`;

    document.querySelector(".profile-user p").textContent =
      dados.email;

    // Atualiza avatar
    const avatarLetter = dados.nome
      ? dados.nome.charAt(0).toUpperCase()
      : "A";

    document.querySelector(".profile-avatar").textContent =
      avatarLetter;

    document.querySelector(".avatar").textContent =
      avatarLetter;

    alert("Dados atualizados com sucesso!");

    window.location.href = "/home.html";},500);
});

// ------------------------------
// Carrega dados do usuário
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const usuario = get("perfil") || get("login");

  if (!usuario) return;

  // Preenche campos automaticamente
  document.getElementById("firstName").value =
    usuario.nome || "";

  document.getElementById("lastName").value =
    usuario.sobrenome || "";

  document.getElementById("email").value =
    usuario.email || "";

  document.getElementById("cpf").value =
    usuario.cpf || "";

  document.getElementById("dob").value =
    usuario.nascimento || "";

  document.getElementById("address").value =
    usuario.endereco || "";
  
  document.getElementById("rg").value =
    usuario.rg || "";

  document.getElementById("city").value =
    usuario.cidade || "";

  document.getElementById("state").value =
    usuario.estado || "";

  document.getElementById("zip").value =
    usuario.cep || "";

  // Atualiza cabeçalho
  document.querySelector(".profile-user h2").textContent =
    `${usuario.nome} ${usuario.sobrenome}`;

  document.querySelector(".profile-user p").textContent =
    usuario.email;

  // Atualiza avatar
  const avatarLetter = usuario.nome
    ? usuario.nome.charAt(0).toUpperCase()
    : "A";

  document.querySelector(".profile-avatar").textContent =
    avatarLetter;

  document.querySelector(".avatar").textContent =
    avatarLetter;
});

// ------------------------------
// Máscara automática do CPF
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const cpf = document.getElementById("cpf");

  if (!cpf) return;

  cpf.addEventListener("input", () => {
    cpf.value = formatCpf(cpf.value);
  });
});

// ------------------------------
// Automatização dos ícones da sidebar
// Cada ícone redireciona para uma página específica
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  // Dashboard
  document
    .querySelector(".bi-grid-fill")
    .addEventListener("click", () => {
      window.location.href = "/dashboard.html";
    });

  // Histórico
  document
    .querySelector(".bi-clock-history")
    .addEventListener("click", () => {
      window.location.href = "/historico.html";
    });

  // Usuários
  document
    .querySelector(".bi-people")
    .addEventListener("click", () => {
      window.location.href = "/usuarios.html";
    });

  // Mensagens
  document
    .querySelector(".bi-chat-left")
    .addEventListener("click", () => {
      window.location.href = "/perfil.html";
    });

  // Configurações
  document
    .querySelector(".bi-gear")
    .addEventListener("click", () => {
      window.location.href = "/configuracoes.html";
    });

}); 