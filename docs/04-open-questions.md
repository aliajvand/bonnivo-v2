# Open Questions & Investigation Backlog

## Open Questions

### Q1: Direct Bike-Courier API Integration
- **Topic:** Tehran on-demand delivery pricing estimation.
- **Description:** For the dynamic delivery fee with buffer, will we connect directly to Miare / Alopeyk / SnappBox API in Phase 1, or use a zone-based matrix algorithm with fixed buffer margins for the MVP pilot?
- **Current Recommendation:** Start with a zone/distance matrix algorithm with buffer for the MVP; plug in live courier API once merchant density warrants it.
- **Status:** Open for pilot validation.

### Q2: AI Customer Support Chat Provider
- **Topic:** Online customer support widget.
- **Description:** Which third-party widget or custom LLM endpoint will be used for the AI customer chat (e.g., Raychat, Crisp, or an embedded Bonyo FastAPI streaming endpoint)?
- **Current Recommendation:** Provide an embedded lightweight chat drawer in Next.js backed by FastAPI / Claude or OpenAI API with fallback to phone number.
- **Status:** Architecture ready.

### Q3: Image Hosting & S3 Compatibility
- **Topic:** Catalog and user health-book photos.
- **Description:** Will we use an Iranian S3-compatible provider (such as ArvanCloud / Parspack Object Storage) or local volume storage mounted via Docker in early pilot?
- **Current Recommendation:** Build with standard MinIO / S3 SDK abstraction so storage can point to local Docker MinIO in dev and ArvanCloud S3 in staging/production.
- **Status:** Architecture confirmed.
