import SwiftUI
import WebKit

@main
struct PPFAppOwner: App {

    var body: some Scene {
        WindowGroup {
            PPFWebContainer()
        }
    }
}

@MainActor
private final class PPFAppOwnerState: ObservableObject {

    let host: PPFWebViewHost

    @Published private(set) var loadError: Error?

    private var didStart = false

    init() {
        self.host = PPFWebViewHost()
    }

    func startIfNeeded() {
        guard !didStart else {
            return
        }

        didStart = true

        do {
            try host.loadRuntimeEntryPoint()
        } catch {
            loadError = error
        }
    }

    func shutdown() {
        host.unmount()
    }
}

private struct PPFWebContainer: View {

    @StateObject private var owner = PPFAppOwnerState()

    var body: some View {
        PPFWebViewSurface(webView: owner.host.webView)
            .task {
                owner.startIfNeeded()
            }
            .onDisappear {
                owner.shutdown()
            }
    }
}

private struct PPFWebViewSurface: UIViewRepresentable {

    let webView: WKWebView

    func makeUIView(context: Context) -> WKWebView {
        webView
    }

    func updateUIView(
        _ uiView: WKWebView,
        context: Context
    ) {
    }
}