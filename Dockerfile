# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Build arguments for React environment variables
ARG REACT_APP_API_URL=http://localhost:5000
ARG REACT_APP_USER_NAME=
ARG REACT_APP_SCROLL_INTERVAL=5
ARG REACT_APP_REFRESH_INTERVAL=300

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_USER_NAME=$REACT_APP_USER_NAME
ENV REACT_APP_SCROLL_INTERVAL=$REACT_APP_SCROLL_INTERVAL
ENV REACT_APP_REFRESH_INTERVAL=$REACT_APP_REFRESH_INTERVAL

# Copy package files
COPY package.json ./

# Install dependencies (regenerate lockfile if needed)
RUN yarn install

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
