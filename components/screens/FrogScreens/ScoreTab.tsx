import { requestFrogCryptoGetScoreboard } from "@pcd/passport-interface";
import { FrogCryptoScore } from "@pcd/passport-interface/src/FrogCrypto";
import _ from "lodash";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { appConfig } from "../../../src/appConfig";
import { useDispatch } from "../../../src/appHooks";
import { RippleLoader } from "../../core/RippleLoader";
import { ActionButton } from "./Button";
import { useUsernameGenerator } from "./useUsername";

/**
 * The Score tab shows the user their score and the leaderboard.
 */
export function ScoreTab({
  score,
  refreshScore
}: {
  score?: FrogCryptoScore;
  refreshScore: () => Promise<void>;
}) {
  const [scores, setScores] = useState<FrogCryptoScore[]>([]);
  const refreshScores = useCallback(async () => {
    requestFrogCryptoGetScoreboard(appConfig.zupassServer).then((res) => {
      setScores(res.value || []);
    });
  }, []);
  useEffect(() => {
    refreshScores();
  }, [refreshScores]);

  const getUsername = useUsernameGenerator();

  if (!score || !getUsername) {
    return <RippleLoader />;
  }

  return (
    <Container>
      {
        // only show share button if user has a telegram username
        score.has_telegram_username && (
          <TelegramShareButton
            score={score}
            refreshAll={async () => {
              Promise.all([refreshScore(), refreshScores()]);
            }}
          />
        )
      }
      <ScoreTable title="You" scores={[score]} getUsername={getUsername} />
      {scores.length > 0 && (
        <ScoreTable
          title="Leaderboard"
          scores={scores}
          myScore={score}
          getUsername={getUsername}
        />
      )}
    </Container>
  );
}

function ScoreTable({
  title,
  scores,
  myScore,
  getUsername
}: {
  getUsername: (semaphoreId: string) => string;
  title: string;
  scores: FrogCryptoScore[];
  myScore?: FrogCryptoScore;
}) {
  const scoresByLevel = useMemo(() => groupScores(scores), [scores]);

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: "35px" }}></th>
          <th style={{ textAlign: "center" }}></th>
          <th style={{ width: "100px" }}></th>
        </tr>
        <tr>
          <th colSpan={3} style={{ textAlign: "center" }}>
            {title}
          </th>
        </tr>
      </thead>
      <tbody>
        {scoresByLevel.map((group) => {
          return (
            <Fragment key={group.title}>
              {
                // if myScore is not provided, we are showing the user only view
                myScore && (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ textAlign: "center", padding: "4px 0" }}
                    >
                      {group.emoji} {group.title}
                    </td>
                  </tr>
                )
              }

              {group.scores.map((score) => (
                <tr
                  key={score.semaphore_id_hash}
                  style={
                    score.semaphore_id_hash === myScore?.semaphore_id_hash
                      ? {
                          fontWeight: "bold",
                          color: "var(--accent-darker)"
                        }
                      : {}
                  }
                >
                  <td>{score.rank}</td>
                  <td>
                    {score.telegram_username ??
                      getUsername(score.semaphore_id_hash)}
                  </td>
                  <td style={{ textAlign: "right" }}>{score.score}</td>
                </tr>
              ))}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Share button and modal for telegram username.
 */
function TelegramShareButton({
  score,
  refreshAll
}: {
  score: FrogCryptoScore;
  refreshAll: () => Promise<void>;
}) {
  const revealed = !!score.telegram_username;
  const dispatch = useDispatch();

  return (
    <ActionButton
      onClick={async () => {
        dispatch({
          type: "set-modal",
          modal: {
            modalType: "frogcrypto-update-telegram",
            revealed,
            refreshAll
          }
        });
      }}
    >
      {score.telegram_username
        ? "Hide Telegram Username"
        : "Pubilsh Telegram Username"}
    </ActionButton>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
`;

/**
 * The score thresholds for each level.
 */
export const SCORES = [
  { score: 0, emoji: "⚪️", title: "NOVICE" },
  { score: 5, emoji: "🟡", title: "APPRENTICE" },
  { score: 10, emoji: "🟠", title: "JOURNEYMAN" },
  { score: 19, emoji: "🔴", title: "EXPERT" },
  { score: 36, emoji: "🟣", title: "MASTER" },
  { score: 69, emoji: "🔵", title: "GRANDMASTER" },
  { score: 133, emoji: "🟢", title: "LEGEND" },
  { score: 256, emoji: "👑", title: "SOVEREIGN" },
  { score: 420, emoji: "🦉", title: "SAGE" },
  { score: 701, emoji: "🐸", title: "AVATAR OF FROGELION" },
  { score: 1000, emoji: "⌨️", title: "<scripter />" }
];

/**
 * Returns the emoji and title for a given score.
 */
export function scoreToEmoji(score: number) {
  const index = SCORES.findIndex((item) => item.score > score);
  if (index === -1) {
    return `${SCORES[SCORES.length - 1].emoji} ${
      SCORES[SCORES.length - 1].title
    }`;
  }
  const curr = SCORES[index - 1];
  const next = SCORES[index];
  const percent = Math.floor(
    ((score - curr.score) / (next.score - curr.score)) * 100
  );
  return `${curr.emoji} ${curr.title} - ${percent}%`;
}

/**
 * Group the scores by level.
 */
export function groupScores(scores: FrogCryptoScore[]) {
  const groups = SCORES.map((item) => ({
    ...item,
    scores: [] as FrogCryptoScore[]
  })).reverse();

  _.orderBy(scores, ["score"], ["desc"]).forEach((score) => {
    const index = SCORES.findIndex((item) => item.score > score.score);
    const curr = SCORES[index === -1 ? SCORES.length - 1 : index - 1];

    const group = groups.find((item) => item.title === curr.title);
    if (!group) {
      return;
    }
    group.scores.push(score);
  });

  return groups.filter((group) => group.scores.length > 0);
}
