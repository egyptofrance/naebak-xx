-- Create ENUMs for complaints system
-- Migration: 20251023000001_complaints_enums.sql

-- Complaint Status ENUM
CREATE TYPE complaint_status AS ENUM (
  'new',
  'under_review',
  'assigned_to_deputy',
  'accepted',
  'rejected',
  'in_progress',
  'on_hold',
  'resolved',
  'closed',
  'archived'
);

-- Complaint Priority ENUM
CREATE TYPE complaint_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Complaint Category ENUM
CREATE TYPE complaint_category AS ENUM (
  'infrastructure',
  'education',
  'health',
  'security',
  'environment',
  'transportation',
  'utilities',
  'housing',
  'employment',
  'social_services',
  'legal',
  'corruption',
  'other'
);

-- Action Type ENUM for complaint_actions table
CREATE TYPE complaint_action_type AS ENUM (
  'status_change',
  'priority_change',
  'assignment',
  'comment',
  'rejection',
  'hold',
  'resolution'
);

