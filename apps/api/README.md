# Doc-Hero API

A powerful PDF processing service that provides tools for PDF manipulation including merge, split, convert, compress, and delete pages operations.

## 📋 About

Doc-Hero is a comprehensive PDF processing API built with Node.js, TypeScript, and Express. It supports multiple file formats and provides various PDF operations through a RESTful API.

### Features

- **File Conversion**: Convert images (JPG, PNG) and Office documents (DOCX, DOC, PPTX, PPT, XLSX, XLS) to PDF
- **PDF Operations**: Merge, split, compress, and delete pages from PDF documents
- **File Upload**: Secure file upload with S3 integration
- **Multiple Formats**: Support for various input and output formats
- **Cloud Storage**: AWS S3 integration with presigned URLs
- **Security**: File size limits, type validation, and secure file handling

## 🏗️ Folder Structure

```
apps/api/
├── src/
│   ├── __tests__/              # Test files
│   │   ├── unit/               # Unit tests
│   │   ├── integration/        # Integration tests
│   │   ├── mocks/              # Test fixtures
│   │   └── setup.ts            # Test setup
│   ├── configs/                # Configuration files
│   ├── helpers/                # Utility functions
│   │   ├── api.ts              # API response helpers
│   │   └── security.ts         # Security utilities
│   ├── lib/                    # External service integrations
│   │   ├── aws/                # AWS S3 integration
│   │   ├── ghostscript/        # Ghostscript integration
│   │   ├── soffice/            # LibreOffice integration
│   │   └── multer/             # File upload handling
│   ├── middleware/             # Express middleware
│   │   ├── authorization.ts    # JWT authentication
│   │   ├── fileUploader.ts    # File upload middleware
│   │   └── validateInput.ts   # Input validation
│   ├── plugins/               # Express plugins
│   │   ├── cors.ts            # CORS configuration
│   │   ├── helmet.ts          # Security headers
│   │   ├── swagger.ts         # API documentation
│   │   └── winston.ts         # Logging
│   └── v1/                     # API version 1
│       ├── docs/              # Swagger documentation
│       ├── routes.ts          # Route definitions
│       └── services/          # Business logic
│           ├── convert/       # File conversion service
│           ├── core/          # PDF operations service
│           └── file/          # File upload service
├── Dockerfile                 # Docker configuration
├── jest.config.ts            # Jest test configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🚀 Prerequisites

### System Requirements

- **Node.js** (v20 or higher)
- **npm**
- **Docker** (for containerized deployment)

### External Dependencies

- **AWS CLI** - For AWS S3 integration
- **Ghostscript** - For PDF compression
- **LibreOffice (soffice)** - For Office document conversion

### Installation

#### AWS CLI
```bash
# macOS
brew install awscli

# Ubuntu/Debian
sudo apt-get install awscli

# Windows
# Download from: https://aws.amazon.com/cli/
```

#### Ghostscript
```bash
# macOS
brew install ghostscript

# Ubuntu/Debian
sudo apt-get install ghostscript

# Windows
# Download from: https://www.ghostscript.com/download/gsdnld.html
```

#### LibreOffice
```bash
# macOS
brew install --cask libreoffice

# Ubuntu/Debian
sudo apt-get install libreoffice

# Windows
# Download from: https://www.libreoffice.org/download/download/
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
BUCKET_NAME=s3-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

## 🐳 Docker

### Build Image

```bash
docker build -t doc-hero-api .
```

### Run Container

```bash
docker run -e AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
 -e AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
 -e AWS_REGION=us-east-1 \
 -e BUCKET_NAME=<BUCKET_NAME> \
 -p 8080:8080 \
 doc-hero-api
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd doc-hero/apps/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm start
```

### 5. Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# All tests
npm run test:all

# Test coverage
npm run test:coverage
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/v1
```

### Swagger Documentation

Once the server is running, visit:
```
http://localhost:8080/api-docs
```

## 🧪 Testing

### Test Structure

- **Unit Tests**: Test individual functions and services
- **Integration Tests**: Test API endpoints end-to-end
- **Mock Files**: Real test files for integration testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test convert.service.test.ts

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run eslint

# Fix linting issues
npm run eslint:fix

# Format code
npm run format
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:
- ESLint checking
- Prettier formatting
- Type checking

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set in production:

```bash
export PORT=8080
export AWS_REGION=us-east-1
export BUCKET_NAME=your-production-bucket
export AWS_ACCESS_KEY_ID=your-production-key
export AWS_SECRET_ACCESS_KEY=your-production-secret
```

### Docker Deployment

```bash
# Build production image
docker build -t doc-hero-api:latest .

# Run production container
docker run -d \
  --name doc-hero-api \
  -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID=<key> \
  -e AWS_SECRET_ACCESS_KEY=<secret> \
  -e AWS_REGION=us-east-1 \
  -e BUCKET_NAME=<bucket> \
  doc-hero-api:latest
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run start:dev` | Start development server |
| `npm run build` | Build TypeScript |
| `npm test` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run eslint` | Lint code |
| `npm run eslint:fix` | Fix linting issues |
| `npm run format` | Format code |
