# Name the node stage "builder"
FROM node:16 AS builder

ARG PORT
# NODE_ENV = dev, prod
ARG NODE_ENV

ARG JUSPAY_SECRET_KEY_PATH
ARG JUSPAY_BASE_URL
ARG JUSPAY_MERCHANT_ID
ARG JUSPAY_API_KEY
ARG RSP_URI
ARG RSP_ID
ARG JUSPAY_WEBHOOK_USERNAME
ARG JUSPAY_WEBHOOK_PASSWORD
ARG WIL_API_KEY

ARG FIREBASE_ADMIN_SERVICE_ACCOUNT

ARG ONDC_BASE_API_URL

ARG DOMAIN
ARG CITY
ARG COUNTRY

ARG BAP_ID
ARG BAP_URL

ARG PROTOCOL_BASE_URL

ARG DB_CONNECTION_STRING

ARG BAP_PRIVATE_KEY
ARG BAP_PUBLIC_KEY
ARG BAP_UNIQUE_KEY_ID
ARG REGISTRY_BASE_URL
ARG ENV_TYPE
ARG BAP_FINDER_FEE_TYPE
ARG BAP_FINDER_FEE_AMOUNT
ARG SSE_TIMEOUT
ARG MMI_CLIENT_SECRET
ARG MMI_CLIENT_ID
ARG MAP_API_KEY


ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG S3_VERSION
ARG S3_REGION
ARG S3_BUCKET

ARG RAZORPAY_KEY_SECRET
ARG RAZORPAY_KEY_ID

ENV AWS_ACCESS_KEY_ID ${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}
ENV S3_VERSION ${S3_VERSION}
ENV S3_REGION ${S3_REGION}
ENV S3_BUCKET ${S3_BUCKET}


ENV PORT ${PORT}
ENV NODE_ENV ${NODE_ENV}

ENV MMI_CLIENT_ID ${MMI_CLIENT_ID}
ENV MMI_CLIENT_SECRET ${MMI_CLIENT_SECRET}
ENV JUSPAY_SECRET_KEY_PATH ${JUSPAY_SECRET_KEY_PATH}
ENV JUSPAY_BASE_URL ${JUSPAY_BASE_URL}
ENV JUSPAY_MERCHANT_ID ${JUSPAY_MERCHANT_ID}
ENV JUSPAY_API_KEY ${JUSPAY_API_KEY}
ENV JUSPAY_WEBHOOK_USERNAME ${JUSPAY_WEBHOOK_USERNAME}
ENV JUSPAY_WEBHOOK_PASSWORD ${JUSPAY_WEBHOOK_PASSWORD}

ENV FIREBASE_ADMIN_SERVICE_ACCOUNT ${FIREBASE_ADMIN_SERVICE_ACCOUNT}

ENV ONDC_BASE_API_URL ${ONDC_BASE_API_URL}

ENV DOMAIN ${DOMAIN}
ENV CITY ${CITY}
ENV COUNTRY ${COUNTRY}
ENV BAP_ID ${BAP_ID}
ENV BAP_URL ${BAP_URL}
ENV PROTOCOL_BASE_URL ${PROTOCOL_BASE_URL}

ENV DB_CONNECTION_STRING ${DB_CONNECTION_STRING}

ENV BAP_PRIVATE_KEY ${BAP_PRIVATE_KEY}
ENV BAP_PUBLIC_KEY ${BAP_PUBLIC_KEY}
ENV BAP_UNIQUE_KEY_ID ${BAP_UNIQUE_KEY_ID}
ENV REGISTRY_BASE_URL ${REGISTRY_BASE_URL}
ENV ENV_TYPE ${ENV_TYPE}

ENV BAP_FINDER_FEE_TYPE ${BAP_FINDER_FEE_TYPE}
ENV BAP_FINDER_FEE_AMOUNT ${BAP_FINDER_FEE_AMOUNT}
ENV SSE_TIMEOUT ${SSE_TIMEOUT}
ENV RAZORPAY_KEY_SECRET ${RAZORPAY_KEY_SECRET}
ENV RAZORPAY_KEY_ID ${RAZORPAY_KEY_ID}
ENV MAP_API_KEY ${MAP_API_KEY}
ENV RSP_URI ${RSP_URI}
ENV RSP_ID ${RSP_ID}
ENV WIL_API_KEY ${WIL_API_KEY}
# Set working directory
WORKDIR /build
COPY package*.json yarn.lock ./

# install node modules
RUN yarn

# Copy all files from current directory to working dir in image
COPY . .
CMD [ "yarn", "start" ]
