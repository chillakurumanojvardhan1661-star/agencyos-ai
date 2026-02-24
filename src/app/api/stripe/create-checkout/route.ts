import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') || 'professional';

    // Get or create agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Type assertion for agency query
    // TODO: Remove after generating real Supabase types
    const agencyData = agency as any;

    // Get or create Stripe customer
    let customerId: string;
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('agency_id', agencyData.id)
      .single();

    // Type assertion for subscription query
    // TODO: Remove after generating real Supabase types
    const subscriptionData = subscription as any;

    if (subscriptionData?.stripe_customer_id) {
      customerId = subscriptionData.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          agency_id: agencyData.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: getPriceId(plan),
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        agency_id: agencyData.id,
        user_id: user.id,
        plan,
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function getPriceId(plan: string): string {
  // In production, these would be your actual Stripe Price IDs
  const priceIds: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    professional: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
  };

  return priceIds[plan] || priceIds.professional;
}
