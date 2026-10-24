# Security Specification - Delta Industrial Solutions

## Data Invariants
1. **Products/Categories/Brands**: Publicly readable, but only writeable by Admins.
2. **Enquiries**:
    - Customers can create enquiries.
    - Customers can only read/list their own enquiries (based on `userId`).
    - Admins can read/list/update all enquiries.
    - Status updates are restricted (Customers cannot change status to 'quoted' or 'closed').
3. **User Profiles**:
    - Users can read/write their own profile (except for `role`).
    - Only Admins can modify the `role` field.
4. **Admins**:
    - Restricted list in `/admins/{uid}` collection.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Enquiry)**: Create an enquiry with a `userId` belonging to another user.
2. **Privilege Escalation (Profile)**: Update own `UserProfile` to set `role: "admin"`.
3. **State Shortcutting (Enquiry)**: Update own enquiry status directly to "quoted".
4. **Anonymous Write (Product)**: Attempt to create a product without authentication.
5. **Unauthorized Read (Enquiry)**: Attempt to read another user's enquiry by ID.
6. **Query Scraping (Enquiry)**: Attempt to list all enquiries without a `userId` filter.
7. **Resource Poisoning (Product)**: Inject a 1MB description into a product.
8. **Orphaned Record (Enquiry)**: Create an enquiry for a non-existent `userId`.
9. **Immutable Violation (Product)**: Attempt to change a product's `createdAt` timestamp.
10. **System Field Hijack (Profile)**: Attempt to modify `uid` field in user profile.
11. **PII Leak (Profile)**: Read another user's profile PII without admin rights.
12. **Bulk Delete (Enquiry)**: Attempt to delete all enquiries as a customer.

## Test Runner (Conceptual)
The `firestore.rules.test.ts` will verify:
- `get` on `/enquiries/other-user-id` returns `PERMISSION_DENIED` for a regular user.
- `update` on `/users/my-id` with `role: "admin"` returns `PERMISSION_DENIED`.
- `create` on `/products` returns `PERMISSION_DENIED` for a regular user.
- `list` on `/enquiries` without `where("userId", "==", myId)` returns `PERMISSION_DENIED`.
