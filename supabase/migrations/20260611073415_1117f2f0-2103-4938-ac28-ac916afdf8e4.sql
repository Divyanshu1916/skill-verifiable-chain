ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS credential_id text UNIQUE DEFAULT ('cred_' || replace(gen_random_uuid()::text, '-', '')),
  ADD COLUMN IF NOT EXISTS nft_id text;

UPDATE public.credentials SET nft_id = nft_token_id WHERE nft_id IS NULL AND nft_token_id IS NOT NULL;
UPDATE public.credentials SET credential_id = 'cred_' || replace(gen_random_uuid()::text, '-', '') WHERE credential_id IS NULL;