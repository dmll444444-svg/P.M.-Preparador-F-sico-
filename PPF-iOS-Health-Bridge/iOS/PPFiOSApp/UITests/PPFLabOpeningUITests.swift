import XCTest

final class PPFLabOpeningUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testOpenPPFLaboratory() throws {
        let app = XCUIApplication()
        app.launch()

        let openButton = app.buttons["Abrir P.P.F."]

        XCTAssertTrue(
            openButton.waitForExistence(timeout: 20),
            "The P.P.F. opening button was not found."
        )

        XCTAssertTrue(
            openButton.isHittable,
            "The P.P.F. opening button is not hittable."
        )

        openButton.tap()

        let webView = app.webViews.firstMatch

        XCTAssertTrue(
            webView.waitForExistence(timeout: 20),
            "The P.P.F. laboratory WebView did not appear."
        )

        let laboratoryTitle = webView.staticTexts[
            "Laboratorio local iOS"
        ]

        XCTAssertTrue(
            laboratoryTitle.waitForExistence(timeout: 20),
            "The local HTML laboratory title was not found."
        )

        let screenshot = XCUIScreen.main.screenshot()

        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = "PPF-Laboratorio-Abierto"
        attachment.lifetime = .keepAlways

        add(attachment)
    }

    func testClosePPFLaboratory() throws {
        let app = XCUIApplication()
        app.launch()

        let openButton = app.buttons["Abrir P.P.F."]

        XCTAssertTrue(
            openButton.waitForExistence(timeout: 20),
            "The P.P.F. opening button was not found."
        )

        openButton.tap()

        let webView = app.webViews.firstMatch

        XCTAssertTrue(
            webView.waitForExistence(timeout: 20),
            "The P.P.F. laboratory WebView did not appear."
        )

        let closeButton = app.buttons["Cerrar"]

        XCTAssertTrue(
            closeButton.waitForExistence(timeout: 20),
            "The P.P.F. closing button was not found."
        )

        closeButton.tap()

        XCTAssertTrue(
            openButton.waitForExistence(timeout: 20),
            "The P.P.F. initial opening button did not return."
        )

        XCTAssertFalse(
            webView.exists,
            "The P.P.F. laboratory WebView remained visible."
        )
    }
}
