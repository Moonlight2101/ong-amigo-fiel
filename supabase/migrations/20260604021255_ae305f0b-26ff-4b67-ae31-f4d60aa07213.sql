-- Restrict adoption_requests SELECT/UPDATE/DELETE to admins only
DROP POLICY IF EXISTS "Authenticated can view requests" ON public.adoption_requests;
DROP POLICY IF EXISTS "Authenticated can update requests" ON public.adoption_requests;
DROP POLICY IF EXISTS "Authenticated can delete requests" ON public.adoption_requests;

CREATE POLICY "Admins can view adoption requests"
  ON public.adoption_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update adoption requests"
  ON public.adoption_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete adoption requests"
  ON public.adoption_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Restrict animals INSERT/UPDATE/DELETE to admins only (SELECT remains public)
DROP POLICY IF EXISTS "Authenticated can insert animals" ON public.animals;
DROP POLICY IF EXISTS "Authenticated can update animals" ON public.animals;
DROP POLICY IF EXISTS "Authenticated can delete animals" ON public.animals;

CREATE POLICY "Admins can insert animals"
  ON public.animals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update animals"
  ON public.animals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete animals"
  ON public.animals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));