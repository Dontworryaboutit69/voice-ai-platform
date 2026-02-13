import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export default async function AgentsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Get the first agent (assuming single-agent setup for now)
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  // Redirect to the agent's dashboard if it exists
  if (!error && agents && agents.length > 0) {
    redirect(`/agents/${agents[0].id}`);
  }

  // No agents - redirect to marketplace to create one
  redirect('/marketplace');
}
