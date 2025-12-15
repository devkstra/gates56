import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Helper to get the MIME type from base64
function getMimeType(base64: string): string {
  const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  return mime ? mime[1] : 'image/jpeg';
}

// Helper to handle file upload to Supabase Storage
async function uploadPhotoToStorage(supabase: any, photoData: string) {
  try {
    // Handle both data URL and raw base64
    const base64Data = photoData.includes('base64,') 
      ? photoData.split('base64,')[1] 
      : photoData
    
    if (!base64Data) {
      console.error('No base64 data found in photo_file')
      throw new Error('Invalid photo data')
    }
    
    const mimeType = getMimeType(photoData) || 'image/jpeg'
    const fileExt = mimeType.split('/')[1] || 'jpg'
    const fileName = `member-${Date.now()}.${fileExt}`
    const filePath = `member-photos/${fileName}`
    
    console.log(`Uploading photo: ${filePath} (${mimeType})`)
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Upload the file directly to storage
    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('Error uploading photo:', uploadError)
      throw new Error(`Failed to upload photo: ${uploadError.message}`)
    }
    
    // Get public URL
    const { data: { publicUrl } } = await supabase.storage
      .from('member-photos')
      .getPublicUrl(filePath)
    
    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded photo')
    }
    
    console.log('Photo uploaded successfully:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Error in uploadPhotoToStorage:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    // First, upload the photo if it exists
    let photoUrl = ''
    
    if (body.photo_file) {
      console.log('Processing photo upload...')
      try {
        photoUrl = await uploadPhotoToStorage(supabase, body.photo_file)
      } catch (uploadErr) {
        console.error('Error processing photo upload:', uploadErr)
        // Continue without photo if upload fails, but log the error
        console.log('Member will be created without a photo due to upload error')
      }
    }
    
    // Prepare member data for insertion - matching exact database column names
    const memberData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      age: body.age || 0,
      gender: body.gender,
      plan: body.plan,
      plan_start_date: body.plan_start_date,
      plan_end_date: body.plan_end_date,
      status: 'active',
      photo_url: photoUrl,
      face_descriptor: body.face_descriptor || null,
      join_date: new Date().toISOString(),
      last_visit_date: null
    }

    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()
      
    if (error) {
      console.error('Error inserting member:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create member' },
        { status: 400 }
      )
    }
    
    // Revalidate the dashboard page
    revalidatePath('/dashboard')
    
    // Map the response back to camelCase for the frontend
    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        // Map snake_case to camelCase for the frontend
        planType: data.plan,
        planStartDate: data.plan_start_date,
        planEndDate: data.plan_end_date,
        photoUrl: data.photo_url,
        joinDate: data.join_date,
        lastVisitDate: data.last_visit_date
      }
    })
  } catch (error: unknown) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
