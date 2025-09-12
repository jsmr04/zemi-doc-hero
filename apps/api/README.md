## Docker

### Build

`docker build -t doc-hero-api .`

### Run

`docker run -e AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
 -e AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
 -e AWS_REGION=us-east-1 \
 -p 8080:8080 \
doc-hero-api````
`
