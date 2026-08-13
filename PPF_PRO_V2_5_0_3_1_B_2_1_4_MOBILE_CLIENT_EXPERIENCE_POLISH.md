# PPF PRO v2.5.0.3.1.B.2.1.4 · Mobile Client Experience Polish

## Objetivo
Pulido específico de la experiencia móvil del cliente sin alterar el layout de escritorio ni la lógica funcional de B.2.1.3.

## Cambios
- Navegación inferior cliente redistribuida en 4 columnas reales de igual anchura.
- Eliminado el hueco heredado del antiguo quinto acceso «Mis archivos».
- Avatar/inicial del header oculto exclusivamente en móvil.
- Nombre del cliente gana anchura útil y conserva truncado seguro para nombres excepcionalmente largos.
- Botón «Cerrar sesión» forzado a una sola línea.
- Mayor reserva inferior del contenido para evitar que la navegación fija tape las últimas tarjetas, incluyendo safe-area.
- Hero y Smart Training CTA permanecen intactos.
- Escritorio permanece intacto.

## Archivos
- `style.css`
- `cliente.html` (cache-busting)
- `app-version.js`
