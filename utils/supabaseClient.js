export async function signInUseSupabase({ supabase }) {
    let redirectTo;
    if(process.env.NEXT_PUBLIC_SANDBOX=='true') {
        redirectTo = 'http://localhost:3000/apps'
    } else {
        debugger
        redirectTo = process.env.NEXT_PUBLIC_SITE_URL + '/apps'
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo
          }
    })
}