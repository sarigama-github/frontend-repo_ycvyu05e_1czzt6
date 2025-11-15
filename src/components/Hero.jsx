import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div className="backdrop-blur-xl bg-white/50 rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Society Management, Simplified
          </h1>
          <p className="mt-4 text-gray-700 text-lg">
            Centralize maintenance, payments, bookings, notices, and community interactions — all in one secure portal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#app" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition">
              Get Started
            </a>
            <a href="/test" className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 py-3 rounded-lg shadow border hover:bg-gray-50 transition">
              Check Backend
            </a>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-500/10 to-transparent rounded-3xl"></div>
        </div>
      </div>
    </section>
  )
}
