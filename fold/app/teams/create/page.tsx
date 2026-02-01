import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Users, Star, Trophy } from "lucide-react";
import { createTeam } from "@/app/actions/team-actions";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";

function CreateTeamForm() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-purple-950 to-black">
      {/* Visual Background Effect */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            IIIT Surat SF 2026
          </h1>
          <p className="text-zinc-400">Spring Fiesta Cultural Event</p>
        </div>

        {/* Main Card */}
        <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-full w-fit">
              <Shield className="w-12 h-12 text-purple-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Create Your Team
            </CardTitle>
            <CardDescription className="text-zinc-400 text-lg">
              Lead your own squad in Spring Fiesta 2026!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <Users className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm text-zinc-500">Max Team Size</div>
                <div className="text-xl font-bold text-white">5 Members</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <Star className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-sm text-zinc-500">Your Role</div>
                <div className="text-xl font-bold text-white">Team Leader</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <Trophy className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-sm text-zinc-500">Event</div>
                <div className="text-xl font-bold text-white">SF 2026</div>
              </div>
            </div>

            {/* Form */}
            <form action={createTeam} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-zinc-300 text-lg">
                  Team Name *
                </Label>
                <Input
                  id="teamName"
                  name="teamName"
                  placeholder="e.g. CodeWizards, Phoenix Squad, Thunder Bolts"
                  required
                  minLength={3}
                  maxLength={50}
                  className="bg-black border-zinc-700 focus:border-purple-500 text-white text-lg py-6"
                />
                <p className="text-xs text-zinc-500">
                  Choose a unique and memorable name for your team
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamTag" className="text-zinc-300 text-lg">
                  Team Tag *
                </Label>
                <Input
                  id="teamTag"
                  name="teamTag"
                  placeholder="e.g. CWIZ, PHNX, TBLT"
                  maxLength={4}
                  minLength={2}
                  required
                  className="bg-black border-zinc-700 text-white uppercase font-mono text-lg py-6"
                />
                <p className="text-xs text-zinc-500">
                  2-4 letters that will be part of your team code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-300 text-lg">
                  Team Description (Optional)
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell others about your team..."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-black border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
              >
                Create Team <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> As team leader, you'll manage join
                  requests, add/remove members, and represent your team in
                  Spring Fiesta 2026!
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateTeamPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CreateTeamForm />
    </Suspense>
  );
}
