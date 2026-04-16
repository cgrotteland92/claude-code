import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Props = {
  isAuthenticated: boolean;
};

export default function Header({ isAuthenticated }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          NextNotes
        </Link>
        {isAuthenticated ? (
          <LogoutButton />
        ) : (
          <Link
            href="/authenticate"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
