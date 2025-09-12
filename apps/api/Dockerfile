FROM public.ecr.aws/docker/library/node:20-slim

# Set working directory
WORKDIR /usr/src/app

RUN apt update
RUN apt upgrade -y

# Install Libre Office (soffice)
RUN apt install libreoffice -y
RUN soffice --version

# Install ghostscript
RUN apt install ghostscript -y
RUN gs -v

# Skip Husky
ENV HUSKY=0 
ENV NPM_CONFIG_IGNORE_SCRIPTS=true

# Install dependencies separately to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies by default
RUN npm install

# Copy the rest of the application code
COPY . .

# Build application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Create a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Start the application
CMD [ "node", "dist/index.js" ]
