CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text,
  email text,
  overall_rating smallint NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  skill_passport_rating smallint CHECK (skill_passport_rating BETWEEN 0 AND 5),
  nft_rating smallint CHECK (nft_rating BETWEEN 0 AND 5),
  qr_verification_rating smallint CHECK (qr_verification_rating BETWEEN 0 AND 5),
  recruiter_dashboard_rating smallint CHECK (recruiter_dashboard_rating BETWEEN 0 AND 5),
  wallet_login_rating smallint CHECK (wallet_login_rating BETWEEN 0 AND 5),
  reputation_score_rating smallint CHECK (reputation_score_rating BETWEEN 0 AND 5),
  public_profile_rating smallint CHECK (public_profile_rating BETWEEN 0 AND 5),
  user_experience_rating smallint CHECK (user_experience_rating BETWEEN 0 AND 5),
  liked_most text,
  most_useful_feature text,
  improvements text,
  suggestions text,
  comments text,
  reactions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.feedback TO anon;
GRANT SELECT, INSERT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback public read" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "admins delete feedback" ON public.feedback FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add admin role to existing enum if not present
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

CREATE INDEX feedback_created_at_idx ON public.feedback (created_at DESC);