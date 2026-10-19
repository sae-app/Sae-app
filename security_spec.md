# SAE Security Specification & TDD Test Matrix

## 1. Data Invariants
1. The `/settings/mascot` document can be read by any visitor (public read) so the homepage can display the brand mascot.
2. Only authenticated administrators (such as `triaide02@gmail.com` or users with records in `/admins/{adminId}`) can create, update, or delete `/settings/mascot`.
3. Updates to `/settings/mascot` must satisfy field constraints: `customSize` must be a positive number, strings must observe size boundaries.
4. Admins collection `/admins/{adminId}` can only be read/managed by verified administrators.

## 2. The "Dirty Dozen" Threat Payloads
1. Unauthenticated write to `/settings/mascot` -> Expected: PERMISSION_DENIED.
2. Non-admin write with arbitrary UID to `/settings/mascot` -> Expected: PERMISSION_DENIED.
3. Admin write to `/settings/mascot` with negative or NaN size -> Expected: PERMISSION_DENIED.
4. Admin write to `/settings/mascot` with oversized strings (>5MB) -> Expected: PERMISSION_DENIED.
5. Unauthenticated read from `/admins/{adminId}` -> Expected: PERMISSION_DENIED.
6. Non-admin read from other admin record in `/admins/{adminId}` -> Expected: PERMISSION_DENIED.
7. Unauthenticated delete of `/settings/mascot` -> Expected: PERMISSION_DENIED.
8. Non-admin self-escalation by creating document in `/admins/{uid}` -> Expected: PERMISSION_DENIED.
9. Writing ghost/unauthorized fields to `/settings/mascot` without conforming to allowed keys -> Expected: PERMISSION_DENIED.
10. Spoofed email address without verified email token trying to access admin -> Expected: PERMISSION_DENIED.
11. Blanket write to unauthorized collection `/system/{all}` -> Expected: PERMISSION_DENIED.
12. Malicious document ID injection (>128 chars or illegal characters) -> Expected: PERMISSION_DENIED.
