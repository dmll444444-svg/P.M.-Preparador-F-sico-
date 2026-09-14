import Foundation
import WebKit

@MainActor
final class PPFWebViewHost {

    let webView: WKWebView

    private let healthMount: PPFHealthWebMessageMount

    init(
        healthManager: PPFHealthKitManager = .shared,
        onOpenPermissions: (() -> Void)? = nil
    ) {
        let configuration = WKWebViewConfiguration()

        let webView = WKWebView(
            frame: .zero,
            configuration: configuration
        )

        self.webView = webView

        self.healthMount = PPFHealthWebMessageMount(
            webView: webView,
            healthManager: healthManager,
            onOpenPermissions: onOpenPermissions
        )

        healthMount.mount()
    }

    func load(_ request: URLRequest) {
        webView.load(request)
    }

    func loadFile(
        _ fileURL: URL,
        allowingReadAccessTo readAccessURL: URL
    ) {
        webView.loadFileURL(
            fileURL,
            allowingReadAccessTo: readAccessURL
        )
    }

    func unmount() {
        healthMount.unmount()
    }

    deinit {
        healthMount.unmount()
    }
}
