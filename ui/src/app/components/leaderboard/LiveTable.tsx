import { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { useQueriesStore } from "@/app/hooks/useQueryStore";
import { Adventurer } from "@/app/types";
import LiveRow from "./LiveRow";
import useUIStore from "@/app/hooks/useUIStore";

export interface LiveLeaderboardTableProps {
  itemsPerPage: number;
}

const LiveLeaderboardTable = ({ itemsPerPage }: LiveLeaderboardTableProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { data, isLoading, refetch } = useQueriesStore();
  const adventurers = data.adventurersByXPQuery?.adventurers
    ? data.adventurersByXPQuery?.adventurers
    : [];
  const setScreen = useUIStore((state) => state.setScreen);
  const setProfile = useUIStore((state) => state.setProfile);
  const displayAdventurers = adventurers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(adventurers.length / itemsPerPage);

  let previousXp = -1;
  let currentRank = 0;
  let rankOffset = 0;

  const rankXp = (adventurer: Adventurer, index: number) => {
    if (adventurer.xp !== previousXp) {
      currentRank = index + 1 + (currentPage - 1) * itemsPerPage;
      rankOffset = 0;
    } else {
      rankOffset++;
    }
    previousXp = adventurer.xp ?? 0;
    return currentRank;
  };

  const handleRowSelected = async (adventurerId: number) => {
    setLoading(true);
    try {
      setProfile(adventurerId);
      setScreen("profile");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (newPage: number): void => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  return (
    <div className="sm:w-1/2 flex flex-col gap-5 sm:gap-0 sm:flex-row justify-between w-full">
      <div className="flex flex-col w-full sm:mb-4 sm:mb-0 sm:mr-4 flex-grow-2 p-2">
        <h4 className="text-center text-lg sm:text-2xl m-0">
          Live Leaderboard
        </h4>
        <table className="w-full text-sm sm:text-xl border border-terminal-green">
          <thead className="border border-terminal-green">
            <tr>
              <th className="p-1">Rank</th>
              <th className="p-1">Adventurer</th>
              <th className="p-1">Gold</th>
              <th className="p-1">XP</th>
              <th className="p-1">Health</th>
              <th className="p-1">Idle</th>
            </tr>
          </thead>
          <tbody>
            {displayAdventurers?.map(
              (adventurer: Adventurer, index: number) => (
                <LiveRow
                  key={index}
                  index={index}
                  adventurer={adventurer}
                  rank={rankXp(adventurer, index)}
                  handleRowSelected={handleRowSelected}
                />
              )
            )}
          </tbody>
        </table>
        {adventurers?.length > 10 && (
          <div className="flex justify-center sm:mt-8">
            <Button
              variant={"outline"}
              onClick={() => currentPage > 1 && handleClick(currentPage - 1)}
              disabled={currentPage === 1}
            >
              back
            </Button>

            <Button
              variant={"outline"}
              key={1}
              onClick={() => handleClick(1)}
              className={currentPage === 1 ? "animate-pulse" : ""}
            >
              {1}
            </Button>

            <Button
              variant={"outline"}
              key={totalPages}
              onClick={() => handleClick(totalPages)}
              className={currentPage === totalPages ? "animate-pulse" : ""}
            >
              {totalPages}
            </Button>

            <Button
              variant={"outline"}
              onClick={() =>
                currentPage < totalPages && handleClick(currentPage + 1)
              }
              disabled={currentPage === totalPages}
            >
              next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLeaderboardTable;