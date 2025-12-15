'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from './client';
import type { Member, AttendanceRecord } from '../mock-data';

interface SupabaseContextType {
  members: Member[];
  attendance: AttendanceRecord[];
  gateStatus: 'open' | 'closed';
  setGateStatus: (status: 'open' | 'closed') => void;
  addMember: (member: Omit<Member, 'id' | 'lastVisitDate' | 'joinDate'> & { photoFile?: File }) => Promise<void>;
  recordAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [gateStatus, setGateStatus] = useState<'open' | 'closed'>('closed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use useMemo to ensure the client is only created once
  const supabase = useMemo(() => createClient(), []);

  // Fetch members from Supabase
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Convert date strings back to Date objects and handle face_descriptor
      const formattedData = data.map(member => ({
        ...member,
        planStartDate: new Date(member.plan_start_date),
        planEndDate: new Date(member.plan_end_date),
        joinDate: new Date(member.join_date),
        lastVisitDate: member.last_visit_date ? new Date(member.last_visit_date) : undefined,
        photoUrl: member.photo_url,
        faceDescriptor: member.face_descriptor ? (Array.isArray(member.face_descriptor) ? member.face_descriptor : []) : undefined,
      }));
      
      setMembers(formattedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records from Supabase
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); // Limit to 100 most recent records for performance

      if (error) throw error;
      
      // Convert date strings back to Date objects
      const formattedData = data.map(record => ({
        ...record,
        timestamp: new Date(record.timestamp),
        entryTime: new Date(record.entryTime),
        exitTime: record.exitTime ? new Date(record.exitTime) : undefined,
      }));
      
      setAttendance(formattedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new member to Supabase
  const addMember = async (member: Omit<Member, 'id' | 'lastVisitDate' | 'joinDate'> & { photoFile?: File }) => {
    try {
      setLoading(true);
      
      // Upload photo to storage if provided
      let photoUrl = member.photoUrl;
      if (member.photoFile) {
        const fileExt = member.photoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `member-photos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(filePath, member.photoFile);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(filePath);
          
        photoUrl = publicUrl;
      }
      
      // Insert member into database
      const { data, error } = await supabase
        .from('members')
        .insert([
          {
            ...member,
            photoUrl,
            lastVisitDate: null,
            joinDate: new Date().toISOString(),
          },
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setMembers(prev => [
        ...prev,
        {
          ...data,
          planStartDate: new Date(data.planStartDate),
          planEndDate: new Date(data.planEndDate),
          joinDate: new Date(data.joinDate),
          lastVisitDate: data.lastVisitDate ? new Date(data.lastVisitDate) : undefined,
        },
      ]);
      
      return data;
    } catch (err) {
      setError(err as Error);
      console.error('Error adding member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Record attendance using the API route
  const recordAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      setLoading(true);
      
      // Ensure we have valid timestamps
      const now = new Date();
      const timestamp = record.timestamp || now;
      const entryTime = record.entryTime || now;
      
      console.log('Sending attendance record to API:', {
        memberId: record.memberId,
        timestamp,
        entryTime,
        exitTime: record.exitTime
      });
      
      // Call the API route
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: record.memberId,
          timestamp: timestamp.toISOString(),
          method: record.method || 'face',
          entryTime: entryTime.toISOString(),
          exitTime: record.exitTime?.toISOString(),
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', result.error);
        throw new Error(result.error || 'Failed to record attendance');
      }
      
      console.log('API Response:', result);
      
      // Convert API response to frontend format
      const frontendRecord = {
        ...result.data,
        timestamp: new Date(result.data.timestamp),
        entryTime: new Date(result.data.entryTime || result.data.entry_time || now),
        exitTime: result.data.exitTime || result.data.exit_time 
          ? new Date(result.data.exitTime || result.data.exit_time) 
          : undefined,
      };
      
      console.log('Created frontend record:', frontendRecord);
      
      // Update local state
      setAttendance(prev => [frontendRecord, ...prev]);
      
      // Refresh members to update last visit date
      await fetchMembers();
      
      return frontendRecord;
    } catch (err) {
      setError(err as Error);
      console.error('Error recording attendance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMembers();
    fetchAttendance();
    
    // Set up real-time subscriptions
    const membersSubscription = supabase
      .channel('members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembers();
      })
      .subscribe();
      
    const attendanceSubscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        fetchAttendance();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(membersSubscription);
      supabase.removeChannel(attendanceSubscription);
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={{
        members,
        attendance,
        gateStatus,
        setGateStatus,
        addMember,
        recordAttendance,
        loading,
        error,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
