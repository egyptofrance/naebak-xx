-- Add is_visible column to governorates table for phased rollout
ALTER TABLE governorates
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_governorates_is_visible ON governorates(is_visible);

-- Add comment
COMMENT ON COLUMN governorates.is_visible IS 'Controls whether the governorate is visible to the public (for phased rollout)';

-- Update existing governorates to be hidden by default
UPDATE governorates SET is_visible = false WHERE is_visible IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE governorates ALTER COLUMN is_visible SET NOT NULL;

-- Optional: Set specific governorates as visible (Cairo, Giza, Qalyubia as examples)
-- Uncomment the lines below if you want to make these governorates visible by default
-- UPDATE governorates SET is_visible = true WHERE name_ar IN ('القاهرة', 'الجيزة', 'القليوبية');
