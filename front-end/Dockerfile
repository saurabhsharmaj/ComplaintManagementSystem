# # Stage 1 - Build
# FROM node:18-alpine as build
# WORKDIR /app
# COPY . .
# RUN npm install --force
# ARG VITE_API_BASE_URL
# ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# RUN npm run build 

# # Stage 2 - Serve with nginx
# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
# Stage 1 - Build
# Stage 1 - Build
FROM node:18-alpine as build
WORKDIR /app

# Copy everything including .env.production
COPY . .

RUN npm install --force

# If your file is named .env.production, you can rename or copy it
RUN cp .env.production .env

RUN npm run build

# Stage 2 - Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
