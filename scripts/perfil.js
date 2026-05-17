// ------------------------------
// Perfil: carrega usuário logado, valida e atualiza no localStorage
// Depende de: saveUpdateDelete.js (save/get) e formRegister.js (validações)
// ------------------------------

const CAMPOS_PERFIL = [
  "firstName",
  "lastName",
  "cpf",
  "rg",
  "dob",
  "email",
  "address",
  "city",
  "state",
  "zip",
];

const MAPA_CAMPO_USUARIO = {
  firstName: "nome",
  lastName: "sobrenome",
  cpf: "cpf",
  rg: "rg",
  dob: "dataNascimento",
  email: "email",
  address: "endereco",
  city: "cidade",
  state: "estado",
  zip: "cep",
};

function getInput(id) {
  return document.getElementById(id);
}

function carregarPerfil() {
  const usuario = get("login");
  if (!usuario) {
    alert("Nenhum usuário logado.");
    window.location.href = "./index.html";
    return null;
  }

  CAMPOS_PERFIL.forEach((id) => {
    const input = getInput(id);
    if (!input) return;
    const chave = MAPA_CAMPO_USUARIO[id];
    input.value = usuario[chave] ?? "";
  });

  const nomeCompleto = [usuario.nome, usuario.sobrenome].filter(Boolean).join(" ");
  const headerNome = document.getElementById("profileName");
  const headerEmail = document.getElementById("profileEmail");
  const headerAvatar = document.getElementById("profileAvatar");
  if (headerNome) headerNome.textContent = nomeCompleto || usuario.nome || "";
  if (headerEmail) headerEmail.textContent = usuario.email || "";
  if (headerAvatar && (nomeCompleto || usuario.nome)) {
    headerAvatar.textContent = (nomeCompleto || usuario.nome).trim().charAt(0).toUpperCase();
  }

  return usuario;
}

function getErrorEl(input) {
  const group = input.closest(".form-group");
  if (!group) return null;
  let el = group.querySelector(".field-error");
  if (!el) {
    el = document.createElement("span");
    el.className = "field-error";
    group.appendChild(el);
  }
  return el;
}

function setFieldError(id, mensagem) {
  const input = getInput(id);
  if (!input) return;
  const errEl = getErrorEl(input);
  input.classList.toggle("is-invalid", Boolean(mensagem));
  if (errEl) errEl.textContent = mensagem || "";
}

function limparErros() {
  CAMPOS_PERFIL.forEach((id) => setFieldError(id, ""));
}

function validarPerfil() {
  limparErros();
  const nome = getInput("firstName").value.trim();
  const sobrenome = getInput("lastName").value.trim();
  const email = getInput("email").value.trim();
  const cpf = getInput("cpf").value.replace(/\D/g, "");
  const endereco = getInput("address").value.trim();

  let ok = true;
  if (!nome) { setFieldError("firstName", "Informe o primeiro nome."); ok = false; }
  if (!sobrenome) { setFieldError("lastName", "Informe o sobrenome."); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError("email", "Digite um e-mail válido."); ok = false; }
  if (cpf.length !== 11) { setFieldError("cpf", "Digite um CPF com 11 números."); ok = false; }
  if (!endereco) { setFieldError("address", "Informe o endereço."); ok = false; }

  return ok;
}

function mostrarToast(mensagem, tipo = "success") {
  const toastEl = document.getElementById("perfilToast");
  const body = document.getElementById("perfilToastBody");
  if (!toastEl || !body) {
    alert(mensagem);
    return;
  }
  body.textContent = mensagem;
  toastEl.classList.remove("bg-success", "bg-danger");
  toastEl.classList.add(tipo === "error" ? "bg-danger" : "bg-success");

  if (window.bootstrap && bootstrap.Toast) {
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 }).show();
  } else {
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 3000);
  }
}

function coletarDados() {
  const dados = {};
  CAMPOS_PERFIL.forEach((id) => {
    const input = getInput(id);
    if (!input) return;
    dados[MAPA_CAMPO_USUARIO[id]] = input.value.trim();
  });
  return dados;
}

function atualizarUsuarioNoStorage(usuarioOriginal, novosDados) {
  const usuarios = get("usuarios") || [];
  const idx = usuarios.findIndex(
    (u) => u.cpf === usuarioOriginal.cpf || u.email === usuarioOriginal.email,
  );

  const atualizado = { ...usuarioOriginal, ...novosDados };

  if (idx >= 0) {
    usuarios[idx] = { ...usuarios[idx], ...novosDados };
    save("usuarios", usuarios);
  }

  save("login", atualizado);
  return atualizado;
}

document.addEventListener("DOMContentLoaded", () => {
  let usuarioAtual = carregarPerfil();
  if (!usuarioAtual) return;

  const cpfInput = getInput("cpf");
  if (cpfInput && typeof formatCpf === "function") {
    cpfInput.addEventListener("input", () => {
      cpfInput.value = formatCpf(cpfInput.value);
    });
  }

  const btn = document.getElementById("btnAtualizar");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!validarPerfil()) return;

    const dados = coletarDados();
    usuarioAtual = atualizarUsuarioNoStorage(usuarioAtual, dados);
    carregarPerfil();
    mostrarToast("Perfil atualizado com sucesso!");
  });

  CAMPOS_PERFIL.forEach((id) => {
    const input = getInput(id);
    if (!input) return;
    input.addEventListener("input", () => setFieldError(id, ""));
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        btn.click();
      }
    });
  });
});

