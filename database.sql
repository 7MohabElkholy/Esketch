-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  test_type text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_progress_pkey PRIMARY KEY (id),
  CONSTRAINT daily_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lectures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  pdf_path text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  available boolean DEFAULT true,
  subject text NOT NULL,
  cover text,
  CONSTRAINT lectures_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'user'::text UNIQUE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  test_id text,
  score integer NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT reports_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.tests (
  id text NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT tests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.upcoming_events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text,
  date_text text,
  CONSTRAINT upcoming_events_pkey PRIMARY KEY (id)
);