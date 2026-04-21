# Tech Context

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router, SSR, API routes
- **TypeScript** - Type safety across the codebase
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **Socket.io Client** - Real-time communication
- **Simple-peer** - WebRTC wrapper for video calls
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket server
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload handling
- **PDFKit** - PDF generation for prescriptions
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemailer** - Email sending
- **stripe** - Payment processing

### Database
- **MongoDB** - NoSQL database
- Collections: users, doctors, patients, appointments, prescriptions, messages, orders, reviews, favorites, medicines

## Development Setup
1. Node.js >= 18.x
2. MongoDB running locally or Atlas URI
3. npm for package management
4. Concurrent development with `concurrently`

## Technical Constraints
- JWT tokens expire in 7 days (access), 30 days (refresh)
- File uploads limited to 5MB
- Video calls require WebRTC-compatible browsers
- MongoDB Atlas free tier has storage limits

## Dependencies
- All managed via package.json in client/ and server/
- Shared types potentially in a shared/ directory