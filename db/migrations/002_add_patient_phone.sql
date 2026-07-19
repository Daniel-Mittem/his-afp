SET search_path TO sio;

ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
