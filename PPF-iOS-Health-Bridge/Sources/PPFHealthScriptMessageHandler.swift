import Foundation
import WebKit

final class PPFHealthScriptMessageHandler: NSObject, WKScriptMessageHandler {

    static let messageName = "ppfHealth"

    private weak var webView: WKWebView?

    private let healthManager: PPFHealthKitManager
    private let webBridge: PPFHealthWebBridge

    var onOpenPermissions: (() -> Void)?

    init(
        webView: WKWebView,
        healthManager: PPFHealthKitManager = .shared
    ) {
        self.webView = webView
        self.healthManager = healthManager
        self.webBridge = PPFHealthWebBridge(
            healthManager: healthManager
        )

        super.init()
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {

        guard message.name == Self.messageName else {
            return
        }

        guard let body = message.body as? [String: Any] else {
            print("P.P.F. iOS Health Bridge: mensaje invalido.")
            return
        }

        guard
            let rawAction = body["action"] as? String,
            let action = Action(rawValue: rawAction)
        else {
            print("P.P.F. iOS Health Bridge: accion desconocida.")
            return
        }

        let athleteID =
            (body["athlete_id"] as? String)?
                .trimmingCharacters(in: .whitespacesAndNewlines)

        let metrics =
            body["metrics"] as? [String] ?? []

        Task { @MainActor [weak self] in

            guard let self else {
                return
            }

            await self.handle(
                action: action,
                athleteID: athleteID,
                metrics: metrics
            )
        }
    }

    // MARK: - Dispatcher

    @MainActor
    private func handle(
        action: Action,
        athleteID: String?,
        metrics: [String]
    ) async {

        guard let webView else {
            print("P.P.F. iOS Health Bridge: WKWebView no disponible.")
            return
        }

        do {

            switch action {

            case .requestPermissions:

                try await healthManager.requestAuthorization()

                try await webBridge.pushHealthSnapshot(
                    to: webView
                )

            case .sync:

                try await webBridge.pushHealthSnapshot(
                    to: webView
                )

            case .openPermissions:

                onOpenPermissions?()
            }

        } catch {

            print(
                "P.P.F. iOS Health Bridge error " +
                "[\(action.rawValue)] " +
                "athlete=\(athleteID ?? "-") " +
                "metrics=\(metrics): \(error)"
            )
        }
    }

    // MARK: - Actions from cliente.js

    private enum Action: String {

        case requestPermissions
        case sync
        case openPermissions
    }
}
