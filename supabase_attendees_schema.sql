-- Supabase attendees table schema
-- Run this SQL in the Supabase SQL editor to create your attendees table
CREATE TABLE attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  status text DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- You can add more fields as needed (e.g., ticket_type, notes)
