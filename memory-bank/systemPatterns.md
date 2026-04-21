# System Patterns

## Architecture
- **Monorepo Structure** with `/client` (Next.js) and `/server` (Express)
- RESTful API with `/api/v1/` prefix
- JWT authentication with refresh tokens
- Role-based access control (RBAC): Patient, Doctor, Admin

## Design Patterns
- **Repository Pattern** - Data access layer abstracted from controllers
- **Middleware Chain** - Auth, validation, error handling as middleware
- **Component Composition** - Reusable React components with prop drilling / context
- **Observer Pattern** - Socket.io events for real-time updates

## Component Relationships
```
Client (Next.js) ←→ API (Express) ←→ Database (MongoDB)
                    ↕
              Socket.io (Real-time)
                    ↕
              WebRTC (Video)
```

## Key Technical Decisions
1. Next.js App Router for SSR and SEO benefits
2. Mongoose for MongoDB ODM with validation
3. Socket.io for reliable WebSocket communication
4. WebRTC with Simple-peer for video consultations
5. JWT stored in httpOnly cookies for security
6. Tailwind CSS for utility-first styling
7. React Context for global state management
8. PDFKit for prescription PDF generation

## Critical Implementation Paths
1. Auth flow: Register → Login → JWT → Protected Routes
2. Booking flow: Search → Select Doctor → Pick Slot → Pay → Confirm
3. Consultation flow: Appointment → Join Chat/Video → Consult → Prescription
4. Medicine flow: Prescription → Add to Cart → Checkout → Payment → Order