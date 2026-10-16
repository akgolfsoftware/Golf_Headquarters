-- Index the child-side columns of the composite CourseTee foreign key.
-- PostgreSQL does not create this index automatically, and deletes/updates of
-- a tee otherwise need to scan course_hole_tees.
CREATE INDEX IF NOT EXISTS "course_hole_tees_teeId_baneId_idx"
  ON "course_hole_tees" ("teeId", "baneId");
