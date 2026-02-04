import connectDB from "@/lib/mongodb";
import { Match, Team } from "@/lib/models";
import MatchResultsClient from "./match-results-client";

export default async function MatchResultsPage() {
  await connectDB();

  const matches = await Match.find({})
    .populate("team1Id", "name")
    .populate("team2Id", "name")
    .populate("winnerId", "name")
    .sort({ completedAt: -1, round: 1, matchNumber: 1 })
    .lean();

  const teams = await Team.find({ status: "ACTIVE" })
    .select("name score wins losses")
    .sort({ score: -1 })
    .lean();

  return (
    <MatchResultsClient
      matches={JSON.parse(JSON.stringify(matches))}
      teams={JSON.parse(JSON.stringify(teams))}
    />
  );
}
