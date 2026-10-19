import SwiftUI

@main
struct PPFSafeApp: App {

    var body: some Scene {
        WindowGroup {
            PPFSafeDiagnosticView()
        }
    }
}

private struct PPFSafeDiagnosticView: View {

    var body: some View {
        VStack(spacing: 20) {

            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 64))
                .foregroundStyle(.green)

            Text("P.P.F.")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Preparador Físico")
                .font(.title2)

            Text("Diagnóstico nativo iOS")
                .font(.headline)

            Text("SwiftUI inicializado correctamente")
                .multilineTextAlignment(.center)

            Text("HealthKit desactivado")
                .foregroundStyle(.secondary)

            Text("Supabase no conectado")
                .foregroundStyle(.secondary)

            Text("Compilación técnica de prueba")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(24)
    }
}