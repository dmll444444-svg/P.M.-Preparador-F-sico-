(async function PPF_APP_BOOTSTRAP() {
  try {
    if (window.PPF_SUPABASE_READY) {
      await window.PPF_SUPABASE_READY;
    }
  } catch (error) {
    console.warn("Supabase bootstrap error:", error);
  }

const users = [
  { username: "admin", password: "admin123", role: "admin", nickname: "Administrador" },
  { username: "cliente1", password: "cliente123", role: "client", nickname: "cliente1" },
  { username: "cliente2", password: "cliente456", role: "client", nickname: "cliente2" }
];

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const savedPatients = JSON.parse(localStorage.getItem("patients")) || [];

  const patientUsers = savedPatients
    .filter(patient => patient.nickname && patient.accessPassword)
    .map(patient => ({
      username: patient.nickname,
      password: patient.accessPassword,
      role: "client",
      nickname: patient.nickname,
      patientName: patient.nombre
    }));

  const allUsers = [...users, ...patientUsers];

  const user = allUsers.find(item => item.username === username && item.password === password);

  if (!user) {
    message.textContent = "Usuario o contraseña incorrectos";
    message.className = "error";
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  message.textContent = `Acceso correcto. Bienvenido, ${user.nickname}`;
  message.className = "success";

  setTimeout(() => {
    if (user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "cliente.html";
    }
  }, 500);
});


})();
