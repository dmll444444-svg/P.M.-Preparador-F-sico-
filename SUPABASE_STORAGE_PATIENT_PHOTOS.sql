-- P.P.F · Bucket fotos pacientes
-- Ejecuta una sola vez en Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "ppf_patient_photos_select" on storage.objects;
drop policy if exists "ppf_patient_photos_insert" on storage.objects;
drop policy if exists "ppf_patient_photos_update" on storage.objects;
drop policy if exists "ppf_patient_photos_delete" on storage.objects;

create policy "ppf_patient_photos_select"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'patient-photos');

create policy "ppf_patient_photos_insert"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'patient-photos');

create policy "ppf_patient_photos_update"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'patient-photos')
with check (bucket_id = 'patient-photos');

create policy "ppf_patient_photos_delete"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'patient-photos');
