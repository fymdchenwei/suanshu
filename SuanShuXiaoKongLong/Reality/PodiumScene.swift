import RealityKit
import SwiftUI
import UIKit

final class PodiumScene {
    let anchor = AnchorEntity(world: .zero)
    private let dinosaur: Entity
    private let chest: ChestAnimator
    private let baseDinoY: Float

    init() {
        addBlock(number: "2", center: [-0.34, 0, 0], size: [0.28, 0.26, 0.28], color: Clay.goldDark)
        addBlock(number: "1", center: [0, 0, 0], size: [0.32, 0.42, 0.32], color: Clay.gold)
        addBlock(number: "3", center: [0.32, 0, 0], size: [0.26, 0.18, 0.26], color: Clay.goldDark)

        let dinosaur = DinosaurFactory.make(scale: 0.7, waving: true, cape: true)
        dinosaur.position = [0, 0.42, 0.02]
        self.dinosaur = dinosaur
        baseDinoY = dinosaur.position.y
        anchor.addChild(dinosaur)

        chest = ChestAnimator(scale: 0.7)
        chest.open = true
        chest.root.position = [0.78, 0, 0.05]
        anchor.addChild(chest.root)

        let panda = PropFactory.panda()
        panda.scale = SIMD3(repeating: 0.85)
        panda.position = [0.78, 0.28, 0.08]
        anchor.addChild(panda)

        RealityHost.addLights(to: anchor)
        RealityHost.addCamera(to: anchor, eye: [0.15, 0.95, 2.05], target: [0.1, 0.32, 0], fov: 34)
    }

    func update(time: TimeInterval) {
        var position = dinosaur.position
        position.y = baseDinoY + sin(Float(time) * 2.3) * 0.016
        dinosaur.position = position
        chest.update()
    }

    private func addBlock(number: String, center: SIMD3<Float>, size: SIMD3<Float>, color: UIColor) {
        let block = ModelEntity(
            mesh: .generateBox(width: size.x, height: size.y, depth: size.z, cornerRadius: 0.02),
            materials: [Clay.material(color)]
        )
        block.position = [center.x, size.y / 2, center.z]
        let plate = ModelEntity(
            mesh: .generateBox(width: size.x * 0.46, height: size.x * 0.46, depth: 0.016, cornerRadius: 0.004),
            materials: [NumberTexture.material(text: number, background: color, foreground: .white)]
        )
        plate.position = [0, size.y * 0.08, size.z / 2 + 0.008]
        block.addChild(plate)
        anchor.addChild(block)
    }
}

struct PodiumViewport: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> ARView {
        let view = RealityHost.makeView(background: Theme.uiColor(0.36, 0.16, 0.58))
        view.scene.addAnchor(context.coordinator.scene.anchor)
        context.coordinator.driver.onFrame = { [weak scene = context.coordinator.scene] time in
            scene?.update(time: time)
        }
        context.coordinator.driver.start()
        return view
    }

    func updateUIView(_ uiView: ARView, context: Context) {}

    static func dismantleUIView(_ uiView: ARView, coordinator: Coordinator) {
        coordinator.driver.stop()
        uiView.session.pause()
        uiView.scene.anchors.removeAll()
    }

    final class Coordinator {
        let scene = PodiumScene()
        let driver = DisplayLinkDriver()
    }
}
