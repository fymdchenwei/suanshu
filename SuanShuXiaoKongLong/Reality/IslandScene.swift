import RealityKit
import SwiftUI
import UIKit

final class IslandScene {
    let anchor = AnchorEntity(world: .zero)
    private let dinosaur: Entity
    private let chest: ChestAnimator
    private let baseDinoY: Float

    init() {
        let dirt = ModelEntity(
            mesh: .generateCylinder(height: 0.36, radius: 0.95),
            materials: [Clay.material(Clay.dirt)]
        )
        dirt.position = [0, -0.08, 0]
        anchor.addChild(dirt)

        let rim = ModelEntity(
            mesh: .generateCylinder(height: 0.08, radius: 1.02),
            materials: [Clay.material(Clay.dirtDark)]
        )
        rim.position = [0, 0.04, 0]
        anchor.addChild(rim)

        let grass = ModelEntity(
            mesh: .generateCylinder(height: 0.12, radius: 1.0),
            materials: [Clay.material(Clay.grass)]
        )
        grass.position = [0, 0.10, 0]
        anchor.addChild(grass)

        for spot in [SIMD3<Float>(-0.7, -0.05, 0.35), SIMD3<Float>(0.62, -0.08, -0.2), SIMD3<Float>(0.1, -0.12, 0.7)] {
            let rock = Clay.sphere(0.11, Clay.dirtDark)
            rock.scale = [1.1, 0.7, 0.9]
            rock.position = spot
            anchor.addChild(rock)
        }

        let path: [(SIMD3<Float>, String, UIColor)] = [
            ([-0.42, 0.18, 0.22], "★", Clay.gold),
            ([-0.12, 0.18, 0.02], "2", Clay.gold),
            ([0.16, 0.18, 0.16], "3", Clay.stone),
            ([0.38, 0.18, -0.10], "4", Clay.stone),
            ([0.10, 0.18, -0.30], "5", Clay.stone),
            ([-0.24, 0.18, -0.42], "6", Clay.stone)
        ]
        for item in path {
            anchor.addChild(Self.steppingStone(text: item.1, fill: item.2, at: item.0, radius: 0.11))
        }

        let dinosaur = DinosaurFactory.make(scale: 0.78, waving: true, cape: false)
        dinosaur.position = [0.02, 0.17, 0.42]
        self.dinosaur = dinosaur
        baseDinoY = dinosaur.position.y
        anchor.addChild(dinosaur)

        chest = ChestAnimator(scale: 0.72)
        chest.root.position = [0.58, 0.16, 0.18]
        anchor.addChild(chest.root)

        let palmA = PropFactory.palm(height: 0.42)
        palmA.position = [-0.62, 0.16, -0.18]
        anchor.addChild(palmA)
        let palmB = PropFactory.palm(height: 0.34)
        palmB.position = [0.48, 0.16, -0.48]
        anchor.addChild(palmB)
        let palmC = PropFactory.palm(height: 0.28)
        palmC.position = [-0.28, 0.16, -0.62]
        anchor.addChild(palmC)

        let flowerSpots: [(SIMD3<Float>, UIColor)] = [
            ([-0.55, 0.16, 0.35], Clay.flowerPink),
            ([0.25, 0.16, 0.48], Clay.flowerYellow),
            ([-0.15, 0.16, -0.15], Clay.flowerPink),
            ([0.62, 0.16, -0.08], Clay.flowerYellow),
            ([-0.48, 0.16, -0.05], Clay.flowerPink)
        ]
        for spot in flowerSpots {
            let flower = PropFactory.flower(color: spot.1)
            flower.position = spot.0
            anchor.addChild(flower)
        }

        let cloudA = PropFactory.cloud(scale: 1)
        cloudA.position = [-0.85, 1.15, -0.35]
        anchor.addChild(cloudA)
        let cloudB = PropFactory.cloud(scale: 0.75)
        cloudB.position = [0.9, 1.25, -0.2]
        anchor.addChild(cloudB)

        RealityHost.addLights(to: anchor)
        RealityHost.addCamera(to: anchor, eye: [0.05, 1.35, 2.75], target: [0, 0.28, 0], fov: 33)
    }

    func update(time: TimeInterval) {
        var position = dinosaur.position
        position.y = baseDinoY + sin(Float(time) * 2.1) * 0.018
        dinosaur.position = position
        chest.update()
    }

    static func steppingStone(text: String, fill: UIColor, at position: SIMD3<Float>, radius: Float) -> Entity {
        let root = Entity()
        root.position = position
        let body = ModelEntity(
            mesh: .generateCylinder(height: 0.055, radius: radius),
            materials: [Clay.material(fill)]
        )
        root.addChild(body)
        let plate = ModelEntity(
            mesh: .generatePlane(width: radius * 1.55, depth: radius * 1.55),
            materials: [NumberTexture.material(text: text, background: fill, foreground: .white)]
        )
        plate.position = [0, 0.03, 0]
        root.addChild(plate)
        return root
    }
}

struct IslandViewport: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> ARView {
        let view = RealityHost.makeView(background: Theme.uiColor(0.43, 0.78, 0.98))
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
        let scene = IslandScene()
        let driver = DisplayLinkDriver()
    }
}
