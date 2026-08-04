/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  /**
   * Turbopack config (Next.js 16 top-level key).
   *
   * resolveAlias: point Node.js-only packages to a browser-safe empty shim
   * so the @imgly/background-removal bundle never tries to load native modules.
   *
   * NOTE: asyncWebAssembly is natively supported in Turbopack — no flag needed.
   * NOTE: COOP/COEP headers intentionally omitted globally. @imgly falls back
   *       to single-threaded WASM without SharedArrayBuffer, which is fine.
   */
  turbopack: {
    resolveAlias: {
      'sharp': './lib/empty-shim.js',
      'onnxruntime-node': './lib/empty-shim.js',
    },
  },
}

export default nextConfig
