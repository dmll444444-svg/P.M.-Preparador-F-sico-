
const PPF_DB_NAME = "PPF_PREPARADOR_FISICO_DB";
const PPF_DB_VERSION = 1;
const PPF_STORES = [
  "patients",
  "sessions",
  "histories",
  "patientFiles",
  "exerciseLibrary",
  "completedSessions",
  "users",
  "settings"
];

function openPPFDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PPF_DB_NAME, PPF_DB_VERSION);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      PPF_STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openPPFDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function dbSetAll(storeName, items = []) {
  const db = await openPPFDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    store.clear();

    (items || []).forEach((item, index) => {
      const safeItem = {
        ...item,
        id: item.id || item.nickname || item.key || `${storeName}-${Date.now()}-${index}`
      };
      store.put(safeItem);
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbPut(storeName, item) {
  const db = await openPPFDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const safeItem = {
      ...item,
      id: item.id || item.nickname || item.key || `${storeName}-${Date.now()}`
    };

    store.put(safeItem);

    tx.oncomplete = () => resolve(safeItem);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(storeName, id) {
  const db = await openPPFDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbClearAll() {
  const db = await openPPFDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PPF_STORES, "readwrite");

    PPF_STORES.forEach(storeName => tx.objectStore(storeName).clear());

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function readLocalArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

async function migrateLocalStorageToDB() {
  const data = {
    patients: readLocalArray("patients"),
    sessions: readLocalArray("sessions"),
    histories: readLocalArray("histories"),
    patientFiles: readLocalArray("patientFiles"),
    exerciseLibrary: readLocalArray("exerciseLibrary"),
    completedSessions: readLocalArray("completedSessions"),
    users: readLocalArray("users"),
    settings: [{ id: "meta", migratedAt: new Date().toISOString(), version: PPF_DB_VERSION }]
  };

  for (const storeName of PPF_STORES) {
    await dbSetAll(storeName, data[storeName] || []);
  }

  localStorage.setItem("ppfIndexedDBEnabled", "true");
  localStorage.setItem("ppfLastMigration", new Date().toISOString());

  return data;
}

async function loadDBToRuntime() {
  if (localStorage.getItem("ppfIndexedDBEnabled") !== "true") return false;

  const dbPatients = await dbGetAll("patients");
  const dbSessions = await dbGetAll("sessions");
  const dbHistories = await dbGetAll("histories");
  const dbPatientFiles = await dbGetAll("patientFiles");
  const dbExerciseLibrary = await dbGetAll("exerciseLibrary");

  const localPatients = readLocalArray("patients");
  const localSessions = readLocalArray("sessions");

  // Protección anti-borrado:
  // si la BD está vacía y localStorage tiene datos, NO se sobreescriben los datos locales.
  if (dbPatients.length === 0 && dbSessions.length === 0 && (localPatients.length > 0 || localSessions.length > 0)) {
    console.warn("BD vacía detectada. Se mantienen datos de localStorage.");
    return false;
  }

  // Si tanto BD como localStorage están vacíos, no se hace nada destructivo.
  if (dbPatients.length === 0 && dbSessions.length === 0 && localPatients.length === 0 && localSessions.length === 0) {
    console.warn("BD y localStorage vacíos. No se cargan datos.");
    return false;
  }

  window.patients = dbPatients;
  window.sessions = dbSessions;
  window.histories = dbHistories;
  window.patientFiles = dbPatientFiles;
  window.exerciseLibrary = dbExerciseLibrary;

  localStorage.setItem("patients", JSON.stringify(window.patients));
  localStorage.setItem("sessions", JSON.stringify(window.sessions));
  localStorage.setItem("histories", JSON.stringify(window.histories));
  localStorage.setItem("patientFiles", JSON.stringify(window.patientFiles));
  localStorage.setItem("exerciseLibrary", JSON.stringify(window.exerciseLibrary));

  return true;
}

async function syncRuntimeToDB() {
  if (localStorage.getItem("ppfIndexedDBEnabled") !== "true") return false;

  await dbSetAll("patients", window.patients || readLocalArray("patients"));
  await dbSetAll("sessions", window.sessions || readLocalArray("sessions"));
  await dbSetAll("histories", window.histories || readLocalArray("histories"));
  await dbSetAll("patientFiles", window.patientFiles || readLocalArray("patientFiles"));
  await dbSetAll("exerciseLibrary", window.exerciseLibrary || readLocalArray("exerciseLibrary"));
  await dbSetAll("completedSessions", readLocalArray("completedSessions"));

  return true;
}

async function exportPPFBackup() {
  const backup = {
    app: "Programa Preparador Físico",
    version: PPF_DB_VERSION,
    exportedAt: new Date().toISOString(),
    stores: {}
  };

  for (const storeName of PPF_STORES) {
    backup.stores[storeName] = await dbGetAll(storeName);
  }

  return backup;
}

async function importPPFBackup(backup) {
  if (!backup?.stores) throw new Error("Backup no válido.");

  for (const storeName of PPF_STORES) {
    await dbSetAll(storeName, backup.stores[storeName] || []);
  }

  localStorage.setItem("ppfIndexedDBEnabled", "true");
  await loadDBToRuntime();

  return true;
}

async function getPPFSystemStats() {
  const stats = {};

  for (const storeName of PPF_STORES) {
    stats[storeName] = (await dbGetAll(storeName)).length;
  }

  return stats;
}
