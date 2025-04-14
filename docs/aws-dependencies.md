# AWS Dependencies and Configuration Requirements

## Overview
This document tracks all AWS services, configurations, and dependencies required for the Compare TV Shows application.

## Required AWS Services

### 1. AWS Lambda
- **Purpose**: Secure proxy for TMDB API calls
- **Configuration**: Node.js runtime, environment variables for API key
- **Security**: IAM role with minimal permissions
- **Free Tier Limits**: 1M free requests per month, 400,000 GB-seconds of compute time per month

### 2. Amazon S3
- **Purpose**: Static website hosting
- **Configuration**: Website hosting enabled, proper CORS settings
- **Security**: Block public access settings configured appropriately
- **Free Tier Limits**: 5GB storage, 20,000 GET requests, 2,000 PUT requests per month

### 3. Amazon CloudFront
- **Purpose**: Content delivery and HTTPS support
- **Configuration**: S3 origin, custom domain, SSL certificate
- **Security**: Restrict S3 bucket access to CloudFront only
- **Free Tier Limits**: 50GB data transfer out, 2M HTTP/HTTPS requests per month

### 4. Route 53
- **Purpose**: DNS management for compare.my.useless.blog
- **Configuration**: A records pointing to CloudFront distribution
- **Security**: DNSSEC if needed
- **Free Tier Limits**: Not included in free tier, approximately $0.50 per hosted zone per month

### 5. AWS Certificate Manager
- **Purpose**: SSL certificate for compare.my.useless.blog
- **Configuration**: Domain validation
- **Security**: Auto-renewal enabled
- **Free Tier Limits**: Public certificates are free

## Configuration Requirements

### Lambda Function Configuration
- **Runtime**: Node.js 18.x
- **Memory**: 128MB (increase if needed)
- **Timeout**: 10 seconds
- **Environment Variables**:
  - `TMDB_API_KEY`: The TMDB API key
  - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

### S3 Bucket Configuration
- **Bucket Policy**: Allow CloudFront access only
- **CORS Configuration**: Allow requests from compare.my.useless.blog
- **Website Configuration**: Enable static website hosting
- **Error Document**: Set to index.html for SPA routing

### CloudFront Configuration
- **Origin**: S3 bucket
- **Behaviors**: Default cache behavior with compression
- **SSL Certificate**: ACM certificate for compare.my.useless.blog
- **Custom Domain**: compare.my.useless.blog
- **Error Pages**: Custom error responses for SPA routing

### Route 53 Configuration
- **Hosted Zone**: my.useless.blog
- **Record**: A record for compare.my.useless.blog pointing to CloudFront distribution

## Security Requirements

### API Key Protection
- TMDB API key must be stored as an environment variable in Lambda
- Never expose the API key in frontend code or repositories

### CORS Configuration
- Lambda function must implement proper CORS headers
- Only allow requests from approved origins

### Content Security Policy
- Implement CSP headers to prevent XSS attacks
- Allow only necessary sources for scripts, styles, and images

### S3 Bucket Security
- Block public access except through CloudFront
- Implement least privilege IAM policies

## Deployment Dependencies

### CI/CD Pipeline
- GitHub Actions workflow for automated deployment
- IAM user with deployment permissions

### Deployment Scripts
- Scripts for deploying Lambda function
- Scripts for syncing S3 bucket
- Scripts for invalidating CloudFront cache

## Cost Considerations

### Free Tier Usage
- Most services fall within AWS Free Tier limits for expected traffic
- Route 53 is not included in free tier ($0.50/month per hosted zone)

### Cost Optimization
- Set appropriate CloudFront TTLs to reduce origin requests
- Optimize Lambda function to minimize execution time
- Monitor usage to stay within free tier limits

## Monitoring and Maintenance

### CloudWatch Alarms
- Set up alarms for Lambda errors
- Monitor API usage to prevent exceeding TMDB rate limits

### Regular Maintenance
- Check for SSL certificate renewal
- Update dependencies regularly
- Review security configurations
