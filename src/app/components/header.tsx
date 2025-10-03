import { Phone } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b bg-card/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Phone className="h-5 w-5 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground">CallSync Notes</h1>
    </header>
  );
}
