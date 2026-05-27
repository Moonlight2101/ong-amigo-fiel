
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Animais
CREATE TABLE public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cachorro','gato','outro')),
  breed TEXT,
  age_years INT NOT NULL DEFAULT 0,
  size TEXT NOT NULL CHECK (size IN ('pequeno','medio','grande')),
  sex TEXT NOT NULL CHECK (sex IN ('macho','femea')),
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel','em_processo','adotado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.animals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.animals TO authenticated;
GRANT ALL ON public.animals TO service_role;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view animals" ON public.animals
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert animals" ON public.animals
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update animals" ON public.animals
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete animals" ON public.animals
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Pedidos de adoção
CREATE TABLE public.adoption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  age INT NOT NULL,
  profession TEXT,
  housing_type TEXT NOT NULL,
  has_yard BOOLEAN NOT NULL DEFAULT false,
  has_other_pets BOOLEAN NOT NULL DEFAULT false,
  has_children BOOLEAN NOT NULL DEFAULT false,
  reason TEXT NOT NULL,
  agree_responsibility BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','recusado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.adoption_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.adoption_requests TO authenticated;
GRANT ALL ON public.adoption_requests TO service_role;
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit adoption requests" ON public.adoption_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view requests" ON public.adoption_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update requests" ON public.adoption_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete requests" ON public.adoption_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para promover automaticamente o primeiro usuário a admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
