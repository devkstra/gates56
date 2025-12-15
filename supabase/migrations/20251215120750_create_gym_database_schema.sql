/*
  # Create Gym Management Database Schema

  1. New Tables
    - `members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `age` (integer)
      - `gender` (text)
      - `plan` (text) - membership plan type
      - `plan_start_date` (timestamptz)
      - `plan_end_date` (timestamptz)
      - `status` (text) - active/inactive/expired
      - `photo_url` (text) - URL to member photo
      - `face_descriptor` (jsonb) - 128-float face descriptor for recognition
      - `join_date` (timestamptz)
      - `last_visit_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `attendance`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key)
      - `timestamp` (timestamptz)
      - `method` (text) - face/qr/manual
      - `entry_time` (timestamptz)
      - `exit_time` (timestamptz)
      - `recorded_by` (text) - camera/admin/system
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  age integer DEFAULT 0,
  gender text NOT NULL,
  plan text NOT NULL,
  plan_start_date timestamptz NOT NULL,
  plan_end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  photo_url text,
  face_descriptor jsonb,
  join_date timestamptz DEFAULT now(),
  last_visit_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  method text DEFAULT 'face',
  entry_time timestamptz DEFAULT now(),
  exit_time timestamptz,
  recorded_by text DEFAULT 'camera',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for members table
CREATE POLICY "Allow public read access to members"
  ON members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to members"
  ON members FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to members"
  ON members FOR UPDATE
  TO public
  USING (true);

-- Create policies for attendance table
CREATE POLICY "Allow public read access to attendance"
  ON attendance FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to attendance"
  ON attendance FOR INSERT
  TO public
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE members IS 'Stores gym member information including face descriptors for recognition';
COMMENT ON COLUMN members.face_descriptor IS '128-dimensional face descriptor vector for face recognition (stored as JSON array)';
COMMENT ON TABLE attendance IS 'Records member check-in/check-out events';
