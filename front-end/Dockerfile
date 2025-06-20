# Step 1: Accept build arg
ARG VITE_API_BASE_URL

FROM node:18-alpine AS build
WORKDIR /app

# Step 2: Copy code and inject Vite env
COPY . .

# Step 3: Write the environment variable into Vite env file
ARG VITE_API_BASE_URL
RUN echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env.production

# Step 4: Install and build
RUN npm install --force
RUN npm run build

# Step 5: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
