import RealityKit
import SwiftUI
import UIKit

final class QuizScene {
    let anchor = AnchorEntity(world: .zero)
    private let dinosaur: Entity
    private var stones: [ModelEntity] = []
    private let chest: ChestAnimator
    private var landed = 0
    private var hop: Hop?
    private let standY: Float = 0.12

    private struct Hop {
        var from: SIMD3<Float>
        var to: SIMD3<Float>
        var start: TimeInterval
    }

    init() {
        let hill = ModelEntity(
            mesh: .generateSphere(radius: 1.15),
            materials: [Clay.material(Clay.grass)]
        )
        hill.scale = [2.5, 0.16, 0.55]
        hill.position = [0, -0.16, 0]
        anchor.addChild(hill)

        for index in 0..<10 {
            let stone = ModelEntity(
                mesh: PrimitiveMesh.cylinder(height: 0.06, radius: 0.13),
                materials: [Clay.material(Clay.stone)]
            )
            stone.position = stonePosition(index)
            stone.name = "stone-\(index)"
            stones.append(stone)
            anchor.addChild(stone)
        }

        dinosaur = DinosaurFactory.make(scale: 0.62, waving: false, cape: false)
        dinosaur.position = standPosition(0)
        anchor.addChild(dinosaur)

        chest = ChestAnimator(scale: 0.55)
        chest.root.position = [2.15, 0.02, 0.05]
        anchor.addChild(chest.root)

        let flowerA = PropFactory.flower(color: Clay.flowerPink)
        flowerA.position = [-1.5, 0.02, 0.28]
        anchor.addChild(flowerA)
        let flowerB = PropFactory.flower(color: Clay.flowerYellow)
        flowerB.position = [1.35, 0.02, -0.22]
        anchor.addChild(flowerB)

        recolor()
        RealityHost.addLights(to: anchor)
        RealityHost.addCamera(to: anchor, eye: [0, 0.72, 1.85], target: [0, 0.12, 0], fov: 30)
    }

    func setLanded(_ value: Int) {
        let clamped = min(max(value, 0), 10)
        guard clamped != landed || hop != nil else {
            recolor()
            return
        }
        if clamped < landed {
            hop = nil
            landed = clamped
            dinosaur.position = standPosition(clamped)
            recolor()
            return
        }
        if clamped == landed {
            return
        }
        hop = Hop(from: dinosaur.position, to: standPosition(clamped), start: CACurrentMediaTime())
        landed = clamped
        recolor()
    }

    func setChestOpen(_ open: Bool) {
        chest.open = open
    }

    func update(time: TimeInterval) {
        if let hop {
            let raw = min(1, Float((time - hop.start) / 0.38))
            let eased = raw * raw * (3 - 2 * raw)
            var position = hop.from + (hop.to - hop.from) * eased
            position.y += sin(raw * .pi) * 0.15
            dinosaur.position = position
            if raw >= 1 {
                self.hop = nil
            }
        } else {
            var position = standPosition(landed)
            position.y += sin(Float(time) * 2.4) * 0.012
            dinosaur.position = position
        }

        if landed < stones.count {
            let pulse = 1 + 0.07 * sin(Float(time) * 5)
            stones[landed].scale = [pulse, 1, pulse]
        }
        chest.update()
    }

    private func recolor() {
        for index in stones.indices {
            let color: UIColor
            if index < landed {
                color = Clay.gold
            } else if index == landed {
                color = Clay.stoneNext
            } else {
                color = Clay.stone
            }
            stones[index].model?.materials = [Clay.material(color)]
            if index != landed {
                stones[index].scale = [1, 1, 1]
            }
        }
    }

    private func stonePosition(_ index: Int) -> SIMD3<Float> {
        let t = Float(index) / 9
        let x = -1.7 + 3.4 * t
        let z = sin(t * .pi) * 0.08
        return [x, 0.04, z]
    }

    private func standPosition(_ landedCount: Int) -> SIMD3<Float> {
        if landedCount <= 0 {
            return [-2.05, standY, 0.02]
        }
        var position = stonePosition(landedCount - 1)
        position.y = standY
        return position
    }
}

struct QuizViewport: UIViewRepresentable {
    var landed: Int
    var chestOpen: Bool

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> ARView {
        let view = RealityHost.makeView(background: Theme.uiColor(0.48, 0.80, 0.36))
        let scene = context.coordinator.scene
        view.scene.addAnchor(scene.anchor)
        scene.setLanded(landed)
        scene.setChestOpen(chestOpen)
        context.coordinator.driver.onFrame = { [weak scene] time in
            scene?.update(time: time)
        }
        context.coordinator.driver.start()
        return view
    }

    func updateUIView(_ uiView: ARView, context: Context) {
        context.coordinator.scene.setLanded(landed)
        context.coordinator.scene.setChestOpen(chestOpen)
    }

    static func dismantleUIView(_ uiView: ARView, coordinator: Coordinator) {
        coordinator.driver.stop()
        uiView.session.pause()
        uiView.scene.anchors.removeAll()
    }

    final class Coordinator {
        let scene = QuizScene()
        let driver = DisplayLinkDriver()
    }
}
