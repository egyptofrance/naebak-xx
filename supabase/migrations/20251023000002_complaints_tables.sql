-- Create complaints tables
-- Migration: 20251023000002_complaints_tables.sql

-- Main complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Citizen information
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  citizen_phone TEXT,
  citizen_email TEXT,
  
  -- Complaint details
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 255),
  description TEXT NOT NULL CHECK (char_length(description) >= 20 AND char_length(description) <= 5000),
  category complaint_category NOT NULL,
  
  -- Status and priority
  status complaint_status NOT NULL DEFAULT 'new',
  priority complaint_priority NOT NULL DEFAULT 'medium',
  
  -- Location information
  governorate TEXT,
  district TEXT,
  address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Assignment
  assigned_deputy_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Resolution
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  
  -- Hold information
  on_hold_until TIMESTAMP WITH TIME ZONE,
  on_hold_reason TEXT,
  
  -- Rejection information
  rejection_reason TEXT,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint actions/history table
CREATE TABLE complaint_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  
  -- Action details
  action_type complaint_action_type NOT NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action data
  old_value TEXT,
  new_value TEXT,
  comment TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX idx_complaints_assigned_deputy_id ON complaints(assigned_deputy_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaint_actions_complaint_id ON complaint_actions(complaint_id);
CREATE INDEX idx_complaint_actions_created_at ON complaint_actions(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_complaints_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS on complaints table
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Enable RLS on complaint_actions table
ALTER TABLE complaint_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Citizens can view their own complaints
CREATE POLICY "Citizens can view their own complaints"
  ON complaints
  FOR SELECT
  USING (auth.uid() = citizen_id);

-- Policy: Citizens can create complaints
CREATE POLICY "Citizens can create complaints"
  ON complaints
  FOR INSERT
  WITH CHECK (auth.uid() = citizen_id);

-- Policy: Citizens can update their own complaints (limited fields)
CREATE POLICY "Citizens can update their own complaints"
  ON complaints
  FOR UPDATE
  USING (auth.uid() = citizen_id)
  WITH CHECK (auth.uid() = citizen_id);

-- Policy: Deputies can view assigned complaints
CREATE POLICY "Deputies can view assigned complaints"
  ON complaints
  FOR SELECT
  USING (auth.uid() = assigned_deputy_id);

-- Policy: Deputies can update assigned complaints
CREATE POLICY "Deputies can update assigned complaints"
  ON complaints
  FOR UPDATE
  USING (auth.uid() = assigned_deputy_id);

-- Policy: Managers and Admins can view all complaints
CREATE POLICY "Managers and Admins can view all complaints"
  ON complaints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deputy_profiles
      WHERE user_id = auth.uid()
      AND deputy_status IN ('manager', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM application_admins
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Managers and Admins can update all complaints
CREATE POLICY "Managers and Admins can update all complaints"
  ON complaints
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM deputy_profiles
      WHERE user_id = auth.uid()
      AND deputy_status IN ('manager', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM application_admins
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can view actions on their complaints
CREATE POLICY "Users can view actions on their complaints"
  ON complaint_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_actions.complaint_id
      AND complaints.citizen_id = auth.uid()
    )
  );

-- Policy: Deputies can view actions on assigned complaints
CREATE POLICY "Deputies can view actions on assigned complaints"
  ON complaint_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_actions.complaint_id
      AND complaints.assigned_deputy_id = auth.uid()
    )
  );

-- Policy: Managers and Admins can view all actions
CREATE POLICY "Managers and Admins can view all actions"
  ON complaint_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deputy_profiles
      WHERE user_id = auth.uid()
      AND deputy_status IN ('manager', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM application_admins
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create actions
CREATE POLICY "Authenticated users can create actions"
  ON complaint_actions
  FOR INSERT
  WITH CHECK (auth.uid() = performed_by);

-- Comments
COMMENT ON TABLE complaints IS 'Stores citizen complaints with status tracking and assignment';
COMMENT ON TABLE complaint_actions IS 'Stores history of all actions performed on complaints';
COMMENT ON COLUMN complaints.status IS 'Current status of the complaint';
COMMENT ON COLUMN complaints.priority IS 'Priority level of the complaint';
COMMENT ON COLUMN complaints.on_hold_until IS 'Date until which the complaint is on hold (3 days from hold date)';

