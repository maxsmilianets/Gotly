export function AuthBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[320px] w-[320px] rounded-full bg-teal-300/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_40%)]" />
    </>
  );
}
