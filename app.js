const users = [
  { username: "admin", password: "admin123", role: "admin", nickname: "Administrador" },
  { username: "cliente1", password: "cliente123", role: "client", nickname: "cliente1" },
  { username: "cliente2", password: "cliente456", role: "client", nickname: "cliente2" }
];

const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const submitButton = form ? form.querySelector('button[type="submit"]') : null;

function normalizeLoginValue(value) {
  return String(value || "").trim();
}

function getPatientPassword(patient) {
  return normalizeLoginValue(
    patient.accessPassword ||
    patient.password ||
    patient.contrasena ||
    patient.passwordCliente ||
    patient.clave ||
    ""
  );
}

function buildPatientUsers() {
  const savedPatients = JSON.parse(localStorage.getItem("patients") || "[]");

  return savedPatients
    .filter(patient => patient && patient.nickname && getPatientPassword(patient))
    .map(patient => ({
      username: normalizeLoginValue(patient.nickname),
      password: getPatientPassword(patient),
      role: "client",
      nickname: normalizeLoginValue(patient.nickname),
      patientName: patient.nombre || patient.name || "",
      patientId: patient.id || ""
    }));
}

async function ensureCloudReadyForLogin() {
  if (!window.PPF_SUPABASE_READY) return false;

  try {
    if (message) {
      message.textContent = "Sincronizando datos...";
      message.className = "info";
    }

    await window.PPF_SUPABASE_READY;

    // En móvil/PWA a veces el Service Worker entrega versión cacheada:
    // hacemos un pull extra antes de validar usuario.
    if (window.PPF_SUPABASE && typeof window.PPF_SUPABASE.pull === "function") {
      await window.PPF_SUPABASE.pull();
    }

    return true;
  } catch (error) {
    console.warn("No se pudo sincronizar antes del login:", error);
    return false;
  }
}

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = normalizeLoginValue(document.getElementById("username")?.value);
    const password = normalizeLoginValue(document.getElementById("password")?.value);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Entrando...";
    }

    await ensureCloudReadyForLogin();

    const patientUsers = buildPatientUsers();
    const allUsers = [...users, ...patientUsers];

    const user = allUsers.find(item =>
      normalizeLoginValue(item.username).toLowerCase() === username.toLowerCase() &&
      normalizeLoginValue(item.password) === password
    );

    if (!user) {
      if (message) {
        message.textContent = "Usuario o contraseña incorrectos";
        message.className = "error";
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Entrar";
      }
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    try {
      const stats = JSON.parse(localStorage.getItem("userStats") || "{}");
      const key = user.nickname || user.username;
      stats[key] = stats[key] || { count: 0, online: false, lastLogin: null, lastLogout: null };
      stats[key].count = Number(stats[key].count || 0) + 1;
      stats[key].online = true;
      stats[key].lastLogin = new Date().toISOString();
      localStorage.setItem("userStats", JSON.stringify(stats));
      if (window.PPF_SUPABASE?.pushKey) window.PPF_SUPABASE.pushKey("userStats").catch(()=>{});
    } catch(e) {}

    if (message) {
      message.textContent = `Acceso correcto. Bienvenido, ${user.nickname}`;
      message.className = "success";
    }

    setTimeout(() => {
      if (user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "cliente.html";
      }
    }, 350);
  });
}
