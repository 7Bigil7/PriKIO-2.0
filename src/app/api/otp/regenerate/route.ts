import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { job_id } = await request.json();
    if (!job_id) {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify job belongs to user (or is accessible)
    const { data: job, error: jobError } = await supabase
      .from('print_jobs')
      .select('id')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    // Invalidate any existing active OTPs for this job
    await supabase
      .from('print_otps')
      .update({ is_valid: false })
      .eq('job_id', job_id)
      .eq('is_valid', true);

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_hash = await bcrypt.hash(otp, 10);
    const expires_at = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from('print_otps')
      .insert({
        job_id,
        otp_hash,
        expires_at,
        attempts: 0,
        is_valid: true
      });

    if (insertError) {
      console.error('Insert OTP Error:', insertError);
      return NextResponse.json({ error: 'Failed to regenerate OTP' }, { status: 500 });
    }

    return NextResponse.json({ otp, expires_at });
  } catch (err) {
    console.error('OTP Regenerate Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
