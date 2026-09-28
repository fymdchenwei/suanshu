import ARKit
import RealityKit
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
