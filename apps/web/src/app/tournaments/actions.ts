'use server';

import { TournamentService } from '@stonecold/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTournament(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const startsAt = formData.get('startsAt') as string;

  const tournament = await TournamentService.createTournament({
    name,
    hostId: session.user.id,
    startsAt: startsAt ? new Date(startsAt) : undefined,
  });

  revalidatePath('/tournaments');
  redirect(`/tournaments/${tournament.id}`);
}

export async function joinTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await TournamentService.joinTournament(tournamentId, session.user.id);
  
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function commenceTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  try {
    await TournamentService.commenceTournament(tournamentId);
  } catch (error: any) {
    if (error.message.includes('already started')) {
      // Just redirect if already started
      revalidatePath(`/tournaments/${tournamentId}`);
      return;
    }
    throw error;
  }
  
  revalidatePath(`/tournaments/${tournamentId}`);
}
