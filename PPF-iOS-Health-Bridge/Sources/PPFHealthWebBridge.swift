import Foundation
import WebKit

@MainActor
final class PPFHealthWebBridge {

    private let healthManager: PPFHealthKitManager

    init(healthManager: PPFHealthKitManager) {
        self.healthManager = healthManager
    }

    // MARK: - HealthKit -> P.P.F. Web

    func pushHealthSnapshot(
        to webView: WKWebView
    ) async throws {

        // Core HealthKit keeps ownership of authorization
        // and snapshot creation.
        let snapshot = try await healthManager.exportHealthSnapshot()

        // Convert the native aggregate snapshot into the
        // normalized contract consumed by P.P.F. Web.
        let payload = PPFHealthWebPayload.make(from: snapshot)

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601

        let data = try encoder.encode(payload)

        guard let json = String(
            data: data,
            encoding: .utf8
        ) else {
            throw PPFHealthWebBridgeError.invalidUTF8
        }

        // Pass JSON as a WKWebView argument.
        // No raw JSON interpolation into JavaScript source.
        _ = try await webView.callAsyncJavaScript(
            """
            const payload = JSON.parse(healthPayload);

            if (
                window.PPF_HEALTH_BRIDGE &&
                typeof window.PPF_HEALTH_BRIDGE.ingest === "function"
            ) {
                window.PPF_HEALTH_BRIDGE.ingest(payload);
            } else {
                throw new Error("P.P.F. Health Web Bridge not available");
            }
            """,
            arguments: [
                "healthPayload": json
            ],
            in: nil,
            contentWorld: .page
        )
    }
}

// MARK: - Bridge Errors

enum PPFHealthWebBridgeError: LocalizedError {

    case invalidUTF8

    var errorDescription: String? {
        switch self {
        case .invalidUTF8:
            return "No se pudo convertir el payload HealthKit a JSON UTF-8."
        }
    }
}
