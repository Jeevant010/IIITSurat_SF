import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Gamepad2,
  LogOut,
  User,
  Users,
  Trophy,
  Settings,
  Shield,
  Swords,
  Menu,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { getAvatarUrl } from "@/lib/avatar";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Gamepad2 },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/brackets", label: "Brackets", icon: Swords },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-yellow-500/20 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-zinc-950 border-zinc-800 w-64 p-0"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Swords className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">
                          Clash of Clans
                        </p>
                        <p className="text-xs text-yellow-400">
                          Spring Fiesta 2026
                        </p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                  {user && (
                    <div className="p-4 border-t border-zinc-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={getAvatarUrl(user.avatarId, user.name || undefined)}
                            alt={user.name || ""}
                          />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-yellow-400 hover:bg-zinc-900 hover:text-yellow-300 transition-all mb-2"
                        >
                          <Shield className="w-5 h-5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:scale-110 transition-transform">
              <Swords className="w-5 h-5 text-black" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white">Clash of Clans</p>
              <p className="text-xs text-yellow-400">Spring Fiesta 2026</p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-yellow-500/50 hover:ring-yellow-500"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getAvatarUrl(user.avatarId, user.name || undefined)}
                        alt={user.name || ""}
                      />
                      <AvatarFallback className="bg-yellow-600 text-black font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-zinc-900 border-zinc-800"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/teams/my-team"
                      className="cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      My Team
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer text-zinc-300 hover:text-white"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/dashboard"
                          className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-800" />

                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <DropdownMenuItem asChild>
                      <button
                        type="submit"
                        className="w-full cursor-pointer text-red-400 hover:text-red-300"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
