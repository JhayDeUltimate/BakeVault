-- Schedule periodic cleanup for anonymous insert throttle records.
-- Keep this as a forward migration so normal `supabase db push` can apply it safely.

create extension if not exists pg_cron with schema extensions;

do $$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'cleanup-throttle-records'
  ) then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'cleanup-throttle-records';
  end if;

  perform cron.schedule(
    'cleanup-throttle-records',
    '0 * * * *',
    $job$ select public.cleanup_throttle_records(); $job$
  );
end;
$$;
