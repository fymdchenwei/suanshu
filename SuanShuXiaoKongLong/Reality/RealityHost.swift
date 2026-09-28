import ARKit
import RealityKit
import simd
import UIKit

/// Hosts RealityKit scenes on iOS 17.
///
/// SwiftUI's `RealityView` is part of the iOS 18 SDK (Xcode 16). This project
/// is meant to open in Xcode 15, so the same entities are drawn with a non-AR
/// `ARView`, which is the RealityKit viewport available on iOS 17.
enum RealityHost {
    static func makeView(background: UIColor) -> ARView {
        let view = ARView(frame: .zero, cameraMode: .nonAR, automaticallyConfigureSession: false)
        view.automaticallyConfigureSession = false
        view.cameraMode = .nonAR
        view.session.pause()
        view.backgroundColor = background
        view.isOpaque = true
        view.environment.background = .color(background)
        view.renderOptions.insert(.disableMotionBlur)
        view.renderOptions.insert(.disableDepthOfField)
        view.renderOptions.insert(.disableCameraGrain)
        view.renderOptions.insert(.disableHDR)
        view.renderOptions.insert(.disablePersonOcclusion)
        view.environment.lighting.intensityExponent = 1.15
        return view
    }

    static func addCamera(to anchor: Entity, eye: SIMD3<Float>, target: SIMD3<Float>, fov: Float) {
        let camera = PerspectiveCamera()
        camera.camera.fieldOfViewInDegrees = fov
        camera.look(at: target, from: eye, relativeTo: anchor)
        anchor.addChild(camera)
    }

    static func addLights(to anchor: Entity) {
        let key = DirectionalLight()
        key.light.intensity = 14_000
        key.light.color = .white
        key.look(at: [0, 0, 0], from: [0.8, 1.6, 1.1], relativeTo: anchor)
        anchor.addChild(key)

        let fill = DirectionalLight()
        fill.light.intensity = 5_000
        fill.light.color = UIColor(red: 0.86, green: 0.93, blue: 1, alpha: 1)
        fill.look(at: [0, 0.2, 0], from: [-1.1, 0.7, 0.4], relativeTo: anchor)
        anchor.addChild(fill)
    }
}

enum Clay {
    static let green = UIColor(red: 0.36, green: 0.78, blue: 0.33, alpha: 1)
    static let greenDark = UIColor(red: 0.22, green: 0.58, blue: 0.26, alpha: 1)
    static let leaf = UIColor(red: 0.30, green: 0.72, blue: 0.28, alpha: 1)
    static let belly = UIColor(red: 0.99, green: 0.86, blue: 0.40, alpha: 1)
    static let orange = UIColor(red: 1.0, green: 0.55, blue: 0.16, alpha: 1)
    static let trunk = UIColor(red: 0.58, green: 0.36, blue: 0.18, alpha: 1)
    static let dirt = UIColor(red: 0.62, green: 0.42, blue: 0.24, alpha: 1)
    static let dirtDark = UIColor(red: 0.48, green: 0.32, blue: 0.18, alpha: 1)
    static let grass = UIColor(red: 0.42, green: 0.78, blue: 0.32, alpha: 1)
    static let gold = UIColor(red: 0.98, green: 0.76, blue: 0.22, alpha: 1)
    static let goldDark = UIColor(red: 0.86, green: 0.58, blue: 0.16, alpha: 1)
    static let stone = UIColor(red: 0.76, green: 0.78, blue: 0.80, alpha: 1)
    static let stoneNext = UIColor(red: 0.98, green: 0.92, blue: 0.55, alpha: 1)
    static let pink = UIColor(red: 1.0, green: 0.55, blue: 0.64, alpha: 1)
    static let pupil = UIColor(red: 0.18, green: 0.12, blue: 0.10, alpha: 1)
    static let chest = UIColor(red: 0.64, green: 0.38, blue: 0.16, alpha: 1)
    static let red = UIColor(red: 0.86, green: 0.16, blue: 0.22, alpha: 1)
    static let flowerPink = UIColor(red: 1.0, green: 0.55, blue: 0.70, alpha: 1)
    static let flowerYellow = UIColor(red: 1.0, green: 0.86, blue: 0.30, alpha: 1)

    static func material(_ color: UIColor) -> SimpleMaterial {
        SimpleMaterial(color: color, roughness: .float(Float(0.78)), isMetallic: false)
    }

    static func sphere(_ radius: Float, _ color: UIColor) -> ModelEntity {
        ModelEntity(mesh: .generateSphere(radius: radius), materials: [material(color)])
    }
}

final class DisplayLinkDriver: NSObject {
    var onFrame: ((TimeInterval) -> Void)?
    private var link: CADisplayLink?

    func start() {
        guard link == nil else { return }
        let link = CADisplayLink(target: self, selector: #selector(tick))
        link.preferredFrameRateRange = CAFrameRateRange(minimum: 30, maximum: 60, preferred: 60)
        link.add(to: .main, forMode: .common)
        self.link = link
    }

    func stop() {
        link?.invalidate()
        link = nil
        onFrame = nil
    }

    @objc private func tick() {
        onFrame?(CACurrentMediaTime())
    }
}

enum NumberTexture {
    private static var cache: [String: TextureResource] = [:]

    static func material(text: String, background: UIColor, foreground: UIColor) -> Material {
        if let texture = texture(text: text, background: background, foreground: foreground) {
            var unlit = UnlitMaterial()
            unlit.color = .init(tint: .white, texture: .init(texture))
            return unlit
        }
        return Clay.material(background)
    }

    private static func texture(text: String, background: UIColor, foreground: UIColor) -> TextureResource? {
        let key = "\(text)|\(background.cacheKey)|\(foreground.cacheKey)"
        if let cached = cache[key] {
            return cached
        }
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 256, height: 256), format: format)
        let image = renderer.image { _ in
            background.setFill()
            UIBezierPath(ovalIn: CGRect(x: 0, y: 0, width: 256, height: 256)).fill()
            let font = UIFont.systemFont(ofSize: 132, weight: .heavy)
            let attributes: [NSAttributedString.Key: Any] = [
                .font: font,
                .foregroundColor: foreground
            ]
            let string = text as NSString
            let textSize = string.size(withAttributes: attributes)
            let origin = CGPoint(x: (256 - textSize.width) / 2, y: (256 - textSize.height) / 2 - 6)
            string.draw(at: origin, withAttributes: attributes)
        }
        guard let cgImage = image.cgImage else { return nil }
        guard let resource = try? TextureResource.generate(
            from: cgImage,
            options: TextureResource.CreateOptions(semantic: .color)
        ) else { return nil }
        cache[key] = resource
        return resource
    }
}

/// Cylinders and cones centered on the origin, height along Y.
/// `MeshResource.generateCylinder` and `generateCone` are iOS 18, so these
/// are built with `MeshDescriptor`, which is available on iOS 17.
enum PrimitiveMesh {
    static func cylinder(height: Float, radius: Float) -> MeshResource {
        roundMesh(height: height, bottomRadius: radius, topRadius: radius)
    }

    static func cone(height: Float, radius: Float) -> MeshResource {
        roundMesh(height: height, bottomRadius: radius, topRadius: radius * 0.02)
    }

    private static func roundMesh(height: Float, bottomRadius: Float, topRadius: Float) -> MeshResource {
        let segments = 28
        var positions: [SIMD3<Float>] = []
        var normals: [SIMD3<Float>] = []
        var uvs: [SIMD2<Float>] = []
        var indices: [UInt32] = []

        func add(_ position: SIMD3<Float>, _ normal: SIMD3<Float>) -> UInt32 {
            let index = UInt32(positions.count)
            positions.append(position)
            let length = simd_length(normal)
            normals.append(length > 0.0001 ? normal / length : SIMD3(0, 1, 0))
            uvs.append([0.5, 0.5])
            return index
        }

        let y0 = -height / 2
        let y1 = height / 2
        let rise = topRadius - bottomRadius
        let side = sqrt(rise * rise + height * height)
        let normalY = rise / max(side, 0.0001)
        let normalR = height / max(side, 0.0001)

        for index in 0..<segments {
            let a0 = Float(index) / Float(segments) * 2 * Float.pi
            let a1 = Float(index + 1) / Float(segments) * 2 * Float.pi
            let c0 = cos(a0)
            let s0 = sin(a0)
            let c1 = cos(a1)
            let s1 = sin(a1)
            let n0 = SIMD3<Float>(c0 * normalR, normalY, s0 * normalR)
            let n1 = SIMD3<Float>(c1 * normalR, normalY, s1 * normalR)
            let b0 = add([c0 * bottomRadius, y0, s0 * bottomRadius], n0)
            let b1 = add([c1 * bottomRadius, y0, s1 * bottomRadius], n1)
            let t0 = add([c0 * topRadius, y1, s0 * topRadius], n0)
            let t1 = add([c1 * topRadius, y1, s1 * topRadius], n1)
            indices.append(contentsOf: [b0, t0, b1, b1, t0, t1, b0, b1, t0, b1, t1, t0])
        }

        let bottomCenter = add([0, y0, 0], [0, -1, 0])
        let topCenter = add([0, y1, 0], [0, 1, 0])
        for index in 0..<segments {
            let a0 = Float(index) / Float(segments) * 2 * Float.pi
            let a1 = Float(index + 1) / Float(segments) * 2 * Float.pi
            let b0 = add([cos(a0) * bottomRadius, y0, sin(a0) * bottomRadius], [0, -1, 0])
            let b1 = add([cos(a1) * bottomRadius, y0, sin(a1) * bottomRadius], [0, -1, 0])
            indices.append(contentsOf: [bottomCenter, b1, b0, bottomCenter, b0, b1])
            let t0 = add([cos(a0) * topRadius, y1, sin(a0) * topRadius], [0, 1, 0])
            let t1 = add([cos(a1) * topRadius, y1, sin(a1) * topRadius], [0, 1, 0])
            indices.append(contentsOf: [topCenter, t0, t1, topCenter, t1, t0])
        }

        var descriptor = MeshDescriptor(name: "round")
        descriptor.positions = MeshBuffers.Positions(positions)
        descriptor.normals = MeshBuffers.Normals(normals)
        descriptor.textureCoordinates = MeshBuffers.TextureCoordinates(uvs)
        descriptor.primitives = .triangles(indices)
        if let mesh = try? MeshResource.generate(from: [descriptor]) {
            return mesh
        }
        return .generateBox(width: max(bottomRadius, topRadius) * 2, height: height, depth: max(bottomRadius, topRadius) * 2)
    }
}

private extension UIColor {
    var cacheKey: String {
        var red: CGFloat = 0
        var green: CGFloat = 0
        var blue: CGFloat = 0
        var alpha: CGFloat = 0
        getRed(&red, green: &green, blue: &blue, alpha: &alpha)
        return String(format: "%.2f-%.2f-%.2f", red, green, blue)
    }
}
