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
import { Trophy, Users, Calendar, Swords, Shield, Target } from "lucide-react";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";
import connectDB from "@/lib/mongodb";
import { Announcement, SiteSettings } from "@/lib/models";

async function getPageData() {
  try {
    await connectDB();

    // Get banner announcement
    const now = new Date();
    const banner = await Announcement.findOne({
      isActive: true,
      showOnBanner: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    // Get site settings
    const settings = await SiteSettings.findOne().lean();

    return {
      banner: banner
        ? {
            title: banner.title,
            content: banner.content,
            type: banner.type,
          }
        : null,
      settings: settings
        ? {
            heroTitle: settings.heroTitle,
            heroSubtitle: settings.heroSubtitle,
            announcementBanner: settings.announcementBanner,
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return { banner: null, settings: null };
  }
}

async function HomePage() {
  const { banner, settings } = await getPageData();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-yellow-950/20 to-black text-foreground">
      {/* Announcement Banner */}
      {(banner || settings?.announcementBanner) && (
        <div
          className={`w-full py-3 px-4 text-center ${
            banner?.type === "URGENT"
              ? "bg-red-500/20 border-b border-red-500/30"
              : banner?.type === "WARNING"
                ? "bg-yellow-500/20 border-b border-yellow-500/30"
                : banner?.type === "SUCCESS"
                  ? "bg-green-500/20 border-b border-green-500/30"
                  : "bg-blue-500/20 border-b border-blue-500/30"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              banner?.type === "URGENT"
                ? "text-red-300"
                : banner?.type === "WARNING"
                  ? "text-yellow-300"
                  : banner?.type === "SUCCESS"
                    ? "text-green-300"
                    : "text-blue-300"
            }`}
          >
            {banner?.type === "URGENT" && "🚨 "}
            {banner?.type === "WARNING" && "⚠️ "}
            {banner?.type === "SUCCESS" && "✅ "}
            {banner?.type === "INFO" && "ℹ️ "}
            {banner ? banner.content : settings?.announcementBanner}
          </p>
        </div>
      )}

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
          </div>

          <Badge
            variant="outline"
            className="mb-6 py-2 px-4 border-yellow-500/50 text-yellow-300 bg-yellow-500/10 text-sm z-10"
          >
            <Calendar className="w-4 h-4 mr-2 inline" />
            Spring Fiesta 2026 • IIIT Surat
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent z-10 max-w-4xl">
            {settings?.heroTitle || "Clash of Clans Tournament"}
          </h1>

          <p className="max-w-[700px] text-zinc-300 text-lg md:text-xl mb-10 z-10">
            {settings?.heroSubtitle ||
              "Build your clan, strategize your attacks, and dominate the battlefield! Join IIIT Surat's epic Clash of Clans tournament at Spring Fiesta 2026."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center z-10 mb-12">
            <Link href="/teams/create">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-8 py-6 text-black"
              >
                <Swords className="w-5 h-5 mr-2" />
                Create Your Clan
              </Button>
            </Link>
            <Link href="/teams">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg border-yellow-500/50 text-yellow-300 hover:bg-yellow-950 px-8 py-6"
              >
                <Users className="w-5 h-5 mr-2" />
                Browse Clans
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
            <Card className="bg-zinc-900/50 border-yellow-500/20 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Build Your Clan</CardTitle>
                <CardDescription className="text-zinc-400">
                  Form your elite squad! Invite your best attackers and
                  defenders to create an unstoppable clan.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">Battle for Glory</CardTitle>
                <CardDescription className="text-zinc-400">
                  Compete in clan wars, climb the leaderboard, and prove your
                  dominance at Spring Fiesta 2026.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900/50 border-yellow-500/20 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Win Prizes</CardTitle>
                <CardDescription className="text-zinc-400">
                  Top clans get amazing prizes! Track your performance live and
                  compete for the championship trophy.
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
                Tournament Stats
              </h2>
              <p className="text-zinc-400 text-lg">
                Join the battle for supremacy!
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  🏆
                </div>
                <div className="text-2xl font-bold text-white">Epic</div>
                <div className="text-zinc-400">Prizes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">
                  ⚔️
                </div>
                <div className="text-2xl font-bold text-white">Clan</div>
                <div className="text-zinc-400">Wars</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  🛡️
                </div>
                <div className="text-2xl font-bold text-white">5v5</div>
                <div className="text-zinc-400">Battles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">
                  🎮
                </div>
                <div className="text-2xl font-bold text-white">Live</div>
                <div className="text-zinc-400">Tournament</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/30 backdrop-blur">
              <CardContent className="pt-8 text-center">
                <Swords className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Clash?
                </h2>
                <p className="text-zinc-300 text-lg mb-8">
                  Register your clan now and prepare for the ultimate Clash of
                  Clans showdown at Spring Fiesta 2026!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/teams/create">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg px-8 text-black font-bold"
                    >
                      Create Clan Now
                    </Button>
                  </Link>
                  <Link href="/players">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-950 text-lg px-8"
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
      <footer className="w-full border-t border-yellow-500/20 bg-black/80 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-400">
          <p className="mb-2">
            © 2026 IIIT Surat Spring Fiesta - Clash of Clans Tournament
          </p>
          <p className="text-sm text-zinc-500">
            Made with ❤️ for the IIIT Surat gaming community
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
