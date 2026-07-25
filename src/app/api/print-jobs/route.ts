import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.jobId) {
      // Fallback for any old flows
      return NextResponse.json({
        data: { id: `job_dummy_${Date.now()}`, ...body, status: 'pending' }
      })
    }

    const supabase = await createClient()

    // Get the existing print job to preserve storage paths
    const { data: existingJob, error: fetchError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', body.jobId)
      .single()

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Print job not found' }, { status: 404 })
    }

    // Build the new files array from the body payload which contains all uploaded files
    const newFiles = (body.files || []).map((bodyFile: any) => {
      return {
        file_id: bodyFile.id || crypto.randomUUID(),
        filename: bodyFile.fileName,
        storage_path: bodyFile.storage_path,
        pages_selected: bodyFile.pageRange || 'All',
        copies: body.copies || 1,
        color_mode: body.colorMode === 'bw' ? 'B&W' : 'Color',
        paper_size: 'A4',
        sides: body.sides === 'duplex' ? 'Double' : 'Single',
        orientation: body.orientation === 'landscape' ? 'Landscape' : 'Portrait',
        subtotal_paise: body.total_amount ? body.total_amount * 100 : 200
      }
    })

    const { data: updatedJob, error: updateError } = await supabase
      .from('print_jobs')
      .update({
         files: newFiles,
         total_amount_paise: body.total_amount ? body.total_amount * 100 : existingJob.total_amount_paise
      })
      .eq('id', body.jobId)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }
    
    return NextResponse.json({
      data: updatedJob
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ data: [] })
}
