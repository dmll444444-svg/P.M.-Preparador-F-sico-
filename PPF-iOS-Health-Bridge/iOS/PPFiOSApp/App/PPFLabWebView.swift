import SwiftUI
import WebKit

/// Experimental, local-only PPF web laboratory.
///
/// This component does not mount the existing HealthKit
/// JavaScript bridge and does not connect to Supabase.
struct PPFLabWebView: UIViewRepresentable {

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()

        // No JavaScript message handlers are registered.
        // In particular, no HealthKit bridge is mounted.
        let webView = WKWebView(
            frame: .zero,
            configuration: configuration
        )

        webView.navigationDelegate = context.coordinator
        webView.isInspectable = false

        webView.allowsBackForwardNavigationGestures = false

        guard let directory = Bundle.main.url(
            forResource: "PPFWeb",
            withExtension: nil
        ) else {
            context.coordinator.showError(
                in: webView,
                message: "No se encontro la carpeta PPFWeb."
            )
            return webView
        }

        let indexURL = directory.appendingPathComponent(
            "index.html",
            isDirectory: false
        )

        guard FileManager.default.fileExists(
            atPath: indexURL.path
        ) else {
            context.coordinator.showError(
                in: webView,
                message: "No se encontro PPFWeb/index.html."
            )
            return webView
        }

        context.coordinator.allowedDirectory = directory
        context.coordinator.allowedIndexURL = indexURL

        webView.loadFileURL(
            indexURL,
            allowingReadAccessTo: directory
        )

        return webView
    }

    func updateUIView(
        _ uiView: WKWebView,
        context: Context
    ) {
        // The laboratory is loaded only once.
    }

    final class Coordinator: NSObject, WKNavigationDelegate {

        var allowedDirectory: URL?
        var allowedIndexURL: URL?

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let destination = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            // Only the original local laboratory document
            // is accepted as a top-level navigation.
            if navigationAction.targetFrame?.isMainFrame == true {
                guard destination.isFileURL,
                      let index = allowedIndexURL,
                      destination.standardizedFileURL == index.standardizedFileURL
                else {
                    decisionHandler(.cancel)
                    return
                }

                decisionHandler(.allow)
                return
            }

            // Reject explicit non-file navigations.
            guard destination.isFileURL,
                  let directory = allowedDirectory
            else {
                decisionHandler(.cancel)
                return
            }

            let directoryPath = directory.standardizedFileURL.path
            let destinationPath = destination.standardizedFileURL.path

            let prefix = directoryPath.hasSuffix("/")
                ? directoryPath
                : directoryPath + "/"

            guard destinationPath.hasPrefix(prefix) else {
                decisionHandler(.cancel)
                return
            }

            decisionHandler(.allow)
        }

        func webView(
            _ webView: WKWebView,
            didFail navigation: WKNavigation!,
            withError error: Error
        ) {
            NSLog("PPF LAB navigation failed: %@", error.localizedDescription)
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            NSLog("PPF LAB load failed: %@", error.localizedDescription)
        }

        func showError(in webView: WKWebView, message: String) {
            NSLog("PPF LAB: %@", message)

            // Deliberately no remote fallback.
            // No HTML is injected and no network URL is loaded.
        }
    }
}
