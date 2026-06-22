import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createClient()
    const jobId = uuidv4()
    
    // Upload file to Supabase Storage
    const storagePath = `${jobId}/${file.name}`
    const buffer = await file.arrayBuffer()
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { 
        upsert: true,
        contentType: file.type
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    // Determine total pages (Mock 1 for images, would need pdf-parse for real PDFs)
    const pageCount = 1

    // Create the print_jobs record
    const filesJson = [{
      file_id: uuidv4(),
      filename: file.name,
      storage_path: storagePath,
      pages_selected: 'All',
      copies: 1,
      color_mode: 'B&W',
      paper_size: 'A4',
      sides: 'Single',
      subtotal_paise: 200
    }]

    const { error: jobError } = await supabase
      .from('print_jobs')
      .insert({
        id: jobId,
        session_id: uuidv4(), // temporary session ID
        status: 'pending',
        files: filesJson,
        total_amount_paise: 200,
        estimated_seconds: 10 * pageCount
      })

    if (jobError) {
      console.error('Job insert error:', jobError)
      return NextResponse.json({ error: 'Failed to create job record' }, { status: 500 })
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    // Insert into otp_sessions
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins validity
    const { error: otpError } = await supabase
      .from('otp_sessions')
      .insert({
        print_job_id: jobId,
        otp_code: otp,
        expires_at: expiresAt
      })

    if (otpError) {
      console.error('OTP insert error:', otpError)
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    return NextResponse.json({
      job_id: jobId,
      otp: otp,
      expires_in: 900,
      page_count: pageCount
    })

  } catch (error: any) {
    console.error('Upload handler error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
