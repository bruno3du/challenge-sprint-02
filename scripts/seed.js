
const seed = () => {
  const usuarios = [
    {
      nome: "John Doe",
      email: "john.doe@example.com",
      senha: "12345678",
      cpf: "12345678900",
      endereco: "Rua Local, 300",
      plano: "basic",
      consultas: [
        {
          medico: "Dr. Smith",
          especialidade: especialidade.Cardiologia,
          dataInicio: "2026-05-07T10:00:27.502Z",
          dataFim: "2026-05-07T11:00:27.502Z",
          paciente: "John Doe",
          status: "Agendado",
          endereco: "Rua Teste, 123",
        },
        {
          medico: "Dr. Johnson",
          especialidade: especialidade.Psiquiatria,
          dataInicio: "2026-05-07T11:00:27.502Z",
          dataFim: "2026-05-07T12:00:27.502Z",
          paciente: "John Doe",
          status: "Agendado",
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
    },
    {
      nome: "Maria Silva",
      email: "maria.silva@example.com",
      senha: "12345678",
      cpf: "23456789011",
      endereco: "Av. Paulista, 1000",
      plano: "premium",
      consultas: [
        {
          medico: "Dra. Oliveira",
          especialidade: especialidade.Dermatologia,
          dataInicio: "2026-05-10T09:00:00.000Z",
          dataFim: "2026-05-10T10:00:00.000Z",
          paciente: "Maria Silva",
          status: "agendado",
          endereco: "Av. Brasil, 500",
        },
      ],
      premiacoes: [
        {
          dataInicio: "2026-04-01T10:00:00.000Z",
          dataFim: "2026-04-01T10:00:00.000Z",
          valor: 250,
          status: "pago",
        },
      ],
    },
    {
      nome: "Carlos Souza",
      email: "carlos.souza@example.com",
      senha: "12345678",
      cpf: "34567890122",
      endereco: "Rua das Flores, 45",
      plano: "basic",
      consultas: [],
      premiacoes: [],
    },
    {
      nome: "Ana Pereira",
      email: "ana.pereira@example.com",
      senha: "12345678",
      cpf: "45678901233",
      endereco: "Rua XV de Novembro, 200",
      plano: "premium",
      consultas: [
        {
          medico: "Dr. Lima",
          especialidade: especialidade.Ortopedia,
          dataInicio: "2026-05-15T14:00:00.000Z",
          dataFim: "2026-05-15T15:00:00.000Z",
          paciente: "Ana Pereira",
          status: "agendado",
          endereco: "Rua Augusta, 900",
        },
      ],
      premiacoes: [],
    },
    {
      nome: "Pedro Santos",
      email: "pedro.santos@example.com",
      senha: "12345678",
      cpf: "56789012344",
      endereco: "Rua Itapeva, 80",
      plano: "basic",
      consultas: [],
      premiacoes: [],
    },
  ];

  const medicos = [
    {
      nome: "Dr. Smith",
      email: "dr.smith@example.com",
      senha: "123456",
      cpf: "98765432100",
      especialidade: especialidade.Cardiologia,
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
    },
    {
      nome: "Dr. Johnson",
      email: "dr.johnson@example.com",
      senha: "123456",
      cpf: "87654321099",
      especialidade: especialidade.Psiquiatria,
      telefone: "11987654322",
      crm: "23456",
      disponibilidades: [
        {
          dataInicio: "2026-05-08T09:00:00.000Z",
          dataFim: "2026-05-08T10:00:00.000Z",
        },
        {
          dataInicio: "2026-05-08T10:00:00.000Z",
          dataFim: "2026-05-08T11:00:00.000Z",
        },
      ],
    },
    {
      nome: "Dra. Oliveira",
      email: "dra.oliveira@example.com",
      senha: "123456",
      cpf: "76543210988",
      especialidade: especialidade.Dermatologia,
      telefone: "11987654323",
      crm: "34567",
      disponibilidades: [
        {
          dataInicio: "2026-05-10T09:00:00.000Z",
          dataFim: "2026-05-10T10:00:00.000Z",
        },
        {
          dataInicio: "2026-05-10T10:00:00.000Z",
          dataFim: "2026-05-10T11:00:00.000Z",
        },
      ],
    },
    {
      nome: "Dr. Lima",
      email: "dr.lima@example.com",
      senha: "123456",
      cpf: "65432109877",
      especialidade: especialidade.Ortopedia,
      telefone: "11987654324",
      crm: "45678",
      disponibilidades: [
        {
          dataInicio: "2026-05-15T14:00:00.000Z",
          dataFim: "2026-05-15T15:00:00.000Z",
        },
        {
          dataInicio: "2026-05-15T15:00:00.000Z",
          dataFim: "2026-05-15T16:00:00.000Z",
        },
      ],
    },
    {
      nome: "Dra. Costa",
      email: "dra.costa@example.com",
      senha: "123456",
      cpf: "54321098766",
      especialidade: especialidade.Pediatria,
      telefone: "11987654325",
      crm: "56789",
      disponibilidades: [
        {
          dataInicio: "2026-05-12T08:00:00.000Z",
          dataFim: "2026-05-12T09:00:00.000Z",
        },
      ],
    },
    {
      nome: "Dr. Almeida",
      email: "dr.almeida@example.com",
      senha: "123456",
      cpf: "43210987655",
      especialidade: especialidade.Neurologia,
      telefone: "11987654326",
      crm: "67890",
      disponibilidades: [
        {
          dataInicio: "2026-05-13T13:00:00.000Z",
          dataFim: "2026-05-13T14:00:00.000Z",
        },
      ],
    },
  ];

  const clinicas = [
    {
      nome: "Clínica Saúde",
      endereco: "Rua Teste, 123",
    },
    {
      nome: "Clínica Vida",
      endereco: "Av. Brasil, 500",
    },
    {
      nome: "Centro Médico Bem-Estar",
      endereco: "Rua Augusta, 900",
    },
    {
      nome: "Clínica Esperança",
      endereco: "Av. Paulista, 1500",
    },
  ];

  const usuariosExistentes = get("usuarios") || [];
  if (usuariosExistentes?.find((user) => user.email === usuarios[0].email)) {
    return;
  }

  saveBulk("usuarios", usuarios);
  saveBulk("medicos", medicos);
  saveBulk("clinica", clinicas);
};

window.onload = seed;
