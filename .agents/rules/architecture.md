# Bonyo Architecture Rules

1. **Pet-Profile-First Paradigm**:
   - Every primary commercial activity (browsing, adding to cart, checkout, reorder) connects with the active registered Pet profile.
2. **Context Cohesion**:
   - Keep domain states partitioned (`PetContext`, `CartContext`, `AuthContext`). Do not create duplicated state containers.
3. **Backend Integration Boundary**:
   - Code must interact with well-typed service contracts. If FastAPI endpoints are still queued, provide typed mock clients that mimic actual backend responses without faking business success.
