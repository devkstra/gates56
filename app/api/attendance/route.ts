import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '../../../lib/database.types';

// Create a server-side Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure this is set in your .env file
);

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { memberId, timestamp, method, entryTime, exitTime } = body;
    
    console.log('Received attendance request with data:', JSON.stringify(body, null, 2));
    
    if (!memberId) {
      console.error('Missing required field: memberId');
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Skip session check for now since we're using service role key
    // This is a temporary solution - in production, you should implement proper authentication
    console.log('Processing attendance record...');

    // Prepare attendance record
    const now = new Date().toISOString();
    const attendanceRecord = {
      member_id: memberId,
      timestamp: timestamp || now,
      method: method || 'face',
      entry_time: entryTime || now,
      exit_time: exitTime || null,
      recorded_by: 'camera' // Default to 'camera' for face recognition
    };

    console.log('Inserting attendance record:', JSON.stringify(attendanceRecord, null, 2));
    
    // Insert attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceRecord])
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting attendance record:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to record attendance', 
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log('Attendance recorded successfully:', data);

    // Update member's last visit date
    const { error: updateError } = await supabase
      .from('members')
      .update({ 
        last_visit_date: now,
        updated_at: now,
      })
      .eq('id', memberId);

    if (updateError) {
      console.error('Error updating member last visit:', updateError);
      // Continue even if this fails
    } else {
      console.log('Member last visit date updated successfully');
    }

    // Return success response with proper case conversion
    const responseData = {
      ...data,
      memberId: data.member_id,
      entryTime: data.entry_time,
      exitTime: data.exit_time,
      recordedBy: data.recorded_by,
    };
    
    console.log('Sending success response with data:', responseData);
    
    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Unexpected error in attendance API:', error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Failed to process attendance',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}
