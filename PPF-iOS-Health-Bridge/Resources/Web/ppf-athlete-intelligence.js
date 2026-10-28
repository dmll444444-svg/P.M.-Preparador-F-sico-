/* P.P.F. v3.5.0-alpha.3 · Athlete Intelligence · Evolution Engine
   Read-only intelligence layer. Does not mutate sessions, notifications or lifecycle truth. */
(() => {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const num = value => Number(value) || 0;
  const iso = s => String(s?.fecha || s?.date || s?.sessionDate || "").slice(0,10);
  const micro = s => num(s?.microcycle ?? s?.micro ?? s?.microciclo ?? s?.microcycleNumber);
  const identity = value => String(value || "").trim().toLowerCase();
  const sessionPatient = s => identity(s?.patientNickname || s?.patient || s?.nickname || s?.deportista || s?.clientNickname);
  const sessionDone = s => {
    try { if (window.PPF_SESSION_TRUTH?.isCompleted) return !!window.PPF_SESSION_TRUTH.isCompleted(s); } catch (_) {}
    const state = String(s?.status || s?.estado || "").toLowerCase();
    return ["completed","complete","done","terminada","terminado","finalizada","finalizado"].includes(state) || s?.completed === true;
  };
  const fmtDate = value => {
    if (!value) return "Sin fecha";
    const d = new Date(`${String(value).slice(0,10)}T12:00:00`);
    return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat("es-ES", {day:"numeric", month:"short"}).format(d);
  };
  const getPatients = () => { try { return JSON.parse(localStorage.getItem("patients") || "[]"); } catch (_) { return []; } };
  const getSessions = () => { try { return JSON.parse(localStorage.getItem("sessions") || "[]"); } catch (_) { return []; } };
  const patientSessions = nickname => getSessions().filter(s => sessionPatient(s) === identity(nickname)).sort((a,b) => iso(a).localeCompare(iso(b)));
  const coreSummary = nickname => { try { return window.PPF_CORE?.summary?.(nickname) || null; } catch (_) { return null; } };
  const lastReviewKey = nickname => `ppf:athlete-intelligence:last-review:${identity(nickname)}`;
  const statusMeta = ({compliance, overdue, pending, total}) => {
    if (!total) return {label:"SIN DATOS", tone:"neutral", note:"Aún no hay sesiones suficientes para interpretar el estado."};
    if (overdue >= 2 || compliance < 45) return {label:"ATENCIÓN", tone:"danger", note:"Hay señales que requieren revisión del preparador."};
    if (overdue === 1 || compliance < 70) return {label:"VIGILAR", tone:"warning", note:"Conviene revisar continuidad y planificación próxima."};
    if (compliance >= 90 && pending <= 4) return {label:"ÓPTIMO", tone:"optimal", note:"Continuidad alta y planificación bajo control."};
    return {label:"ESTABLE", tone:"stable", note:"El deportista mantiene un comportamiento consistente."};
  };

  const exerciseSeries = item => { const v = Number(String(item?.series ?? item?.serie ?? item?.numSeries ?? "").replace(",", ".")); return Number.isFinite(v) && v > 0 ? v : 1; };
  const asList = value => Array.isArray(value) ? value : [];
  function sessionPatternLoad(session) {
    const out = {TS:0, TI:0, Core:0, Plyo:0, Mov:0, Act:0, Carrera:0};
    const add = (items, moduleName="") => asList(items).forEach(item => {
      if (!item || item.deleted) return;
      const type=String(item.tipo||item.type||item.categoria||item.category||"").toLowerCase();
      const n=exerciseSeries(item);
      if (type.includes("superior") || type === "ts" || type.includes("ppal. ts")) out.TS+=n;
      else if (type.includes("inferior") || type === "ti" || type.includes("ppal. ti")) out.TI+=n;
      else if (type.includes("core")) out.Core+=n;
      else if (type.includes("plyo") || type.includes("plio") || type.includes("pliometr")) out.Plyo+=n;
      else if (moduleName === "Mov") out.Mov+=n;
      else if (moduleName === "Act") out.Act+=n;
    });
    add(session?.modules?.movilidad, "Mov"); add(session?.movilidad, "Mov");
    add(session?.modules?.activacion, "Act"); add(session?.activacion, "Act");
    const principal=session?.modules?.principal;
    if (principal?.blocks) Object.values(principal.blocks).forEach(block=>add(block?.exercises||block?.ejercicios));
    add(principal?.exercises); add(session?.principal); add(session?.exercises); add(session?.ejercicios);
    const carrera=asList(session?.modules?.carrera).length ? session.modules.carrera : asList(session?.carrera);
    carrera.forEach(item=>{ if(item && !item.deleted) out.Carrera += Math.max(1, exerciseSeries(item)); });
    return out;
  }
  function buildPatternEngine(microMap, micros, list) {
    // Pattern Engine compares only temporally CLOSED microcycles.
    // An active/future micro may be visible in Resumen, but never alters longitudinal adherence.
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const ordered=[...micros].sort((a,b)=>a-b);
    const maxMicro=ordered.at(-1) || 0;
    const classifyMicro = id => {
      const ss=microMap.get(id)||[];
      const dates=ss.map(iso).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
      if (dates.length) {
        const first=dates[0], last=dates.at(-1);
        if (last < todayIso) return {state:"closed",first,last,reason:"dates"};
        if (first > todayIso) return {state:"future",first,last,reason:"dates"};
        return {state:"active",first,last,reason:"dates"};
      }
      // Safe legacy fallback: only an older numbered micro can be considered closed.
      return {state:id < maxMicro ? "closed" : "active",first:"",last:"",reason:"legacy"};
    };
    const classified=ordered.map(id=>({id,...classifyMicro(id)}));
    const closedMicros=classified.filter(x=>x.state==="closed").map(x=>x.id);
    const recentMicros=closedMicros.slice(-4);
    const rows=recentMicros.map(id=>{
      const ss=microMap.get(id)||[]; const done=ss.filter(sessionDone).length;
      const rate=ss.length?Math.round(done/ss.length*100):0;
      const load={TS:0,TI:0,Core:0,Plyo:0,Mov:0,Act:0,Carrera:0};
      ss.forEach(session=>{ const x=sessionPatternLoad(session); Object.keys(load).forEach(k=>load[k]+=x[k]); });
      return {id,sessions:ss.length,done,rate,load};
    });
    const patterns=[];
    const strength = evidence => evidence >= 4 ? {label:"FUERTE",tone:"strong"} : evidence >= 3 ? {label:"MODERADO",tone:"moderate"} : {label:"EMERGENTE",tone:"emerging"};
    const impact = delta => Math.abs(delta)>=25 ? "ALTO" : Math.abs(delta)>=15 ? "MODERADO" : "BAJO";
    if (rows.length >= 2) {
      const good=rows.filter(r=>r.rate>=80).length;
      if (good>=2) patterns.push({family:"CONTINUIDAD",icon:"↗",title:"Continuidad consolidada",detail:`${good} de los últimos ${rows.length} microciclos cerrados alcanzan al menos un 80% de adherencia.`,...strength(good)});
      const stable=rows.length>=3 && Math.max(...rows.map(r=>r.rate))-Math.min(...rows.map(r=>r.rate))<=15;
      if(stable) patterns.push({family:"ADHERENCIA",icon:"↔",title:"Adherencia estable entre micros",detail:`La variación entre M${rows[0].id} y M${rows.at(-1).id} se mantiene dentro de 15 puntos.`,...strength(rows.length)});
      const latest=rows.at(-1), prior=rows.at(-2); const delta=latest.rate-prior.rate;
      if(Math.abs(delta)>=15) patterns.push({family:"ADHERENCIA",icon:delta>0?"↑":"↓",title:delta>0?"Mejora reciente de adherencia":"Descenso reciente de adherencia",detail:`M${latest.id} cambia ${delta>0?"+":""}${delta} puntos respecto a M${prior.id}.`,impact:impact(delta),...strength(2)});
    }
    const cats=["TS","TI","Core","Plyo","Mov","Act","Carrera"];
    const leaders=rows.map(r=>{ const entries=cats.map(k=>[k,r.load[k]]).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]); return entries[0]?.[0]||""; });
    cats.forEach(cat=>{ const count=leaders.filter(x=>x===cat).length; if(count>=2) patterns.push({family:"DISTRIBUCIÓN",icon:"◎",title:`Predominio recurrente de ${cat}`,detail:`${cat} es la exposición principal en ${count} de los últimos ${rows.length} microciclos cerrados analizados.`,...strength(count)}); });
    if(rows.length>=3){
      const counts=rows.map(r=>r.sessions); const spread=Math.max(...counts)-Math.min(...counts);
      if(spread<=1) patterns.push({family:"PLANIFICACIÓN",icon:"▦",title:"Frecuencia semanal regular",detail:`La estructura se mantiene entre ${Math.min(...counts)} y ${Math.max(...counts)} sesiones por microciclo cerrado.`,...strength(rows.length)});
    }
    // Double-session recurrence uses exactly the same four CLOSED micros as the rest of Pattern Engine.
    const analysedSessions=recentMicros.flatMap(id=>microMap.get(id)||[]);
    const dates=new Map(); analysedSessions.forEach(s=>{const d=iso(s); if(d) dates.set(d,(dates.get(d)||0)+1)});
    const doubles=[...dates.values()].filter(n=>n>=2).length;
    if(doubles>=2) patterns.push({family:"PLANIFICACIÓN",icon:"⚡",title:"Dobles sesiones recurrentes",detail:`Se detectan ${doubles} días con dos o más sesiones dentro de los ${rows.length} microciclos cerrados analizados.`,...strength(Math.min(4,doubles))});
    if(!patterns.length) patterns.push({family:"HISTORIAL",icon:"…",title:"Patrón todavía emergente",detail:"P.P.F. necesita más microciclos cerrados comparables para confirmar una recurrencia sólida.",label:"EMERGENTE",tone:"emerging"});
    const priority={strong:0,moderate:1,emerging:2}; patterns.sort((a,b)=>priority[a.tone]-priority[b.tone]);
    const strong=patterns.filter(p=>p.tone==="strong").length, moderate=patterns.filter(p=>p.tone==="moderate").length;
    const synthesis=strong ? `Se detectan ${strong} patrón${strong===1?"":"es"} fuerte${strong===1?"":"s"} sobre microciclos ya cerrados. La estructura reciente ofrece suficiente repetición para orientar la revisión del preparador.` : moderate ? `Hay ${moderate} patrón${moderate===1?"":"es"} moderado${moderate===1?"":"s"} en microciclos cerrados que conviene seguir observando antes de considerarlos consolidados.` : "Los patrones actuales son emergentes; conviene acumular más microciclos cerrados antes de extraer conclusiones estables.";
    const excluded=classified.filter(x=>x.state!=="closed");
    return {rows,patterns,synthesis,excluded,closedCount:closedMicros.length,todayIso};
  }

  function buildModel(nickname) {
    const patients = getPatients();
    const patient = patients.find(p => identity(p.nickname) === identity(nickname));
    const list = patientSessions(nickname);
    const summary = coreSummary(nickname) || {};
    const completed = Number.isFinite(summary.completed) ? summary.completed : list.filter(sessionDone).length;
    const pending = Number.isFinite(summary.pending) ? summary.pending : Math.max(0, list.length - completed);
    const compliance = Number.isFinite(summary.compliance) ? summary.compliance : (list.length ? Math.round(completed / list.length * 100) : 0);
    const overdue = num(summary.overdue);
    const currentMicro = num(summary.currentMicro) || list.reduce((m,s) => Math.max(m,micro(s)),0);
    const recent = list.slice().sort((a,b) => iso(b).localeCompare(iso(a))).slice(0,6);
    const recentDone = recent.filter(sessionDone).length;
    const recentRate = recent.length ? Math.round(recentDone/recent.length*100) : 0;
    const microMap = new Map();
    list.forEach(s => { const m = micro(s); if (!m) return; if (!microMap.has(m)) microMap.set(m, []); microMap.get(m).push(s); });
    const micros = [...microMap.keys()].sort((a,b)=>b-a);
    const active = microMap.get(currentMicro) || [];
    const previous = microMap.get(micros.find(m => m < currentMicro)) || [];
    const activeDone = active.filter(sessionDone).length;
    const previousDone = previous.filter(sessionDone).length;
    const activeRate = active.length ? Math.round(activeDone/active.length*100) : 0;
    const previousRate = previous.length ? Math.round(previousDone/previous.length*100) : 0;
    const trendDelta = active.length && previous.length ? activeRate - previousRate : null;
    const status = statusMeta({compliance, overdue, pending, total:list.length});
    const lastReview = localStorage.getItem(lastReviewKey(nickname)) || "";
    const changed = lastReview ? list.filter(s => String(s?.updatedAt || s?.createdAt || "") > lastReview).length : 0;
    const signals = [];
    if (recent.length) signals.push({tone: recentRate >= 80 ? "good" : recentRate >= 60 ? "info" : "warn", icon: recentRate >= 80 ? "↗" : "↔", title:"Adherencia reciente", value:`${recentRate}%`, detail:`${recentDone} de las últimas ${recent.length} sesiones completadas.`});
    if (overdue) signals.push({tone:"warn", icon:"!", title:"Sesiones retrasadas", value:String(overdue), detail:"Pendientes cuya fecha prevista ya ha pasado."});
    else if (list.length) signals.push({tone:"good", icon:"✓", title:"Calendario", value:"Controlado", detail:"Sin sesiones retrasadas detectadas."});
    if (trendDelta !== null) signals.push({tone: trendDelta >= 0 ? "good" : "warn", icon: trendDelta >= 0 ? "↑" : "↓", title:`M${currentMicro} vs M${micros.find(m=>m<currentMicro)}`, value:`${trendDelta >= 0 ? "+" : ""}${trendDelta}%`, detail:"Cambio de adherencia entre los dos últimos microciclos."});
    if (pending) signals.push({tone:"info", icon:"→", title:"Planificación activa", value:`${pending} pendiente${pending===1?"":"s"}`, detail: summary.nextSession ? `Próxima: ${fmtDate(iso(summary.nextSession))}.` : "Hay trabajo programado por completar."});
    const insights = [];
    if (!list.length) insights.push("Todavía no hay suficiente historial para detectar patrones de entrenamiento.");
    else {
      insights.push(recentRate >= 80 ? "La continuidad reciente es alta y ofrece una base fiable para comparar microciclos." : recentRate >= 60 ? "La continuidad reciente es moderada; conviene observar si se consolida en las próximas sesiones." : "La continuidad reciente ha bajado y merece revisión antes de aumentar la exigencia de la planificación.");
      if (trendDelta !== null) insights.push(trendDelta > 10 ? `M${currentMicro} mejora claramente la adherencia respecto al micro anterior.` : trendDelta < -10 ? `M${currentMicro} presenta una caída de adherencia frente al micro anterior.` : "Los dos últimos microciclos muestran una adherencia similar.");
      if (!overdue) insights.push("No se detectan retrasos activos en el calendario del deportista.");
    }
    let decision = "Mantener observación";
    let decisionText = "Continúa recopilando sesiones para que P.P.F. pueda ofrecer una lectura más sólida.";
    if (list.length) {
      if (overdue >= 1 || recentRate < 60) { decision = "Revisar planificación"; decisionText = "Prioriza la continuidad antes de aumentar carga o complejidad. Revisa Agenda PRO y las sesiones pendientes."; }
      else if (trendDelta !== null && trendDelta >= 10) { decision = "Consolidar estructura actual"; decisionText = "La respuesta reciente es positiva. Mantén la estructura general y verifica que la tendencia se sostenga en el siguiente micro."; }
      else { decision = "Mantener estructura actual"; decisionText = "La planificación se mantiene estable. Revisa evolución y comparativas antes de introducir cambios relevantes."; }
    }
    const patternEngine = buildPatternEngine(microMap, micros, list);
    return {patient, list, summary, completed, pending, compliance, overdue, currentMicro, recentRate, recentDone, recentCount:recent.length, active, activeRate, previous, previousRate, trendDelta, status, signals, insights, decision, decisionText, lastReview, changed, patternEngine};
  }
  function avatar(patient) {
    const photo = typeof window.getPatientPhotoSafe === "function" ? window.getPatientPhotoSafe(patient) : (patient?.foto || patient?.photo || patient?.imagen || patient?.image || patient?.avatar || "");
    if (photo) return `<img src="${esc(photo)}" alt="" />`;
    const initials = String(patient?.nombre || patient?.nickname || "D").trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("");
    return `<span>${esc(initials || "D")}</span>`;
  }
  function shellHTML() {
    const options = getPatients().slice().sort((a,b)=>String(a.nombre||"").localeCompare(String(b.nombre||""),"es")).map(p=>`<option value="${esc(p.nickname)}">${esc(p.nombre || p.nickname)} · ${esc(p.nickname)}</option>`).join("");
    return `<section class="ai-shell"><div class="ai-hero"><div><p class="eyebrow">P.P.F. · ATHLETE INTELLIGENCE</p><h2>Control del Deportista</h2><p>Señales, patrones y evolución traducidos a decisiones rápidas para el preparador.</p></div><div class="ai-readonly"><span>🧠</span><div><b>Capa inteligente</b><small>Solo lectura · base GOLD protegida</small></div></div></div><div class="ai-selector"><label for="aiPatientSelect">Deportista analizado</label><select id="aiPatientSelect"><option value="">Selecciona deportista</option>${options}</select><small>El control se calcula con los datos reales ya existentes en P.P.F.</small></div><div class="ai-tabs" role="tablist"><button class="active" data-ai-tab="resumen">Resumen</button><button data-ai-tab="patrones">Patrones</button><button data-ai-tab="evolucion">Evolución</button><button data-ai-tab="salud">Salud <span class="ai-beta-pill">BETA</span></button></div><div id="aiWorkspace" class="ai-workspace"><div class="ai-empty"><span>🧠</span><h3>Selecciona un deportista</h3><p>P.P.F. construirá su lectura inteligente sin modificar sesiones ni notificaciones.</p></div></div></section>`;
  }
  function summaryHTML(m) {
    const p=m.patient||{}; const trend=m.trendDelta===null?"Sin comparativa":`${m.trendDelta>=0?"↑":"↓"} ${Math.abs(m.trendDelta)}% vs micro anterior`;
    const changes = !m.lastReview ? "Primera revisión de control" : m.changed ? `${m.changed} registro${m.changed===1?"":"s"} actualizado${m.changed===1?"":"s"} desde tu última revisión` : "Sin cambios relevantes desde tu última revisión";
    return `<div class="ai-athlete-head"><div class="ai-avatar">${avatar(p)}</div><div><small>DEPORTISTA ACTIVO</small><h3>${esc(p.nombre||p.nickname||"Deportista")}</h3><p>@${esc(p.nickname||"")} · Micro actual M${m.currentMicro||"—"}</p></div><div class="ai-status ${m.status.tone}"><small>P.P.F. ATHLETE STATUS</small><strong>${m.status.label}</strong><span>${esc(m.status.note)}</span></div></div>
    <div class="ai-kpis"><article><span>Adherencia global</span><strong>${m.compliance}%</strong><small>${m.completed} completadas</small></article><article><span>Actividad reciente</span><strong>${m.recentRate}%</strong><small>${m.recentDone}/${m.recentCount||0} últimas sesiones</small></article><article><span>Micro actual</span><strong>M${m.currentMicro||"—"}</strong><small>${m.pending} pendientes</small></article><article><span>Tendencia</span><strong>${m.trendDelta===null?"↔":m.trendDelta>=0?"↑":"↓"}</strong><small>${esc(trend)}</small></article></div>
    <section class="ai-panel ai-reading"><div class="ai-panel-title"><div><p class="eyebrow">LECTURA DEL MOMENTO ACTUAL</p><h3>Qué está ocurriendo ahora</h3></div><span class="ai-live-dot">● EN VIVO</span></div><p class="ai-reading-copy">${esc(m.insights.join(" "))}</p></section>
    <section class="ai-panel"><div class="ai-panel-title"><div><p class="eyebrow">SEÑALES DETECTADAS</p><h3>Lo que merece tu atención</h3></div></div><div class="ai-signals">${m.signals.map(s=>`<article class="${s.tone}"><i>${s.icon}</i><div><span>${esc(s.title)}</span><strong>${esc(s.value)}</strong><small>${esc(s.detail)}</small></div></article>`).join("") || `<p class="ai-muted">Sin señales suficientes todavía.</p>`}</div></section>
    <div class="ai-two"><section class="ai-panel"><p class="eyebrow">DESDE TU ÚLTIMA VISITA</p><h3>${esc(changes)}</h3><p class="ai-muted">Última revisión: ${m.lastReview ? esc(new Date(m.lastReview).toLocaleString("es-ES",{dateStyle:"short",timeStyle:"short"})) : "sin registro previo"}.</p><button class="secondary-btn" id="aiMarkReviewed">✓ Marcar como revisado</button></section><section class="ai-panel ai-decision"><p class="eyebrow">SIGUIENTE DECISIÓN SUGERIDA</p><h3>🎯 ${esc(m.decision)}</h3><p>${esc(m.decisionText)}</p><div><button class="primary-btn" data-ai-go="graficaPro">Centro de Rendimiento</button><button class="secondary-btn" data-ai-go="agenda">Agenda PRO</button></div></section></div>`;
  }
  function patternsHTML(m) {
    const e=m.patternEngine;
    const microStrip=e.rows.map(r=>`<article><small>M${r.id}</small><strong>${r.rate}%</strong><span>${r.done}/${r.sessions} completadas</span></article>`).join("");
    const cards=e.patterns.map(p=>`<article class="ai-pattern-card ${p.tone}"><div class="ai-pattern-icon">${p.icon}</div><div class="ai-pattern-copy"><div class="ai-pattern-meta"><span>${esc(p.family)}</span><div class="ai-pattern-badges"><em>${esc(p.label)}</em>${p.impact?`<em class="impact">IMPACTO ${esc(p.impact)}</em>`:""}</div></div><h4>${esc(p.title)}</h4><p>${esc(p.detail)}</p></div></article>`).join("");
    const excluded=e.excluded.map(x=>`M${x.id} · ${x.state==="future"?"Futuro":"En curso"}`).join(" · ");
    const truthNote=excluded ? `<div class="ai-micro-truth"><strong>MICROCYCLE TRUTH</strong><span>${esc(excluded)} · excluido${e.excluded.length===1?"":"s"} del análisis longitudinal</span></div>` : "";
    return `<section class="ai-pattern-hero"><div><p class="eyebrow">P.P.F. PATTERN ENGINE</p><h3>Comportamientos que se repiten</h3><p>P.P.F. compara los últimos microciclos cerrados y separa recurrencias consolidadas de señales todavía emergentes.</p></div><div class="ai-pattern-count"><strong>${e.patterns.length}</strong><span>patrones activos</span></div></section>${truthNote}<div class="ai-pattern-micros">${microStrip || `<p class="ai-muted">Sin microciclos cerrados comparables todavía.</p>`}</div><section class="ai-panel"><div class="ai-panel-title"><div><p class="eyebrow">PATRONES DETECTADOS</p><h3>Lo que se mantiene en el tiempo</h3></div><span class="ai-live-dot">● DATOS REALES</span></div><div class="ai-pattern-grid">${cards}</div></section><section class="ai-panel ai-pattern-reading"><p class="eyebrow">LECTURA DE PATRONES</p><h3>Interpretación longitudinal</h3><p>${esc(e.synthesis)}</p><small>Fuerte = evidencia en 4 micros cerrados · Moderado = 3 · Emergente = señal inicial. Impacto mide magnitud, no recurrencia. Los micros activos o futuros no alteran adherencia ni continuidad.</small></section>`;
  }
  function evolutionHTML(m) {
    const e=m.patternEngine;
    const rows=e.rows||[];
    if (!rows.length) return `<section class="ai-evolution-hero"><div><p class="eyebrow">P.P.F. EVOLUTION ENGINE</p><h3>Cómo está cambiando el deportista</h3><p>La evolución utiliza únicamente microciclos cerrados para evitar conclusiones provisionales.</p></div></section><section class="ai-panel"><div class="ai-empty"><span>📈</span><h3>Sin micros cerrados comparables</h3><p>Cuando existan microciclos cerrados, P.P.F. construirá aquí su evolución longitudinal.</p></div></section>`;
    const first=rows[0], last=rows.at(-1), prior=rows.length>1?rows.at(-2):null;
    const rateDelta=prior ? last.rate-prior.rate : null;
    const sessionDelta=prior ? last.sessions-prior.sessions : null;
    const cats=["TS","TI","Core","Plyo","Mov","Act","Carrera"];
    const leader=r=>cats.map(k=>[k,r.load[k]||0]).sort((a,b)=>b[1]-a[1])[0];
    const firstLead=leader(first), lastLead=leader(last);
    const totalLoad=r=>cats.reduce((sum,k)=>sum+(r.load[k]||0),0);
    const loadDelta=prior ? totalLoad(last)-totalLoad(prior) : null;
    const direction=rateDelta===null?"Sin comparativa":rateDelta>5?"Mejora":rateDelta<-5?"Descenso":"Estable";
    const tone=rateDelta===null?"neutral":rateDelta>5?"positive":rateDelta<-5?"attention":"stable";
    const reading=[];
    if(rows.length===1) reading.push(`M${last.id} es el primer microciclo cerrado disponible para construir la línea evolutiva.`);
    else {
      reading.push(Math.abs(rateDelta)<=5 ? `La adherencia se mantiene estable entre M${prior.id} y M${last.id}.` : rateDelta>0 ? `La adherencia mejora ${rateDelta} puntos entre M${prior.id} y M${last.id}.` : `La adherencia desciende ${Math.abs(rateDelta)} puntos entre M${prior.id} y M${last.id}.`);
      reading.push(sessionDelta===0 ? `La frecuencia se mantiene en ${last.sessions} sesiones.` : `La frecuencia cambia de ${prior.sessions} a ${last.sessions} sesiones.`);
      if(lastLead[1]>0) reading.push(firstLead[0]===lastLead[0] ? `${lastLead[0]} mantiene el predominio de exposición desde M${first.id}.` : `El predominio de exposición evoluciona de ${firstLead[0]||"sin dato"} a ${lastLead[0]}.`);
    }
    const truth=e.excluded?.length ? `<div class="ai-micro-truth"><strong>MICROCYCLE TRUTH</strong><span>${esc(e.excluded.map(x=>`M${x.id} · ${x.state==="future"?"Futuro":"En curso"}`).join(" · "))} · no altera la evolución cerrada</span></div>` : "";
    const timeline=rows.map(r=>`<article><div><small>M${r.id}</small><strong>${r.rate}%</strong></div><span>${r.done}/${r.sessions} completadas</span><i style="--ai-rate:${Math.max(4,r.rate)}%"><b></b></i></article>`).join("");
    const distribution=cats.map(k=>{const v=last.load[k]||0;return v?`<span><b>${k}</b>${v}</span>`:""}).join("");
    return `<section class="ai-evolution-hero"><div><p class="eyebrow">P.P.F. EVOLUTION ENGINE</p><h3>Cómo está cambiando el deportista</h3><p>Lectura cronológica construida con los últimos microciclos cerrados. El micro activo o futuro queda fuera hasta consolidar sus datos.</p></div><div class="ai-evolution-state ${tone}"><small>TENDENCIA CERRADA</small><strong>${direction}</strong><span>M${first.id} → M${last.id}</span></div></section>${truth}<section class="ai-panel"><div class="ai-panel-title"><div><p class="eyebrow">LÍNEA EVOLUTIVA</p><h3>Adherencia en micros cerrados</h3></div><span class="ai-live-dot">● DATOS CONSOLIDADOS</span></div><div class="ai-evolution-timeline">${timeline}</div></section><div class="ai-evolution-kpis"><article><small>ADHERENCIA · ÚLTIMO CIERRE</small><strong>${last.rate}%</strong><span>${prior?(rateDelta>=0?"+":"")+rateDelta+" pt vs M"+prior.id:"Primer dato cerrado"}</span></article><article><small>FRECUENCIA</small><strong>${last.sessions}</strong><span>${prior?(sessionDelta>=0?"+":"")+sessionDelta+" sesiones vs M"+prior.id:"sesiones en M"+last.id}</span></article><article><small>PREDOMINIO · ÚLTIMO MICRO</small><strong>${lastLead[1]>0?lastLead[0]:"—"}</strong><span>${lastLead[1]>0?lastLead[1]+" unidades de exposición":"Sin exposición clasificable"}</span></article><article><small class="ai-metric-label">EXPOSICIÓN TOTAL · ÚLTIMO MICRO <span class="ai-pro-tooltip" tabindex="0" role="img" aria-label="Información sobre exposición total" data-tooltip="Suma de las exposiciones registradas en las categorías de entrenamiento del último microciclo cerrado. Es una medida estructural de P.P.F., no una medida de carga ni de volumen fisiológico."><b class="ai-info-dot" aria-hidden="true">ⓘ</b></span></small><strong>${totalLoad(last)}</strong><span>${prior?(loadDelta>=0?"+":"")+loadDelta+" unidades vs M"+prior.id:totalLoad(last)+" unidades en M"+last.id}</span></article></div><section class="ai-panel ai-evolution-reading"><p class="eyebrow">LECTURA DE EVOLUCIÓN</p><h3>Qué ha cambiado realmente</h3><p>${esc(reading.join(" "))}</p><div class="ai-evolution-distribution">${distribution||'<em>Sin distribución disponible.</em>'}</div></section><div class="ai-evolution-actions"><button class="primary-btn" data-ai-go="graficaPro">Abrir análisis completo en Centro de Rendimiento</button></div>`;
  }
  function healthHTML(m) {
    const bridge=window.PPF_HEALTH_BRIDGE;
    const snap=bridge?.snapshot?.(m.patient?.nickname || selected) || {records:[],meta:null,stepsToday:0,workoutsToday:[],heart24Range:null};
    const fmtMinutes=value=>{ const min=Math.max(0,Math.round(Number(value)||0)); return min?`${Math.floor(min/60)} h ${String(min%60).padStart(2,"0")} min`:"—"; };
    const fmtTime=value=>{ if(!value)return "—"; const d=new Date(value); return Number.isNaN(d.getTime())?"—":d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}); };
    const sourceLabel=record=>record?.source==="healthkit"?"Apple HealthKit":record?.source==="health_connect"?"Android Health Connect":record?.source||"Sin origen";
    const lastSync=snap.meta?.last_sync?new Date(snap.meta.last_sync).toLocaleString("es-ES",{dateStyle:"short",timeStyle:"short"}):"Sin sincronización";
    const hr=snap.heartRate; const rhr=snap.restingHeartRate; const sleep=snap.sleep;
    const range=snap.heart24Range?`${snap.heart24Range.min}–${snap.heart24Range.max} ppm · últimas 24 h`:"Sin rango de 24 h";
    const noData=!snap.records?.length;
    return `<section class="ai-health-hero"><div><p class="eyebrow">P.P.F. HEALTH BRIDGE · ALPHA</p><h3>Health Truth · datos del dispositivo</h3><p>Esta capa muestra únicamente registros entregados por un bridge nativo con permiso del deportista. P.P.F. no estima ni completa datos ausentes.</p></div><div class="ai-health-state ${noData?"waiting":"connected"}"><small>ESTADO DEL BRIDGE</small><strong>${noData?"ESPERANDO DATOS":"DATOS RECIBIDOS"}</strong><span>${esc(lastSync)}</span></div></section>
    <div class="ai-health-security"><span>🔐</span><div><strong>ALPHA LOCAL SEGURA</strong><p>Los datos de salud permanecen en este dispositivo. La subida a nube está bloqueada hasta activar autenticación y RLS por deportista.</p></div></div>
    ${noData?`<section class="ai-panel"><div class="ai-empty ai-health-empty"><span>⌚</span><h3>Health Bridge preparado</h3><p>Cuando el bridge móvil lea Apple HealthKit o Android Health Connect con autorización, los datos normalizados aparecerán aquí automáticamente.</p><code>PPF_HEALTH_BRIDGE.ingest(payload)</code></div></section>`:`<div class="ai-health-kpis"><article><small>😴 SUEÑO · ÚLTIMO REGISTRO</small><strong>${sleep?fmtMinutes(sleep.value):"—"}</strong><span>${sleep?`${fmtTime(sleep.start_time)} → ${fmtTime(sleep.end_time)} · ${esc(sourceLabel(sleep))}`:"Dato no disponible"}</span></article><article><small>❤️ FRECUENCIA CARDÍACA</small><strong>${hr?`${Math.round(Number(hr.value))} ppm`:"—"}</strong><span>${hr?`${fmtTime(hr.start_time)} · ${esc(range)}`:"Dato no disponible"}</span></article><article><small>🫀 FC EN REPOSO</small><strong>${rhr?`${Math.round(Number(rhr.value))} ppm`:"—"}</strong><span>${rhr?`${fmtTime(rhr.start_time)} · ${esc(sourceLabel(rhr))}`:"Dato no disponible"}</span></article><article><small>🚶 ACTIVIDAD · HOY</small><strong>${Number(snap.stepsToday||0).toLocaleString("es-ES")}</strong><span>${snap.stepsToday?"pasos registrados":"Dato no disponible"}</span></article></div><section class="ai-panel"><div class="ai-panel-title"><div><p class="eyebrow">HEALTH TRUTH</p><h3>Procedencia y trazabilidad</h3></div><span class="ai-live-dot">● SOLO DATOS REALES</span></div><div class="ai-health-trace"><span><b>${snap.records.length}</b> registros normalizados</span><span><b>${esc(snap.meta?.source||"—")}</b> origen bridge</span><span><b>${esc(snap.meta?.device_source||"—")}</b> dispositivo/fuente</span><span><b>${snap.workoutsToday?.length||0}</b> entrenamientos externos hoy</span></div></section>`}`;
  }

  let selected="", tab="resumen";
  function render() {
    const area=document.getElementById("aiWorkspace"); if(!area) return;
    if(!selected){ area.innerHTML=`<div class="ai-empty"><span>🧠</span><h3>Selecciona un deportista</h3><p>P.P.F. construirá su lectura inteligente sin modificar sesiones ni notificaciones.</p></div>`; return; }
    const m=buildModel(selected);
    area.innerHTML = tab==="patrones" ? patternsHTML(m) : tab==="evolucion" ? evolutionHTML(m) : tab==="salud" ? healthHTML(m) : summaryHTML(m);
    area.querySelector("#aiMarkReviewed")?.addEventListener("click",()=>{ localStorage.setItem(lastReviewKey(selected),new Date().toISOString()); render(); window.PPF_FEEDBACK?.success?.("Control del Deportista marcado como revisado."); });
    area.querySelectorAll("[data-ai-go]").forEach(btn=>btn.addEventListener("click",()=>{
      const target = btn.dataset.aiGo;
      if (target === "graficaPro" && selected) {
        sessionStorage.setItem("ppf:athlete-intelligence:handoff:graph-pro", selected);
      }
      document.querySelector(`[data-section="${target}"]`)?.click();
    }));
  }
  function mount(){
    const select=document.getElementById("aiPatientSelect"); if(!select) return;
    // Entrada desde menú: siempre limpia. Entrada contextual: conserva el deportista enviado por la pantalla origen.
    const handoff=sessionStorage.getItem("ppf:athlete-intelligence:handoff:control")||"";
    sessionStorage.removeItem("ppf:athlete-intelligence:handoff:control");
    selected=""; select.value="";
    if(handoff && [...select.options].some(o=>identity(o.value)===identity(handoff))){ const option=[...select.options].find(o=>identity(o.value)===identity(handoff)); select.value=option.value; selected=option.value; }
    select.addEventListener("change",()=>{selected=select.value; render();});
    document.querySelectorAll("[data-ai-tab]").forEach(btn=>btn.addEventListener("click",()=>{tab=btn.dataset.aiTab; document.querySelectorAll("[data-ai-tab]").forEach(x=>x.classList.toggle("active",x===btn)); render();}));
    render();
  }
  window.PPF_ATHLETE_INTELLIGENCE = Object.freeze({version:"3.6.0-alpha.1", shellHTML, mount, buildModel});
})();
