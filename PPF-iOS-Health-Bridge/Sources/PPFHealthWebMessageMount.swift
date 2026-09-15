import Foundation
import WebKit

@MainActor
final class PPFHealthWebMessageMount {

    private weak var webView: WKWebView?
    private let handler: PPFHealthScriptMessageHandler
    private var isMounted = false

    init(
        webView: WKWebView,
        healthManager: PPFHealthKitManager = .shared,
        onOpenPermissions: (() -> Void)? = nil
    ) {
        self.webView = webView

        self.handler = PPFHealthScriptMessageHandler(
            webView: webView,
            healthManager: healthManager
        )

        self.handler.onOpenPermissions = onOpenPermissions

        mount()
    }

    func mount() {

        guard !isMounted else {
            return
        }

        guard let webView else {
            print("P.P.F. iOS Health Bridge: WKWebView no disponible para montaje.")
            return
        }

        let userContentController =
            webView.configuration.userContentController

        userContentController.add(
            handler,
            name: PPFHealthScriptMessageHandler.messageName
        )

        isMounted = true
    }

    func unmount() {

        guard isMounted else {
            return
        }

        guard let webView else {
            isMounted = false
            return
        }

        webView
            .configuration
            .userContentController
            .removeScriptMessageHandler(
                forName: PPFHealthScriptMessageHandler.messageName
            )

        isMounted = false
    }

}
