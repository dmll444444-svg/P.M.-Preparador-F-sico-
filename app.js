const defaultUsers = [
  { username: "admin", password: "admin123", role: "admin", nickname: "Administrador" },
  { username: "cliente1", password: "cliente123", role: "client", nickname: "cliente1" },
  { username: "cliente2", password: "cliente456", role: "client", nickname: "cliente2" }
];

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

function safeJson(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (_) {
    return fallback;
  }
}

function setMessage(text, className) {
  if (!message) return;
  message.textContent = text;
  message.className = className || "";
}

async function waitForCloudData() {
  if (!window.PPF_SUPABASE_READY) return;
  try {
    setMessage("Cargando datos...", "success");
    await window.PPF_SUPABASE_READY;
  } catch (error) {
    console.warn("Supabase login bootstrap error:", error);
  }
}

function buildUsers() {
  const savedPatients = safeJson("patients", []);

  const patientUsers = savedPatients
    .filter(patient => patient && patient.nickname && patient.accessPassword)
    .map(patient => ({
      username: String(patient.nickname).trim(),
      password: String(patient.accessPassword).trim(),
      role: "client",
      nickname: patient.nickname,
      patientName: patient.nombre || patient.name || patient.nickname
    }));

  return [...defaultUsers, ...patientUsers];
}

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    await waitForCloudData();

    const allUsers = buildUsers();
    const user = allUsers.find(item => item.username === username && item.password === password);

    if (!user) {
      setMessage("Usuario o contraseña incorrectos", "error");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    setMessage(`Acceso correcto. Bienvenido, ${user.nickname}`, "success");

    setTimeout(() => {
      window.location.href = user.role === "admin" ? "admin.html" : "cliente.html";
    }, 350);
  });
}
