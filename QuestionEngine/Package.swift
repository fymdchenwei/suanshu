// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "QuestionEngine",
    products: [
        .library(name: "QuestionEngine", targets: ["QuestionEngine"])
    ],
    targets: [
        .target(name: "QuestionEngine"),
        .testTarget(
            name: "QuestionEngineTests",
            dependencies: ["QuestionEngine"]
        )
    ]
)
