const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFieldWrapper(input) {
  return input.closest(".input-group") || input.closest(".field");
}

function setFieldError(input, message) {
  const wrapper = getFieldWrapper(input);
  const error = wrapper?.querySelector(".field-error");

  if (!wrapper || !error) return;

  wrapper.classList.toggle("is-invalid", Boolean(message));
  error.textContent = message;
}

function setFormMessage(form, message, type) {
  const messageElement = form.querySelector(".form-message");
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.classList.remove("is-success", "is-error");

  if (type) {
    messageElement.classList.add(`is-${type}`);
  }
}

function hasMinLength(value, length) {
  return value.trim().length >= length;
}

function validateRequired(input, message = "Campo obrigatorio.") {
  const isValid = input.value.trim().length > 0;
  setFieldError(input, isValid ? "" : message);
  return isValid;
}

function validateEmail(input) {
  const value = input.value.trim();

  if (!value) {
    setFieldError(input, "Informe seu email.");
    return false;
  }

  if (!emailRegex.test(value)) {
    setFieldError(input, "Digite um email valido.");
    return false;
  }

  setFieldError(input, "");
  return true;
}

function validatePassword(input) {
  if (!hasMinLength(input.value, 8)) {
    setFieldError(input, "Use pelo menos 8 caracteres.");
    return false;
  }

  setFieldError(input, "");
  return true;
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function formatCpf(value) {
  const numbers = onlyNumbers(value).slice(0, 11);

  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validateCpf(input) {
  const numbers = onlyNumbers(input.value);

  if (numbers.length !== 11) {
    setFieldError(input, "Digite um CPF com 11 numeros.");
    return false;
  }

  setFieldError(input, "");
  return true;
}

function initLoginForm() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  const email = form.querySelector("#email");
  const password = form.querySelector("#password");

  email.addEventListener("input", () => setFieldError(email, ""));
  password.addEventListener("input", () => setFieldError(password, ""));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setFormMessage(form, "Revise os campos destacados.", "error");
      return;
    }

    setFormMessage(form, "Login validado com sucesso.", "success");
  });
}

function initRegisterForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const firstName = form.querySelector("#first-name");
  const lastName = form.querySelector("#second-name");
  const email = form.querySelector("#register-email");
  const cpf = form.querySelector("#cpf");
  const address = form.querySelector("#address");
  const password = form.querySelector("#create-password");
  const repeatPassword = form.querySelector("#repeat-password");
  const plan = form.querySelector("#plan");

  cpf.addEventListener("input", () => {
    cpf.value = formatCpf(cpf.value);
    setFieldError(cpf, "");
  });

  form.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", () => setFieldError(field, ""));
    field.addEventListener("change", () => setFieldError(field, ""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const validations = [
      validateRequired(firstName, "Informe o primeiro nome."),
      validateRequired(lastName, "Informe o sobrenome."),
      validateEmail(email),
      validateCpf(cpf),
      validateRequired(address, "Informe o endereco."),
      validatePassword(password),
      validateRequired(plan, "Escolha um plano."),
    ];

    if (repeatPassword.value !== password.value || !repeatPassword.value) {
      setFieldError(repeatPassword, "As senhas precisam ser iguais.");
      validations.push(false);
    } else {
      setFieldError(repeatPassword, "");
    }

    if (validations.includes(false)) {
      setFormMessage(form, "Revise os campos destacados.", "error");
      return;
    }

    setFormMessage(form, "Cadastro validado com sucesso.", "success");
    form.reset();
  });
}

initLoginForm();
initRegisterForm();
