import { NextResponse } from 'next/server';
import { authenticateWithGoogle } from '@/providers/custom-plugins';
import { getSession, setAuthToken } from '@/lib/session';

// Type guard functions
function isCurrentUser(
  result: any,
): result is { id: string; identifier: string; __typename?: 'CurrentUser' } {
  return (
    result &&
    typeof result.id === 'string' &&
    typeof result.identifier === 'string'
  );
}

function isInvalidCredentialsError(
  result: any,
): result is { message: string; __typename: 'InvalidCredentialsError' } {
  return result && result.__typename === 'InvalidCredentialsError';
}

function isNotVerifiedError(
  result: any,
): result is { message: string; __typename: 'NotVerifiedError' } {
  return result && result.__typename === 'NotVerifiedError';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token?.toString();
    const redirectTo = body.redirectTo?.toString();

    if (!token) {
      console.error('No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Get session to read anonymous auth token for cart merge
    const session = await getSession();
    const anonymousAuthToken = session.authToken;

    console.log('Attempting Google authentication...');
    const { result: authResult, headers: authHeaders } = await authenticateWithGoogle(token, anonymousAuthToken);

    console.log('Auth result:', authResult);

    if (isInvalidCredentialsError(authResult)) {
      console.error('Invalid credentials:', authResult.message);
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    if (isNotVerifiedError(authResult)) {
      console.error('Email not verified:', authResult.message);
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    if (isCurrentUser(authResult)) {
      console.log('Authentication successful for user:', authResult.identifier);

      // Save the authenticated vendure-auth-token to session
      const vendureToken = authHeaders.get('vendure-auth-token');
      if (vendureToken) {
        session.authToken = vendureToken;
      }
      (session as any).channelToken = 'Ind-Snacks';
      (session as any).userId = authResult.id;
      (session as any).identifier = authResult.identifier;
      (session as any).rememberMe = true;

      await session.save();

      // Check if user has phone number
      try {
        const { getActiveCustomerDetails } = await import('@/providers/customer');
        const { activeCustomer } = await getActiveCustomerDetails();

        const needsPhoneNumber = !activeCustomer?.phoneNumber || activeCustomer.phoneNumber.trim() === '';

        if (needsPhoneNumber) {
          const accountUrl = new URL('/account', request.url);
          accountUrl.searchParams.set('requirePhone', 'true');
          if (redirectTo) {
            accountUrl.searchParams.set('redirectTo', redirectTo);
          }
          return NextResponse.json({ success: true, redirectUrl: accountUrl.pathname + accountUrl.search });
        }
      } catch (error) {
        console.error('Error checking phone number:', error);
      }

      // Build redirect URL
      const targetPath = redirectTo || '/';
      const url = new URL(targetPath, request.url);
      url.searchParams.set('reload', 'true');
      url.searchParams.set('loginSuccess', 'true');

      // Pass referrerId through if present in formData so client can auto-register
      const referrerId = body.referrerId?.toString();
      if (referrerId) {
        url.searchParams.set('pendingReferral', referrerId);
      }

      return NextResponse.json({ success: true, redirectUrl: url.pathname + url.search });
    }

    // Handle other possible error types
    console.error('Unexpected authentication result:', authResult);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  } catch (error) {
    console.error('Google authentication error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
