// The lab data volume is created from scratch by `lab:up` after `lab:down`.
// Do not delete prices here: Docker Compose reruns completed dependency jobs on
// subsequent `up` calls, which would otherwise replace the SPHERE identity
// while SPACE still references it.
print('SPHERE pricing cleanup is intentionally skipped; bootstrap is idempotent.');
