-- =====================================================
-- Add function to increment preset usage count
-- =====================================================

CREATE OR REPLACE FUNCTION increment_preset_usage(preset_id UUID)
RETURNS invoice_data_presets AS $$
DECLARE
  updated_preset invoice_data_presets;
BEGIN
  UPDATE invoice_data_presets
  SET usage_count = usage_count + 1
  WHERE id = preset_id
  RETURNING * INTO updated_preset;
  
  RETURN updated_preset;
END;
$$ LANGUAGE plpgsql;

