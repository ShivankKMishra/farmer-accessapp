# Farmer Access Platform

A comprehensive web platform for farmers providing marketplace, community forum, weather updates, and farm management tools.

## Features

- User authentication with both username/password and phone number
- Marketplace for buying and selling agricultural products
- Community forum for discussions and knowledge sharing
- Farm management tools for tracking crops and expenses
- Weather updates and agricultural recommendations
- Bidding system for bulk crop sales

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/ShivankKMishra/farmer-accessapp.git
   cd farmer-accessapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the environment file and fill in your values:
   ```
   cp .env.development .env
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The application will be available at http://localhost:5000

## Deployment to Vercel

This project is configured for seamless deployment to Vercel.

### Steps for Deployment

1. Push your code to GitHub:
   ```
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Import your project in the Vercel dashboard

3. Configure the following environment variables in the Vercel dashboard:
   - `JWT_SECRET` - Secret key for JWT authentication
   - `FIREBASE_API_KEY` - Firebase API key
   - `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
   - `FIREBASE_PROJECT_ID` - Firebase project ID
   - `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
   - `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
   - `FIREBASE_APP_ID` - Firebase app ID
   - `WEATHER_API_KEY` - API key for weather data

4. Deploy the project

## Project Structure

- `/api` - Serverless API functions for Vercel deployment
- `/client` - React frontend application
- `/server` - Express server for local development
- `/shared` - Shared TypeScript types and schemas

## License

[MIT](LICENSE)