# Task Plan: Advanced Pet Management

**Task**: Advanced Pet Management (Profile CRUD, Edit Modal, Delete with Safety, Weight & Health Milestones)
**Epic Context**: Deepening Epic 3 (Pet Profile Hub / Task 3.3)
**Status**: IN_PROGRESS
**Owner**: Builder

---

## 1. Requirements
1. **CRUD Operations in Pet Context**:
   - `updatePet(petId, fields)`: Updates pet state in memory/storage.
   - `deletePet(petId)`: Removes pet, switches active pet safely to next available pet (or null), and removes associated care tasks.
2. **Interactive Edit Pet Modal / Sheet in `/dashboard/pets`**:
   - Allows owner to edit name, breed, weight, daily food consumption, dietary notes, and neutered status.
   - Pre-fills with existing active pet details.
   - Includes validation (positive weight, non-empty name).
3. **Delete Pet Confirmation Dialog**:
   - Prevents accidental deletion with confirmation step.
   - Graceful fallback if no pets remain (encourages opening Onboarding Wizard).
4. **Weight Tracking & Health Timeline Preview**:
   - Display current weight and visual progress/timeline (e.g., target weight vs current weight).
   - Medical milestones: Rabies vaccine status, internal parasite treatment check.
5. **Mobile & RTL Optimization**:
   - 44px minimum tap targets, Persian numbers formatting, Vazirmatn font, iOS smooth corners.

---

## 2. File Announcement
- **Files to Modify**:
  - `apps/web/src/context/pet-context.tsx`: Implement `updatePet` and `deletePet`.
  - `apps/web/src/app/dashboard/pets/page.tsx`: Add Edit Pet Modal, Delete confirmation, Weight & Health milestone card.
- **Files to Create**:
  - None required; reuse existing UI primitives and context.

---

## 3. Dependencies & Backend Status
- Frontend state managed via `PetContext`.
- Backend endpoints for Pet CRUD (`POST/PUT/DELETE /api/v1/pets`) are pending in FastAPI (Task 3.2).
- Frontend boundary is clean and ready for contract binding.

---

## 4. Acceptance Criteria
- [ ] `updatePet` successfully mutates state and updates UI immediately.
- [ ] `deletePet` deletes active pet and switches activePet to remaining pet.
- [ ] Edit modal opens and closes cleanly, updating fields.
- [ ] No typecheck errors (`pnpm --filter web typecheck`).
- [ ] Production build succeeds (`pnpm --filter web build`).
