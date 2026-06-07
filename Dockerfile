FROM node:20-alpine AS dependencies-env
COPY . /app
WORKDIR /app
RUN yarn install --frozen-lockfile


FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ARG VITE_API_ENDPOINT
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
RUN yarn run build

FROM node:20-alpine
COPY ./package.json yarn.lock /app/
COPY --from=dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
ARG VITE_API_ENDPOINT
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
WORKDIR /app
ENV PORT=8181
CMD ["yarn", "run", "start"]