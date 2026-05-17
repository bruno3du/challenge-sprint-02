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
// Usa funções já existentes do formRegister.js
// ------------------------------
function validarPerfil() {
  const email = document.getElementById("email");
  const cpf = document.getElementById("cpf");
  const rg = document.getElementById("rg");
  const nome = document.getElementById("firstName");
  const sobrenome = document.getElementById("lastName");
  const nascimento = document.getElementById("dob");

  // Executa validações básicas
  const validacoes = [
    validateRequired(nome, "Informe o primeiro nome."),   // Verifica se o nome foi preenchido
    validateRequired(sobrenome, "Informe o sobrenome."),  // Verifica se o sobrenome foi preenchido
    validateEmail(email),                                 // Valida formato do email
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
  const cpf = document.getElementById("cpf");
  const rg = document.getElementById("rg");
  const cep = document.getElementById("zip");
  const email = document.getElementById("email")

  // CPF
  cpf.addEventListener("input", () => {
    let value = cpf.value.replace(/\D/g, "");
    value = value.slice(0, 11);
    value = value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    cpf.value = value;
  });  


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

    // Aguarda salvar antes de redirecionar
    setTimeout(() => {
      window.location.href = "/home.html";
    }, 1000);
  });
});

// ------------------------------
// Carrega dados salvos
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

  const usuario = get("perfil") || get("login");

  if (!usuario) return;

  document.getElementById("firstName").value =
    usuario.nome || "";

  document.getElementById("lastName").value =
    usuario.sobrenome || "";

  document.getElementById("cpf").value =
    usuario.cpf || "";

  document.getElementById("rg").value =
    usuario.rg || "";

  document.getElementById("dob").value =
    usuario.nascimento || "";

  document.getElementById("email").value =
    usuario.email || "";

  document.getElementById("address").value =
    usuario.endereco || "";

  document.getElementById("city").value =
    usuario.cidade || "";

  document.getElementById("state").value =
    usuario.estado || "";

  document.getElementById("zip").value =
    usuario.cep || "";

});

