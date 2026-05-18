const seed = () => {
  const usuarios = [
    {
      nome: "John Doe",
      sobrenome: "",
      email: "john.doe@example.com",
      senha: "12345678",
      cpf: "12345678900",
      rg: "",
      dataNascimento: "",
      endereco: "Rua Local, 300",
      cidade: "",
      estado: "",
      cep: "",
      plano: "basic",
      consultas: [
        {
          medico: "Dr. Smith",
          especialidade: especialidade.Cardiologia,
          dataInicio: "2026-05-07T10:00:27.502Z",
          dataFim: "2026-05-07T11:00:27.502Z",
          paciente: "John Doe",
          status: "agendado",
          endereco: "Rua Teste, 123",
        },
        {
          medico: "Dr. Johnson",
          especialidade: especialidade.Psiquiatria,
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
    },
    {
      nome: "Maria Silva",
      sobrenome: "",
      email: "maria.silva@example.com",
      senha: "12345678",
      cpf: "23456789011",
      rg: "",
      dataNascimento: "",
      endereco: "Av. Paulista, 1000",
      cidade: "",
      estado: "",
      cep: "",
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
      sobrenome: "",
      email: "carlos.souza@example.com",
      senha: "12345678",
      cpf: "34567890122",
      rg: "",
      dataNascimento: "",
      endereco: "Rua das Flores, 45",
      cidade: "",
      estado: "",
      cep: "",
      plano: "basic",
      consultas: [],
      premiacoes: [],
    },
    {
      nome: "Ana Pereira",
      sobrenome: "",
      email: "ana.pereira@example.com",
      senha: "12345678",
      cpf: "45678901233",
      rg: "",
      dataNascimento: "",
      endereco: "Rua XV de Novembro, 200",
      cidade: "",
      estado: "",
      cep: "",
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
      sobrenome: "",
      email: "pedro.santos@example.com",
      senha: "12345678",
      cpf: "56789012344",
      rg: "",
      dataNascimento: "",
      endereco: "Rua Itapeva, 80",
      cidade: "",
      estado: "",
      cep: "",
      plano: "basic",
      consultas: [],
      premiacoes: [],
    },
  ];

  const gerarDispo = (ano, mes, dias, horarios) =>
    dias.flatMap((dia) =>
      horarios.map((h) => {
        const pad = (n) => String(n).padStart(2, "0");
        return {
          dataInicio: `${ano}-${pad(mes)}-${pad(dia)}T${pad(h)}:00:00.000Z`,
          dataFim: `${ano}-${pad(mes)}-${pad(dia)}T${pad(h + 1)}:00:00.000Z`,
        };
      }),
    );

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
        ...gerarDispo(2026, 5, [7, 12, 18, 21, 25, 28], [13, 14, 15]),
        ...gerarDispo(2026, 6, [1, 4, 9, 15, 22, 29], [13, 14, 15, 16]),
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
        ...gerarDispo(2026, 5, [8, 14, 19, 22, 26, 29], [9, 10, 11]),
        ...gerarDispo(2026, 6, [2, 5, 10, 17, 24], [9, 10, 11]),
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
        ...gerarDispo(2026, 5, [10, 15, 19, 26], [9, 10, 11]),
        ...gerarDispo(2026, 6, [3, 11, 18, 25], [9, 10, 11]),
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
        ...gerarDispo(2026, 5, [15, 18, 22, 27, 29], [14, 15, 16]),
        ...gerarDispo(2026, 6, [4, 8, 15, 22, 30], [14, 15, 16]),
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
        ...gerarDispo(2026, 5, [12, 18, 21, 26, 28], [8, 9, 10]),
        ...gerarDispo(2026, 6, [1, 9, 16, 23, 30], [8, 9, 10]),
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
        ...gerarDispo(2026, 5, [13, 20, 25, 27], [13, 14]),
        ...gerarDispo(2026, 6, [5, 12, 19, 26], [13, 14]),
      ],
    },
    {
      nome: "Dra. Rocha",
      email: "dra.rocha@example.com",
      senha: "123456",
      cpf: "32109876544",
      especialidade: especialidade.Cardiologia,
      telefone: "11987654327",
      crm: "78901",
      disponibilidades: [
        ...gerarDispo(2026, 5, [14, 20, 27], [10, 11]),
        ...gerarDispo(2026, 6, [3, 10, 17, 24], [10, 11]),
      ],
    },
    {
      nome: "Dr. Mendes",
      email: "dr.mendes@example.com",
      senha: "123456",
      cpf: "21098765433",
      especialidade: especialidade.Psiquiatria,
      telefone: "11987654328",
      crm: "89012",
      disponibilidades: [
        ...gerarDispo(2026, 5, [11, 18, 25, 28], [16, 17]),
        ...gerarDispo(2026, 6, [4, 11, 18, 25], [16, 17]),
      ],
    },
    {
      nome: "Dra. Nunes",
      email: "dra.nunes@example.com",
      senha: "123456",
      cpf: "10987654322",
      especialidade: especialidade.Pediatria,
      telefone: "11987654329",
      crm: "90123",
      disponibilidades: [
        ...gerarDispo(2026, 5, [19, 22, 26, 29], [15, 16]),
        ...gerarDispo(2026, 6, [2, 8, 16, 23], [15, 16]),
      ],
    },
    {
      nome: "Dr. Ferreira",
      email: "dr.ferreira@example.com",
      senha: "123456",
      cpf: "09876543211",
      especialidade: especialidade.Ortopedia,
      telefone: "11987654330",
      crm: "01234",
      disponibilidades: [
        ...gerarDispo(2026, 5, [20, 25, 28], [11, 12]),
        ...gerarDispo(2026, 6, [5, 12, 19, 26], [11, 12]),
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
