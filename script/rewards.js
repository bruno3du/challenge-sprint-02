document.addEventListener("DOMContentLoaded", () => {
  const pointsEl = document.querySelector(".points-value");

  if (pointsEl) {
    let points = localStorage.getItem("userPoints");
    if (points) {
      points = parseInt(points, 10);
    } else {
      points = parseInt(pointsEl.textContent.replace(/,/g, ""), 10);
      localStorage.setItem("userPoints", points);
    }
    pointsEl.textContent = points.toLocaleString("en-US");

    let current = 0;
    const step = Math.ceil(points / 100);
    const interval = setInterval(() => {
      current += step;
      if (current >= points) {
        current = points;
        clearInterval(interval);
      }
      pointsEl.textContent = current.toLocaleString("en-US");
    }, 20);
  }

  const toggleBtn = document.getElementById("dark-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const icon = toggleBtn.querySelector("i");
      if (document.body.classList.contains("dark-mode")) {
        icon.classList.replace("bi-moon", "bi-sun");
      } else {
        icon.classList.replace("bi-sun", "bi-moon");
      }
    });
  }

  document.querySelectorAll(".redeem-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      let currentPoints = parseInt(localStorage.getItem("userPoints"), 10);
      const costText = btn.nextElementSibling.textContent;
      const cost = parseInt(costText.replace(/\D/g, ""), 10);

      if (currentPoints >= cost) {
        currentPoints -= cost;
        localStorage.setItem("userPoints", currentPoints);
        if (pointsEl) pointsEl.textContent = currentPoints.toLocaleString("en-US");
        alert(`Recompensa resgatada! Você gastou ${cost} pontos.`);
      } else {
        alert("Você não tem pontos suficientes!");
      }
    });
  });

  document.querySelectorAll(".reward-card").forEach(card => {
    card.addEventListener("mouseenter", () => card.classList.add("expanded"));
    card.addEventListener("mouseleave", () => card.classList.remove("expanded"));
  });

  const resetBtn = document.getElementById("reset-points");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const defaultPoints = 3000;
      localStorage.setItem("userPoints", defaultPoints);
      if (pointsEl) pointsEl.textContent = defaultPoints.toLocaleString("en-US");
      alert("Seus pontos foram resetados para 3.000!");
    });
  }

  atualizarData();
});

function atualizarData() {
  const campoData = document.querySelector(".text-muted-ink");
  if (!campoData) return;

  const hoje = new Date();
  const opcoes = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  let dataFormatada = hoje.toLocaleDateString("pt-BR", opcoes);
  campoData.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
}