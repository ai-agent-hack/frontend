# Google Maps Integration Setup

This project includes a Google Maps integration with interactive pins using `@react-google-maps/api`. Follow these steps to set it up:

## Prerequisites

1. **Google Maps API Key**: You need a Google Maps JavaScript API key.
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

## Setup Instructions

1. **Install Dependencies** (already done):
   ```bash
   bun add @react-google-maps/api
   bun add -D @types/google.maps
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Run the Development Server**:
   ```bash
   bun dev
   ```

## Features

- **Interactive Map**: Displays a Google Map using `@react-google-maps/api` React wrapper
- **Multiple Pins**: Shows 8 different locations across the US with custom styled markers
- **Info Windows**: Click on any pin to see details about the location
- **Responsive Design**: Map adapts to different screen sizes
- **Error Handling**: Graceful error handling for API issues and missing keys
- **Loading State**: Shows loading indicator while map initializes
- **Modern React**: Uses React hooks and functional components
- **TypeScript Support**: Full type safety with Google Maps types

## Why @react-google-maps/api?

This implementation uses `@react-google-maps/api` instead of the vanilla Google Maps JavaScript API because:

- **React-friendly**: Designed specifically for React applications
- **Component-based**: Uses familiar React component patterns
- **Better performance**: Optimized for React's rendering cycle
- **Easier state management**: Integrates seamlessly with React state
- **TypeScript support**: Better type definitions and developer experience
- **Declarative**: Write maps the React way with JSX

## Customization

### Adding New Pins

Edit `src/data/mapData.ts` to add more pins:

```typescript
export const samplePins = [
  // Add your new pin
  {
    id: 'unique-id',
    position: { lat: 40.7128, lng: -74.0060 },
    title: 'New York City',
    description: 'The Big Apple'
  },
  // ... existing pins
];
```

### Changing Map Center and Zoom

In `src/app/page.tsx`, modify the GoogleMap component props:

```tsx
<GoogleMap
  apiKey={GOOGLE_MAPS_API_KEY}
  center={{ lat: 37.7749, lng: -122.4194 }} // San Francisco
  zoom={10} // Closer zoom level
  pins={samplePins}
  className="w-full h-full shadow-lg"
/>
```

### Styling the Map

The map component accepts a `className` prop for custom styling. You can also modify the inline styles in the component.

## Troubleshooting

1. **Map not loading**: Check your API key in `.env.local`
2. **"For development purposes only" watermark**: Your API key needs billing enabled
3. **Pins not showing**: Verify the coordinates in `mapData.ts`

## Security Notes

- Never commit your actual API key to version control
- Use domain restrictions on your API key in production
- Consider implementing usage quotas to control costs
