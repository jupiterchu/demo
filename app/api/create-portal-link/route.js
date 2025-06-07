import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { stripe } from '@/libs/stripe';
import { createOrRetrieveCustomer } from '@/libs/supabase-admin';
import { getURL } from '@/libs/helpers';

export async function POST(req) {
  if (req.method === 'POST') {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({cookies: () => cookieStore});
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) throw Error('Could not get user');
      const customer = await createOrRetrieveCustomer({
        uuid: user.id || '',
        email: user.email || ''
      });

      if (!customer) throw Error('Could not get customer');
      
      try {
        const { url } = await stripe.billingPortal.sessions.create({
          customer,
          return_url: `${getURL()}/apps/subscription`
        });
        return new Response(JSON.stringify({ url }), {
          status: 200
        });
      } catch (stripeError) {
        console.error('Stripe billing portal error:', stripeError);
        if (stripeError.message?.includes('No configuration provided')) {
          return new Response(
            JSON.stringify({ 
              error: { 
                statusCode: 400, 
                message: 'Customer portal is not configured. Please configure it in your Stripe dashboard at https://dashboard.stripe.com/test/settings/billing/portal' 
              } 
            }),
            { status: 400 }
          );
        }
        throw stripeError;
      }
    } catch (err) {
      console.log(err);
      return new Response(
        JSON.stringify({ error: { statusCode: 500, message: err.message } }),
        {
          status: 500
        }
      );
    }
  } else {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }
}
