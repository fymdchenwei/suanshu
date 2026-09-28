import RealityKit
import simd
import UIKit

enum DinosaurFactory {
    static func make(scale: Float, waving: Bool, cape: Bool) -> Entity {
        let root = Entity()
        root.name = "dinosaur"
        root.scale = SIMD3(repeating: scale)

        let body = Clay.sphere(0.16, Clay.green)
        body.scale = [1.12, 0.92, 0.95]
        body.position = [0, 0.30, 0]
        root.addChild(body)

        let belly = Clay.sphere(0.105, Clay.belly)
        belly.scale = [0.92, 0.82, 0.5]
        belly.position = [0, -0.02, 0.09]
        body.addChild(belly)

        let head = Clay.sphere(0.125, Clay.green)
        head.position = [0, 0.15, 0.10]
        body.addChild(head)

        let snout = Clay.sphere(0.055, Clay.green)
        snout.scale = [1.05, 0.7, 1.3]
        snout.position = [0, -0.02, 0.10]
        head.addChild(snout)

        let mouth = Clay.sphere(0.028, Clay.pupil)
        mouth.scale = [1.15, 0.5, 0.4]
        mouth.position = [0, -0.012, 0.045]
        snout.addChild(mouth)

        addEye(to: head, x: -0.045)
        addEye(to: head, x: 0.045)

        let blushLeft = Clay.sphere(0.02, Clay.pink)
        blushLeft.scale = [1, 0.65, 0.4]
        blushLeft.position = [-0.07, -0.02, 0.09]
        head.addChild(blushLeft)
        let blushRight = Clay.sphere(0.02, Clay.pink)
        blushRight.scale = [1, 0.65, 0.4]
        blushRight.position = [0.07, -0.02, 0.09]
        head.addChild(blushRight)

        let spikeSpots: [SIMD3<Float>] = [
            [0, 0.13, -0.05],
            [0, 0.15, 0.03],
            [0, 0.11, 0.10]
        ]
        for spot in spikeSpots {
            let spike = ModelEntity(
                mesh: PrimitiveMesh.cone(height: 0.075, radius: 0.03),
                materials: [Clay.material(Clay.orange)]
            )
            spike.position = spot
            body.addChild(spike)
        }

        body.addChild(arm(x: -0.15, waving: waving))
        body.addChild(arm(x: 0.15, waving: false))

        root.addChild(leg(x: -0.07))
        root.addChild(leg(x: 0.07))

        let tail = Clay.sphere(0.065, Clay.green)
        tail.scale = [0.65, 0.6, 1.55]
        tail.position = [0, 0.25, -0.18]
        root.addChild(tail)
        let tip = Clay.sphere(0.035, Clay.green)
        tip.position = [0, 0.02, -0.08]
        tail.addChild(tip)

        if cape {
            let capeBody = ModelEntity(
                mesh: .generateBox(width: 0.20, height: 0.22, depth: 0.02, cornerRadius: 0.006),
                materials: [Clay.material(Clay.red)]
            )
            capeBody.position = [0, 0.34, -0.10]
            capeBody.orientation = simd_quatf(angle: 0.35, axis: [1, 0, 0])
            root.addChild(capeBody)
        }

        let shadow = ModelEntity(
            mesh: PrimitiveMesh.cylinder(height: 0.012, radius: 0.14),
            materials: [Clay.material(Clay.greenDark)]
        )
        shadow.position = [0, 0.006, 0.02]
        root.addChild(shadow)
        return root
    }

    private static func addEye(to head: Entity, x: Float) {
        let eye = Clay.sphere(0.032, .white)
        eye.position = [x, 0.025, 0.095]
        head.addChild(eye)
        let pupil = Clay.sphere(0.016, Clay.pupil)
        pupil.position = [0, -0.002, 0.02]
        eye.addChild(pupil)
        let shine = Clay.sphere(0.007, .white)
        shine.position = [-0.006, 0.006, 0.012]
        pupil.addChild(shine)
    }

    private static func arm(x: Float, waving: Bool) -> Entity {
        let arm = Clay.sphere(0.045, Clay.green)
        arm.scale = [0.7, 1.15, 0.7]
        if waving {
            arm.position = [x, 0.08, 0.05]
            let direction: Float = x < 0 ? 1 : -1
            arm.orientation = simd_quatf(angle: 0.9 * direction, axis: [0, 0, 1])
        } else {
            arm.position = [x, 0.0, 0.08]
        }
        return arm
    }

    private static func leg(x: Float) -> Entity {
        let leg = Clay.sphere(0.05, Clay.green)
        leg.scale = [0.8, 1.15, 0.8]
        leg.position = [x, 0.12, 0.03]
        let foot = Clay.sphere(0.038, Clay.greenDark)
        foot.scale = [1.35, 0.5, 1.35]
        foot.position = [0, -0.045, 0.02]
        leg.addChild(foot)
        return leg
    }
}

final class ChestAnimator {
    let root: Entity
    private let hinge: Entity
    private let glow: Entity
    var open = false
    private var angle: Float = -0.04

    init(scale: Float) {
        root = Entity()
        root.name = "chest"
        root.scale = SIMD3(repeating: scale)

        let base = ModelEntity(
            mesh: .generateBox(width: 0.34, height: 0.18, depth: 0.22, cornerRadius: 0.02),
            materials: [Clay.material(Clay.chest)]
        )
        base.position = [0, 0.09, 0]
        root.addChild(base)

        let band = ModelEntity(
            mesh: .generateBox(width: 0.36, height: 0.035, depth: 0.235, cornerRadius: 0.01),
            materials: [Clay.material(Clay.gold)]
        )
        band.position = [0, 0.11, 0]
        root.addChild(band)

        let latch = ModelEntity(
            mesh: .generateBox(width: 0.05, height: 0.05, depth: 0.02, cornerRadius: 0.008),
            materials: [Clay.material(Clay.gold)]
        )
        latch.position = [0, 0.12, 0.12]
        root.addChild(latch)

        hinge = Entity()
        hinge.position = [0, 0.18, -0.11]
        root.addChild(hinge)

        let lid = ModelEntity(
            mesh: .generateBox(width: 0.34, height: 0.06, depth: 0.22, cornerRadius: 0.015),
            materials: [Clay.material(Clay.goldDark)]
        )
        lid.position = [0, 0.03, 0.11]
        hinge.addChild(lid)

        let lidBand = ModelEntity(
            mesh: .generateBox(width: 0.36, height: 0.025, depth: 0.23, cornerRadius: 0.008),
            materials: [Clay.material(Clay.gold)]
        )
        lidBand.position = [0, 0.05, 0.11]
        hinge.addChild(lidBand)

        glow = Clay.sphere(0.06, Clay.gold)
        glow.position = [0, 0.16, 0]
        glow.scale = SIMD3(repeating: 0.01)
        root.addChild(glow)
    }

    func update() {
        let target: Float = open ? -1.2 : -0.04
        angle += (target - angle) * 0.14
        hinge.orientation = simd_quatf(angle: angle, axis: [1, 0, 0])
        let shown = max(0, min(1, (abs(angle) - 0.15) / 1.0))
        glow.scale = SIMD3(repeating: max(0.01, shown))
    }
}

enum PropFactory {
    static func palm(height: Float) -> Entity {
        let root = Entity()
        let trunk = ModelEntity(
            mesh: PrimitiveMesh.cylinder(height: height, radius: 0.035),
            materials: [Clay.material(Clay.trunk)]
        )
        trunk.position = [0, height / 2, 0]
        root.addChild(trunk)

        for index in 0..<5 {
            let frond = Clay.sphere(0.09, Clay.leaf)
            frond.scale = [0.42, 0.16, 1.15]
            let angle = Float(index) / 5 * Float.pi * 2
            frond.position = [sin(angle) * 0.11, height + 0.02, cos(angle) * 0.11]
            let axis = SIMD3<Float>(cos(angle), 0, sin(angle))
            frond.orientation = simd_quatf(angle: 0.7, axis: axis)
            root.addChild(frond)
        }

        let coconut = Clay.sphere(0.028, Clay.trunk)
        coconut.position = [0.04, height - 0.04, 0.03]
        root.addChild(coconut)
        return root
    }

    static func panda() -> Entity {
        let root = Entity()
        let body = Clay.sphere(0.09, .white)
        body.scale = [1.05, 0.9, 0.85]
        body.position = [0, 0.10, 0]
        root.addChild(body)

        let head = Clay.sphere(0.072, .white)
        head.position = [0, 0.20, 0.02]
        root.addChild(head)

        let earLeft = Clay.sphere(0.026, Clay.pupil)
        earLeft.position = [-0.05, 0.06, 0]
        head.addChild(earLeft)
        let earRight = Clay.sphere(0.026, Clay.pupil)
        earRight.position = [0.05, 0.06, 0]
        head.addChild(earRight)

        let patchLeft = Clay.sphere(0.02, Clay.pupil)
        patchLeft.scale = [1, 0.8, 0.45]
        patchLeft.position = [-0.028, 0.01, 0.055]
        head.addChild(patchLeft)
        let patchRight = Clay.sphere(0.02, Clay.pupil)
        patchRight.scale = [1, 0.8, 0.45]
        patchRight.position = [0.028, 0.01, 0.055]
        head.addChild(patchRight)

        let nose = Clay.sphere(0.012, Clay.pupil)
        nose.scale = [1.2, 0.8, 0.6]
        nose.position = [0, -0.015, 0.07]
        head.addChild(nose)

        let armLeft = Clay.sphere(0.028, Clay.pupil)
        armLeft.scale = [0.7, 1.3, 0.7]
        armLeft.position = [-0.09, 0.16, 0.02]
        armLeft.orientation = simd_quatf(angle: 0.9, axis: [0, 0, 1])
        root.addChild(armLeft)
        let armRight = Clay.sphere(0.028, Clay.pupil)
        armRight.scale = [0.7, 1.3, 0.7]
        armRight.position = [0.09, 0.16, 0.02]
        armRight.orientation = simd_quatf(angle: -0.9, axis: [0, 0, 1])
        root.addChild(armRight)
        return root
    }

    static func cloud(scale: Float) -> Entity {
        let root = Entity()
        let puffs: [(SIMD3<Float>, Float)] = [
            ([0, 0, 0], 0.13),
            ([-0.12, -0.02, 0.01], 0.09),
            ([0.12, -0.015, 0], 0.085),
            ([0.02, 0.05, -0.01], 0.07)
        ]
        for puff in puffs {
            let ball = Clay.sphere(puff.1 * scale, .white)
            ball.position = puff.0 * scale
            root.addChild(ball)
        }
        return root
    }

    static func flower(color: UIColor) -> Entity {
        let root = Entity()
        for index in 0..<5 {
            let petal = Clay.sphere(0.025, color)
            petal.scale = [0.7, 0.35, 1]
            let angle = Float(index) / 5 * Float.pi * 2
            petal.position = [sin(angle) * 0.028, 0.03, cos(angle) * 0.028]
            root.addChild(petal)
        }
        let center = Clay.sphere(0.016, Clay.flowerYellow)
        center.position = [0, 0.04, 0]
        root.addChild(center)
        let stem = ModelEntity(
            mesh: PrimitiveMesh.cylinder(height: 0.05, radius: 0.006),
            materials: [Clay.material(Clay.leaf)]
        )
        stem.position = [0, 0.02, 0]
        root.addChild(stem)
        return root
    }
}
