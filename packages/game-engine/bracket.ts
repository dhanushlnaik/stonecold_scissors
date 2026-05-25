import { Match, TournamentParticipant } from '@stonecold/types';

export function generateSingleEliminationBracket(
  participants: string[], // Array of user IDs
  tournamentId: string
): Partial<Match>[] {
  const participantCount = participants.length;
  const rounds = Math.ceil(Math.log2(participantCount));
  const bracketSize = Math.pow(2, rounds);
  
  // Shuffle participants for random seeding (simplest form)
  const seededParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  const matches: Partial<Match>[] = [];
  
  // Generate first round matches
  for (let i = 0; i < bracketSize / 2; i++) {
    const p1Id = seededParticipants[i * 2] || 'BYE';
    const p2Id = seededParticipants[i * 2 + 1] || 'BYE';
    
    matches.push({
      tournamentId,
      round: 1,
      player1Id: p1Id,
      player2Id: p2Id,
      status: (p1Id === 'BYE' || p2Id === 'BYE') ? 'COMPLETED' : 'WAITING',
      winnerId: p1Id === 'BYE' ? p2Id : (p2Id === 'BYE' ? p1Id : undefined),
    });
  }

  // Future rounds will be generated as matches complete or as placeholders
  return matches;
}
