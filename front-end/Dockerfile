# Step 1: Accept build arg
ARG VITE_API_BASE_URL

FROM node:18-alpine AS build
WORKDIR /app

# Step 2: Build with env from build arg
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env
RUN npm install  --force 
RUN npm run build

# Step 3: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf