# Anki Scroller

Beautiful scrolling display for Anki flashcards. Fetches cards from anki-notifications API and displays them in an auto-scrolling carousel with smooth animations.

## Features

- **Auto-scrolling carousel** - Displays flashcards with smooth transitions
- **Configurable intervals** - Customize scroll and refresh timing
- **Responsive design** - Works on desktop and mobile
- **Modern React** - Built with React 18 and react-spring animations
- **Production ready** - Optimized build with nginx

## Quick Start

### With Docker (Recommended)

```bash
docker build \
  --build-arg REACT_APP_API_URL=http://your-api:5000 \
  --build-arg REACT_APP_USER_NAME=your_username \
  -t anki-scroller .

docker run -d -p 3000:80 anki-scroller
```

Access at http://localhost:3000

### Local Development

```bash
# Install dependencies
yarn install

# Create environment file
cp .env.example .env
vim .env  # Edit with your settings

# Start development server
yarn start
```

Development server runs at http://localhost:3000

## Configuration

Configure via environment variables (`.env` for development, build args for Docker):

### Environment Variables

**`REACT_APP_API_URL`** (required)
- API endpoint for fetching card data
- Default: `http://localhost:5000`
- Example: `http://192.168.11.35:5000`

**`REACT_APP_USER_NAME`** (optional)
- Username to fetch cards for
- If not set, uses first user from API response
- Example: `kieran`

**`REACT_APP_SCROLL_INTERVAL`** (optional)
- Seconds between card rotations
- Default: `5`
- Lower = faster scrolling

**`REACT_APP_REFRESH_INTERVAL`** (optional)
- Seconds between API refreshes
- Default: `300` (5 minutes)
- How often to fetch new card data

### Example .env File

```bash
REACT_APP_API_URL=http://192.168.11.35:5000
REACT_APP_USER_NAME=kieran
REACT_APP_SCROLL_INTERVAL=5
REACT_APP_REFRESH_INTERVAL=300
```

## Docker Build Arguments

When building the Docker image, pass configuration as build arguments:

```bash
docker build \
  --build-arg REACT_APP_API_URL=http://anki-api:5000 \
  --build-arg REACT_APP_USER_NAME=kieran \
  --build-arg REACT_APP_SCROLL_INTERVAL=5 \
  --build-arg REACT_APP_REFRESH_INTERVAL=300 \
  -t anki-scroller .
```

Build arguments are baked into the production build.

## Usage with anki-notifications

This app requires the [anki-notifications](../anki-notifications) API to be running.

### Using docker-compose

Both apps are configured in the main `docker-compose.yml`:

```yaml
services:
  anki-api:
    build: ./anki-notifications
    ports:
      - "5000:5000"

  anki-scroller:
    build:
      context: ./anki-scroller
      args:
        - REACT_APP_API_URL=http://anki-api:5000
        - REACT_APP_USER_NAME=kieran
    ports:
      - "3000:80"
    depends_on:
      - anki-api
```

Start both:
```bash
docker-compose up -d
```

## How It Works

1. **Fetches card data** from API on load and every `REFRESH_INTERVAL` seconds
2. **Displays cards** in a stacked layout with smooth animations
3. **Rotates cards** every `SCROLL_INTERVAL` seconds by moving bottom card to top
4. **Shows countdown** timer indicating time until next refresh

### Card Display

Cards show:
- **First field** (usually the word/question) as heading
- **Remaining fields** (definition, examples, etc.) as content
- **HTML rendering** for formatted content (bold, italic, etc.)
- **Image stripping** - Images are removed from display

## Customization

### Styling

Edit `src/App.css` to customize appearance:

```css
.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Your custom styles */
}
```

### Animation Settings

Modify animation in `src/App.js`:

```javascript
const transitions = useTransition(
  cards.map(data => ({ ...data, y: (height += data.height) - data.height })),
  {
    from: { height: 0, opacity: 1 },
    enter: ({ y, height }) => ({ y, height, opacity: 1 }),
    // Customize transitions here
  }
);
```

## Production Deployment

### Build Static Files

```bash
yarn build
```

Outputs optimized production build to `build/` directory.

### Deploy with nginx

The Docker image uses nginx for serving:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Behind Reverse Proxy

To use behind a reverse proxy (traefik, nginx proxy manager, etc.):

```nginx
location /anki {
    proxy_pass http://anki-scroller:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Remember to update `REACT_APP_API_URL` to full path if API is also behind proxy.

## Troubleshooting

### Cards not loading

1. Check API is accessible: `curl http://your-api:5000`
2. Check browser console for CORS errors
3. Verify `REACT_APP_API_URL` is correct
4. Ensure API returns data for the configured user

### CORS errors

The anki-notifications API has CORS enabled. If you still see errors:
- Check API logs
- Verify API is accessible from browser's network
- Try accessing API directly in browser

### Build fails

1. Delete `node_modules` and `yarn.lock`
2. Run `yarn install` again
3. Ensure Node.js version 18+

### Images showing incorrectly

Images are stripped by default. To show images, edit `src/App.js`:

```javascript
// Remove this line:
fields: card.map(x => x.replace(/<img .*?>/g, ""))

// Replace with:
fields: card
```

## Development

### Project Structure

```
anki-scroller/
├── public/          # Static assets
├── src/
│   ├── App.js       # Main component
│   ├── App.css      # Styles
│   └── index.js     # Entry point
├── package.json     # Dependencies
├── Dockerfile       # Docker build
└── nginx.conf       # Nginx config
```

### Available Scripts

**`yarn start`** - Development server with hot reload

**`yarn build`** - Production build

**`yarn test`** - Run tests (if configured)

### Adding Features

Common enhancements:

1. **Click to flip cards** - Show back side on click
2. **Keyboard controls** - Navigate with arrow keys
3. **Favorites** - Mark and save favorite cards
4. **Statistics** - Track review progress
5. **Themes** - Dark mode, color schemes

## Requirements

- Node.js 18+
- Yarn or npm
- anki-notifications API running

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Optimized bundle** - ~200KB gzipped
- **Lazy loading** - Code splitting for faster load
- **Nginx caching** - Static assets cached for 1 year
- **Resource hints** - Preconnect to API endpoint

## License

MIT

## Related Projects

- [anki-notifications](../anki-notifications) - Backend API for card data
- [react-spring](https://www.react-spring.dev/) - Animation library
