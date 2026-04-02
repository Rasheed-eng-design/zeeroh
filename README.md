# Zeeroh - Event Ticketing Platform

A modern, full-stack event ticketing and management platform built with Next.js 14, optimized for the Nigerian market.

## Features

### For Attendees
- Browse and discover events with advanced filtering
- Secure ticket purchasing with Paystack integration
- Digital QR code tickets delivered via email and WhatsApp
- Mobile-first responsive design
- User authentication and ticket history

### For Organizers
- Create and manage events with multiple ticket types
- Track ticket sales and revenue in real-time
- Event approval workflow
- Dashboard with analytics

### For Admins
- User management
- Event approval/rejection system
- Platform analytics and revenue tracking
- Featured events management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Payment**: Paystack Inline JS
- **Styling**: Tailwind CSS + shadcn/ui components
- **Notifications**: Resend (Email) + Twilio (WhatsApp)
- **QR Codes**: qrcode library

## Project Structure

```
zeeroh/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx              # Home page
│   │   ├── events/
│   │   │   ├── page.tsx          # Events listing
│   │   │   └── [id]/page.tsx     # Event details
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── organizer/
│   │   │   ├── page.tsx          # Organizer dashboard
│   │   │   └── events/create/    # Create event
│   │   └── admin/page.tsx        # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── auth/signup/          # Signup API
│   │   ├── paystack/             # Paystack integration
│   │   └── webhooks/paystack/    # Paystack webhooks
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── events/                   # Event-related components
│   ├── navbar.tsx                # Navigation
│   └── providers.tsx             # Context providers
├── lib/                          # Utility functions
│   ├── actions/                  # Server Actions
│   │   ├── events.ts             # Event actions
│   │   └── tickets.ts            # Ticket actions
│   ├── auth.ts                   # Auth configuration
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Helper functions
├── hooks/                        # Custom React hooks
│   └── use-paystack.ts           # Paystack integration hook
├── prisma/
│   └── schema.prisma             # Database schema
└── types/
    └── next-auth.d.ts            # TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Paystack account (for payments)
- Resend account (for emails)
- Twilio account (for WhatsApp)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zeeroh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zeeroh"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Resend Email
RESEND_API_KEY="re_..."

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key Features Implementation

### Authentication
- Email/password authentication using NextAuth.js
- Role-based access control (Attendee, Organizer, Admin)
- Protected routes with middleware

### Payment Integration
- Paystack Inline JS for secure payments
- Server-side transaction initialization
- Webhook handling for payment confirmation
- Automatic ticket generation after successful payment

### Ticket System
- Multiple ticket types per event (VIP, Regular, etc.)
- QR code generation for each ticket
- Email and WhatsApp delivery
- Ticket validation system (for future check-in)

### Event Management
- Event creation with rich details
- Approval workflow for quality control
- Featured events highlighting
- Category and location filtering

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Setup

For production, use a managed PostgreSQL service like:
- Vercel Postgres
- Supabase
- Railway
- AWS RDS

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Payments
- `POST /api/paystack/initialize` - Initialize payment
- `POST /api/paystack/verify` - Verify payment
- `POST /api/webhooks/paystack` - Paystack webhooks

### Server Actions
- `createEvent` - Create new event
- `getEvents` - Fetch events with filters
- `getEventById` - Get single event details
- `initiateTicketPurchase` - Start ticket purchase
- `verifyPaymentAndCreateTickets` - Complete purchase

## Security Considerations

- All payment processing is server-side
- Webhook signature verification
- CSRF protection via NextAuth
- SQL injection protection via Prisma
- XSS protection via React's built-in escaping

## Future Enhancements

- [ ] QR code scanning for check-in
- [ ] Vendor marketplace (MCs, DJs, etc.)
- [ ] Advanced analytics
- [ ] Subscription plans for organizers
- [ ] White-label event pages
- [ ] In-app messaging
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@zeeroh.ng or join our Slack channel.
