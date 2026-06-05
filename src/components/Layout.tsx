export default function Layout({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <main className="relative h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background — unchanged */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb22,transparent_30%),radial-gradient(circle_at_bottom_right,#7c3aed22,transparent_30%)]" />
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute left-1/2 top-0 h-[560px] w-[320px] -translate-x-1/2 bg-white/[0.04] blur-[160px]" />
      </div>

      <div
        className="
          relative z-10 mx-auto grid
          h-screen w-full max-w-[1080px]
          grid-cols-1 gap-4 p-4
          xl:grid-cols-[210px_1fr_240px]
        "
      >
        {/* Left — was overflow-hidden, now scrolls silently */}
        <section
          className="
            flex min-h-0 flex-col
            rounded-[28px] border border-white/10
            bg-white/[0.04] p-4
            shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-3xl
            overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {left}
        </section>

        {/* Center — was overflow-hidden, now scrolls silently */}
        <section
          className="
            flex min-h-0 flex-col items-center justify-center
            rounded-[34px] border border-white/10
            bg-white/[0.05] px-8 py-6
            shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-3xl
            overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {center}
        </section>

        {/* Right — already correct, unchanged */}
        <section
          className="
            min-h-0 overflow-y-auto space-y-3
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {right}
        </section>
      </div>
    </main>
  );
}
