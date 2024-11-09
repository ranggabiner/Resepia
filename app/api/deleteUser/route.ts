import { supabaseServer } from '../../../lib/supabaseServerClient';

export async function POST(request: { json: () => PromiseLike<{ user_id: any; }> | { user_id: any; }; }) {
  try {
    const { user_id } = await request.json(); // Get the user ID from the request body

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400 }
      );
    }

    // Use service role key for deleting the user
    const { error } = await supabaseServer.auth.admin.deleteUser(user_id);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting user:', error.message);
    } else {
      console.error('Error deleting user:', error);
    }
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Failed to delete user' }),
      { status: 500 }
    );
  }
}
