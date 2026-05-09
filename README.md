# Hovaluxe Store Frontend

Production-ready React + Tailwind storefront and admin panel for Hovaluxe.

## Features
- Luxury fragrance storefront inspired by the portfolio-style landing experience
- Sticky header with centered storefront presentation
- Cart and checkout modal
- WhatsApp order handoff
- Flutterwave checkout integration
- Google-gated admin access visibility using `VITE_GOOGLE_CLIENT_ID` and `VITE_ADMIN_EMAIL`
- Admin login, product management, order tracking, and WhatsApp sales recording
- Product gallery support with up to 4 images per item
- Store configuration panel for delivery fee and business contact details

## Quick start
1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE_URL`
3. Set `VITE_GOOGLE_CLIENT_ID`
4. Set `VITE_ADMIN_EMAIL` to the Google email allowed to reveal admin access
5. Run `npm install`
6. Run `npm run dev`

## Notes
- The admin menu entry only appears after the allowed Google account signs in.
- The existing backend admin login is still used to authorize dashboard API requests.
- Product payloads now send both `image` and `images` so older backends can keep using the first image while newer ones can store the full gallery.
