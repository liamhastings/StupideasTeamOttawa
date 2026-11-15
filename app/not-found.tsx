import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-28 text-center">
      <p className="font-display text-6xl font-black">404</p>
      <p className="mt-4 text-dim">This page ghosted you. It also had a deadline.</p>
      <Button href="/discover" className="mt-8">Back to swiping</Button>
    </div>
  );
}
