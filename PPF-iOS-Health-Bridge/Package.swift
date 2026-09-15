// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "PPFiOSHealthBridge",
    platforms: [
        .iOS(.v18)
    ],
    products: [
        .library(
            name: "PPFiOSHealthBridge",
            targets: ["PPFiOSHealthBridge"]
        )
    ],
    targets: [
        .target(
            name: "PPFiOSHealthBridge",
            path: "Sources",
            exclude: [
                "PPFHealthWebBridge.swift.OP13.bak"
            ]
        )
    ]
)