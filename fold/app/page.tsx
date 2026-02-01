import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Sparkles,
  Crown,
  Star,
  Zap,
  Calendar,
  UserPlus,
} from "lucide-react";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-foreground">
      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              IIIT Surat SF
            </span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              href="/leaderboard"
            >
              Leaderboard
            </Link>
            <Link
              className="text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              href="/teams"
            >
              Teams
            </Link>
            <Link
              className="text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              href="/players"
            >
              Players
            </Link>
            <Link
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
              href="/admin/dashboard"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
          </div>

          <Badge
            variant="outline"
            className="mb-6 py-2 px-4 border-purple-500/50 text-purple-300 bg-purple-500/10 text-sm z-10"
          >
            <Calendar className="w-4 h-4 mr-2 inline" />
            Spring Fiesta 2026 - IIIT Surat Cultural Event
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent z-10 max-w-4xl">
            Unite. Compete. Celebrate.
          </h1>

          <p className="max-w-[700px] text-zinc-300 text-lg md:text-xl mb-10 z-10">
            Join IIIT Surat's biggest cultural festival! Form teams, participate
            in events, and make Spring Fiesta 2026 unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center z-10 mb-12">
            <Link href="/teams/create">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6"
              >
                <Crown className="w-5 h-5 mr-2" />
                Create Your Team
              </Button>
            </Link>
            <Link href="/teams">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg border-purple-500/50 text-purple-300 hover:bg-purple-950 px-8 py-6"
              >
                <Users className="w-5 h-5 mr-2" />
                Browse Teams
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
            <Card className="bg-zinc-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <UserPlus className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">
                  Easy Team Formation
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Create or join teams with just a few clicks. Team leaders
                  manage join requests seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-pink-500/20 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">Live Leaderboards</CardTitle>
                <CardDescription className="text-zinc-400">
                  Track your team's performance in real-time and compete for the
                  top spot in Spring Fiesta 2026.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Player Profiles</CardTitle>
                <CardDescription className="text-zinc-400">
                  View all participants, their teams, and roles. Find friends
                  and form the ultimate squad.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="w-full py-16 px-4 bg-black/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Spring Fiesta 2026 by the Numbers
              </h2>
              <p className="text-zinc-400 text-lg">
                Join the celebration of culture and talent
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                  500+
                </div>
                <div className="text-zinc-400">Expected Participants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">
                  100+
                </div>
                <div className="text-zinc-400">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                  15+
                </div>
                <div className="text-zinc-400">Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">
                  3
                </div>
                <div className="text-zinc-400">Days of Fun</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 backdrop-blur">
              <CardContent className="pt-8 text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Join the Festival?
                </h2>
                <p className="text-zinc-300 text-lg mb-8">
                  Don't miss out on IIIT Surat's most exciting cultural event of
                  2026!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/teams/create">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
                    >
                      Get Started Now
                    </Button>
                  </Link>
                  <Link href="/players">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-950 text-lg px-8"
                    >
                      View All Players
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-purple-500/20 bg-black/80 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-400">
          <p className="mb-2">
            © 2026 IIIT Surat Spring Fiesta. All rights reserved.
          </p>
          <p className="text-sm text-zinc-500">
            Made with ❤️ for the IIIT Surat community
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomePage />
    </Suspense>
  );
}
