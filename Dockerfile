FROM node:20-alpine AS build

WORKDIR /app

COPY Autopay-frontend/package*.json ./
RUN npm install --no-audit --no-fund

COPY Autopay-frontend/ ./

ARG REACT_APP_API_URL=http://localhost:5000/api/v1
ARG REACT_APP_SOCKET_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY Autopay-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
