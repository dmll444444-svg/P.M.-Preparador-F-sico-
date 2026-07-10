# FASE 2 · Sincronización automática de presencia

- Admin, Cliente Web y PWA hacen `pull` automático desde Supabase.
- Intervalo de presencia: 10 segundos en Admin y Cliente.
- El panel Usuarios se refresca sin F5.
- Se escuchan cambios locales, remotos y entre pestañas.
- Todos leen la misma clave `userStats`.
