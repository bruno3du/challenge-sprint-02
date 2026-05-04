const seed = () => {
  const instrutor = [
    {
      nome: "John Doe",
      email: "john.doe@example.com",
      senha: "123456",
      cpf: "12345678900",
      endereco: "Rua Teste, 123",
      plano: "basic",
      consultas: [
        {
          data: "2026-01-01",
          horario: "10:00",
          paciente: "John Doe",
          status: "agendado",
          endereco: "Rua Teste, 123",
        },
        {
          data: "2026-01-01",
          horario: "10:00",
          paciente: "John Doe",
          status: "agendado",
          endereco: "Rua Teste, 123",
        },
      ],
      agendamentos: [
        {
          data: "2026-01-01",
          horario: "10:00",
          paciente: "John Doe",
          status: "agendado",
        },
      ],
      premiacoes: [
        {
          data: "2026-01-01",
          valor: 100,
          status: "pago",
        },
      ],
    },
  ];

  const usuarios = get("usuarios");

  if (usuarios?.find((usuario) => usuario.email === instrutor[0].email)) {
    return;
  }

  saveBulk("usuarios", instrutor);
};

window.onload = seed;
