
-- Allow any authenticated user to manage animals and requests
DROP POLICY IF EXISTS "Admins can insert animals" ON public.animals;
DROP POLICY IF EXISTS "Admins can update animals" ON public.animals;
DROP POLICY IF EXISTS "Admins can delete animals" ON public.animals;
DROP POLICY IF EXISTS "Admins can view requests" ON public.adoption_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.adoption_requests;
DROP POLICY IF EXISTS "Admins can delete requests" ON public.adoption_requests;

CREATE POLICY "Authenticated can insert animals" ON public.animals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update animals" ON public.animals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete animals" ON public.animals FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can view requests" ON public.adoption_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update requests" ON public.adoption_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete requests" ON public.adoption_requests FOR DELETE TO authenticated USING (true);
