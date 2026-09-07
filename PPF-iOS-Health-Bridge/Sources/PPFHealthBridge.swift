import Foundation

extension PPFHealthKitManager {

    // MARK: - P.P.F. Health Bridge

    func exportHealthSnapshotJSON() async throws -> String {

        // 1. Solicitar / verificar autorización HealthKit
        try await requestAuthorization()

        // 2. Construir snapshot unificado
        let snapshot = try await buildHealthSnapshot()

        // 3. Convertir snapshot a JSON transportable
        return try PPFHealthSnapshotEncoder.encodeString(snapshot)
    }

    // MARK: - Raw Snapshot Export

    func exportHealthSnapshot() async throws -> PPFHealthSnapshot {

        try await requestAuthorization()

        return try await buildHealthSnapshot()
    }
}
