import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-800">
          <Flame className="h-5 w-5 text-red-600" />
          Fuego
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {!userId ? (
            <>
              <Link href="/how-it-works" className="hidden px-3 py-2 text-sm hover:underline sm:block">
                How it works
              </Link>
              <Link href="/why" className="hidden px-3 py-2 text-sm hover:underline sm:block">
                Why this matters
              </Link>
              <Link href="/sign-in" className="px-3 py-2 text-sm hover:underline">
                Sign in
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get protected</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="px-2 py-2 text-sm hover:underline sm:px-3">
                Dashboard
              </Link>
              <Link href="/devices" className="px-2 py-2 text-sm hover:underline sm:px-3">
                Devices
              </Link>
              <Link href="/incidents" className="px-2 py-2 text-sm hover:underline sm:px-3">
                Incidents
              </Link>
              <Link href="/report">
                <Button size="sm" variant="destructive" className="font-semibold">
                  I&apos;ve been robbed
                </Button>
              </Link>
              <div className="pl-2">
                <UserButton />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
