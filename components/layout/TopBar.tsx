import Logo from "./Logo";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge bg-floor/90 px-4 py-3 backdrop-blur">
      <Logo />
    </header>
  );
}
