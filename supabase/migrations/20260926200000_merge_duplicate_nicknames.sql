-- One-time data migration for legacy duplicate nicknames.
-- Run this once against the existing Supabase project after the player_profiles migration.
-- Rule: latest save is the canonical account; collection/progress arrays are merged by union;
-- xp/coins/unlocked/streak use the maximum values.

do $$
declare
  g record;
  canonical record;
  merged jsonb;
  arr jsonb;
begin
  for g in
    select lower(btrim(save_data->>'nickname')) as nickname_key
    from public.game_progress
    where nullif(btrim(save_data->>'nickname'),'') is not null
    group by 1
    having count(*) > 1
  loop
    select gp.* into canonical
    from public.game_progress gp
    where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key
    order by gp.updated_at desc, gp.user_id desc
    limit 1;

    merged := canonical.save_data;

    select coalesce(jsonb_agg(x.value order by x.value), '[]'::jsonb) into arr
    from (select distinct e.value from public.game_progress gp cross join lateral jsonb_array_elements(coalesce(gp.save_data->'completed','[]'::jsonb)) e(value) where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key) x;
    merged := merged || jsonb_build_object('completed', arr);

    select coalesce(jsonb_agg(x.value order by x.value), '[]'::jsonb) into arr
    from (select distinct e.value from public.game_progress gp cross join lateral jsonb_array_elements(coalesce(gp.save_data->'lessonsDone','[]'::jsonb)) e(value) where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key) x;
    merged := merged || jsonb_build_object('lessonsDone', arr);

    select coalesce(jsonb_agg(x.value order by x.value), '[]'::jsonb) into arr
    from (select distinct e.value from public.game_progress gp cross join lateral jsonb_array_elements(coalesce(gp.save_data->'pets','[]'::jsonb)) e(value) where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key) x;
    merged := merged || jsonb_build_object('pets', arr);

    select coalesce(jsonb_agg(x.value order by x.value), '[]'::jsonb) into arr
    from (select distinct e.value from public.game_progress gp cross join lateral jsonb_array_elements(coalesce(gp.save_data->'inventory','[]'::jsonb)) e(value) where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key) x;
    merged := merged || jsonb_build_object('inventory', arr);

    select coalesce(jsonb_agg(x.value order by x.value), '[]'::jsonb) into arr
    from (select distinct e.value from public.game_progress gp cross join lateral jsonb_array_elements(coalesce(gp.save_data->'roomItems','[]'::jsonb)) e(value) where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key) x;
    merged := merged || jsonb_build_object('roomItems', arr);

    select jsonb_build_object(
      'xp', coalesce(max((gp.save_data->>'xp')::int), 0),
      'coins', coalesce(max((gp.save_data->>'coins')::int), 0),
      'unlocked', coalesce(max((gp.save_data->>'unlocked')::int), 1),
      'streak', coalesce(max((gp.save_data->>'streak')::int), 0)
    ) into arr
    from public.game_progress gp
    where lower(btrim(gp.save_data->>'nickname')) = g.nickname_key;
    merged := merged || arr;

    update public.game_progress
      set save_data = merged,
          updated_at = greatest(updated_at, now())
      where user_id = canonical.user_id;

    delete from public.game_progress
      where lower(btrim(save_data->>'nickname')) = g.nickname_key
        and user_id <> canonical.user_id;
  end loop;
end $$;
