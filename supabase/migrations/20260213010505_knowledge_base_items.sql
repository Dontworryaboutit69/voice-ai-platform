-- Create knowledge base items table
CREATE TABLE IF NOT EXISTS public.knowledge_base_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  source_type text DEFAULT 'manual' CHECK (source_type IN ('manual', 'website', 'document')),
  source_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_items_agent_id ON public.knowledge_base_items(agent_id);

-- Enable RLS
ALTER TABLE public.knowledge_base_items ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (will add proper auth later)
CREATE POLICY IF NOT EXISTS "Allow all operations on knowledge_base_items" ON public.knowledge_base_items FOR ALL USING (true);
