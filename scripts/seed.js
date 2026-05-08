const seed = () => {
  const usuario = {
    nome: "John Doe",
    email: "john.doe@example.com",
    senha: "12345678",
    cpf: "12345678900",
    endereco: "Rua Local, 300",
    plano: "basic",
    consultas: [
      {
        medico: "Dr. Smith",
        especialidade: "Cardiologia",
        dataInicio: "2026-05-07T10:00:27.502Z",
        dataFim: "2026-05-07T11:00:27.502Z",
        paciente: "John Doe",
        status: "agendado",
        endereco: "Rua Teste, 123",
      },
      {
        medico: "Dr. Johnson",
        especialidade: "Psiquiatria",
        dataInicio: "2026-05-07T11:00:27.502Z",
        dataFim: "2026-05-07T12:00:27.502Z",
        paciente: "John Doe",
        status: "agendado",
        endereco: "Rua Teste, 123",
      },
    ],
    premiacoes: [
      {
        dataInicio: "2026-05-07T10:00:27.502Z",
        dataFim: "2026-05-07T10:00:27.502Z",
        valor: 100,
        status: "pago",
      },
    ],
  };

  const medico = {
    nome: "Dr. Smith",
    email: "dr.smith@example.com",
    senha: "123456",
    cpf: "98765432100",
    especialidade: "Cardiologia",
    telefone: "11987654321",
    crm: "12345",
    disponibilidades: [
      {
        dataInicio: "2026-05-07T10:00:27.502Z",
        dataFim: "2026-05-07T11:00:27.502Z",
      },
      {
        dataInicio: "2026-05-07T11:00:27.502Z",
        dataFim: "2026-05-07T12:00:27.502Z",
      },
    ],
  };

  const clinica = {
    nome: "Clínica Saúde",
    endereco: "Rua Teste, 123",
  };
    
const usuarios = get("usuarios") || [];
  if (usuarios?.find((user) => user.email === usuario.email)) {
    return;
  }

  saveBulk("usuarios", [usuario]);
};

window.onload = seed;
