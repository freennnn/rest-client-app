import { isAuthenticatedPath, signInPath } from '@/paths';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Create an initial 'pass-through' NextResponse object.
  // We create this *now* because the Supabase client needs a reference
  // to a response object that it can potentially add 'Set-Cookie' headers to later.
  // This object will be returned *if* the request is allowed to continue AND
  // no token refresh occurs that requires creating a new response object inside setAll.
  let supabaseResponse = NextResponse.next({
    request,
  });

  // STEP 2: Create the Supabase server client instance.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // since serverClient is platform agnostic, we set it up to use Next.js cookie methods
      cookies: {
        // How to READ cookies from the INCOMING request: uses the NextRequest object's cookie parser
        getAll() {
          return request.cookies.getAll();
        },
        // How to WRITE cookies to the OUTGOING response:
        // This function is CALLED INTERNALLY by the Supabase SDK
        // if supabase.auth.getUser() performs a token refresh.
        setAll(cookiesToSet) {
          // 'cookiesToSet' is an array of { name, value, options } for the new tokens.
          // Optional: Update the request object's cookies in memory for the rest
          //  of *this* middleware execution, on in case middleware could be chained
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // THE KEY PART: RE-CREATE NextResponse
          // Why? To ensure a clean response object containing the latest request state
          // and providing a fresh target for setting only the necessary auth cookies.
          // This overwrites the 'supabaseResponse' variable defined in the outer scope (closures).
          supabaseResponse = NextResponse.next({
            request, // Pass the potentially modified request object
          });
          // Add the 'Set-Cookie' headers for the new tokens to this NEW response object.
          // This tells the browser to store the updated tokens.
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // STEP 3: Attempt to get the user session AND potentially refresh tokens.
  // VERY IMPORTANT: This call does two things:
  // 1. Reads tokens using the `getAll` function defined above.
  // 2. Validates the access token.
  // 3. If the access token is invalid/expired, it uses the refresh token (if available)
  //    to request new tokens from the Supabase Auth server.
  // 4. If tokens are successfully refreshed, it calls the `setAll` function defined above,
  //    passing in the new tokens. This MODIFIES the `supabaseResponse` variable via closure.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(`middleware check user=${user}`);
  if (!user && isAuthenticatedPath(request.nextUrl.pathname)) {
    console.log('redirecting to signIn in middleware');
    const url = request.nextUrl.clone();
    url.pathname = signInPath();
    return NextResponse.redirect(url);
  }
  // STEP 5: Return the final response object.
  // IMPORTANT: You *must* return the `supabaseResponse` variable AS IT IS at this point.
  // - If no token refresh happened, it's the original NextResponse created in Step 1.
  // - If a token refresh *did* happen, `getUser()` triggered `setAll`, which REPLACED
  //   the object referenced by `supabaseResponse` with a NEW NextResponse object
  //   containing the necessary `Set-Cookie` headers.
  // Returning this ensures the browser gets the updated tokens if they were refreshed.
  // Modifying this object *after* getUser() without carefully managing cookies (as per the code comments)
  // can cause the client and server states to desynchronize.
  return supabaseResponse;
}
