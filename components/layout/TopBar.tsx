import Countdown from "./Countdown";
import Logo from "./Logo";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge bg-floor/90 px-4 py-3 backdrop-blur">
      <Logo />
      <div className="flex items-center gap-2 rounded-full border border-edge px-3 py-1 text-sm" title="Time until demos">
        <Countdown className="text-hi" />
        <span className="text-dim">left</span>
      </div>
    </header>
  );
}
