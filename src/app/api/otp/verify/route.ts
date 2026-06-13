import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// We must use the service role key to bypass RLS since the kiosk is not authenticated as the user
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { otp } = await request.json();
    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }

    // Since OTPs are bcrypt hashed and we don't have a job_id from the kiosk,
    // we must fetch all currently active and unexpired OTPs to find a match.
    const { data: activeOtps, error: fetchError } = await supabase
      .from('print_otps')
      .select('id, job_id, otp_hash, attempts, expires_at')
      .eq('is_valid', true)
      .gte('expires_at', new Date().toISOString());

    if (fetchError || !activeOtps || activeOtps.length === 0) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    let matchedOtp = null;
    for (const record of activeOtps) {
      // If a record has reached max attempts, skip it (should be invalidated, but just in case)
      if (record.attempts >= 5) continue;

      const isMatch = await bcrypt.compare(otp, record.otp_hash);
      if (isMatch) {
        matchedOtp = record;
        break;
      }
    }

    if (!matchedOtp) {
      // NOTE: We cannot increment 'attempts' on a specific record because a wrong guess
      // doesn't match any specific job. In a real scenario, rate-limiting should be done by Kiosk ID/IP.
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Found a match! Mark it as used (is_valid = false)
    await supabase
      .from('print_otps')
      .update({ is_valid: false })
      .eq('id', matchedOtp.id);

    // Fetch the print job details to return to the kiosk
    const { data: job, error: jobError } = await supabase
      .from('print_jobs')
      .select('id, file_url, page_count, copies, color_mode, sides, file_name')
      .eq('id', matchedOtp.job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Print job not found' }, { status: 404 });
    }

    // Update job status to ready/printing
    await supabase
      .from('print_jobs')
      .update({ status: 'ready' })
      .eq('id', job.id);

    return NextResponse.json({
      success: true,
      data: {
        printJobId: job.id,
        fileUrl: job.file_url,
        fileName: job.file_name,
        pageCount: job.page_count,
        copies: job.copies,
        colorMode: job.color_mode,
        sides: job.sides
      }
    });

  } catch (err: any) {
    console.error('OTP Verify Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
