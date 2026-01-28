# Fix Frontend Deployment - Rebuild with nginx Reverse Proxy

## Problem
- Frontend is trying to connect to `http://localhost:5000/api/products` (old build)
- Getting CORS errors because it's using hardcoded localhost URLs
- Need to rebuild with relative URLs that use nginx reverse proxy

## Solution Steps

### Step 1: Fix Service Port Mismatch

The service has `targetPort: 3000` but the container exposes port `80`. Fix this:

```bash
# Update the service
kubectl patch svc frontend -n product-catalog -p '{"spec":{"ports":[{"port":80,"targetPort":80,"name":"http"}]}}'

# Or edit manually
kubectl edit svc frontend -n product-catalog
# Change targetPort from 3000 to 80
```

### Step 2: Rebuild Frontend Image

**Option A: Build Locally and Push to ACR**

```bash
# Navigate to frontend directory
cd product-catalog-app/frontend

# Login to ACR
az acr login --name productacr2025

# Build with empty ARGs (for relative URLs)
docker build -t productacr2025.azurecr.io/frontend:latest \
  --build-arg REACT_APP_PRODUCT_API="" \
  --build-arg REACT_APP_RATINGS_API="" .

# Push to ACR
docker push productacr2025.azurecr.io/frontend:latest

# Tag with a version number (optional but recommended)
docker tag productacr2025.azurecr.io/frontend:latest productacr2025.azurecr.io/frontend:59
docker push productacr2025.azurecr.io/frontend:59
```

**Option B: Use Azure Container Registry Build (ACR Build)**

```bash
# Build directly in ACR (no local Docker needed)
az acr build --registry productacr2025 \
  --image frontend:latest \
  --image frontend:59 \
  --build-arg REACT_APP_PRODUCT_API="" \
  --build-arg REACT_APP_RATINGS_API="" \
  ./frontend
```

### Step 3: Update Kubernetes Deployment

```bash
# Update deployment to use new image
kubectl set image deployment/frontend \
  frontend=productacr2025.azurecr.io/frontend:59 \
  -n product-catalog

# Or update to latest tag
kubectl set image deployment/frontend \
  frontend=productacr2025.azurecr.io/frontend:latest \
  -n product-catalog

# Watch the rollout
kubectl rollout status deployment/frontend -n product-catalog

# Check pods are running
kubectl get pods -n product-catalog -l app=frontend
```

### Step 4: Verify Backend Services are ClusterIP

```bash
# Verify services are ClusterIP (not LoadBalancer)
kubectl get svc -n product-catalog

# Should show:
# frontend          LoadBalancer   ✅
# product-service   ClusterIP      ✅
# ratings-service   ClusterIP     ✅
```

### Step 5: Test the Application

```bash
# Get Frontend LoadBalancer IP
FRONTEND_IP=$(kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend: http://$FRONTEND_IP"

# Test Frontend
curl http://$FRONTEND_IP

# Test Product API (through nginx proxy)
curl http://$FRONTEND_IP/api/products

# Test Ratings API (through nginx proxy)
curl http://$FRONTEND_IP/api/ratings
```

### Step 6: Check Pod Logs (if issues)

```bash
# Check frontend pod logs
kubectl logs -n product-catalog -l app=frontend --tail=50

# Check if nginx is proxying correctly
kubectl exec -n product-catalog -it $(kubectl get pod -n product-catalog -l app=frontend -o jsonpath='{.items[0].metadata.name}') -- cat /etc/nginx/conf.d/default.conf

# Test nginx config inside pod
kubectl exec -n product-catalog -it $(kubectl get pod -n product-catalog -l app=frontend -o jsonpath='{.items[0].metadata.name}') -- nginx -t
```

## Quick Fix Script

Save this as `rebuild-frontend.sh`:

```bash
#!/bin/bash

set -e

ACR_NAME="productacr2025"
NAMESPACE="product-catalog"
IMAGE_TAG="59"

echo "Step 1: Building frontend image..."
cd frontend

az acr build --registry $ACR_NAME \
  --image frontend:latest \
  --image frontend:$IMAGE_TAG \
  --build-arg REACT_APP_PRODUCT_API="" \
  --build-arg REACT_APP_RATINGS_API="" \
  .

echo "Step 2: Updating deployment..."
kubectl set image deployment/frontend \
  frontend=$ACR_NAME.azurecr.io/frontend:$IMAGE_TAG \
  -n $NAMESPACE

echo "Step 3: Waiting for rollout..."
kubectl rollout status deployment/frontend -n $NAMESPACE

echo "Step 4: Fixing service port..."
kubectl patch svc frontend -n $NAMESPACE -p '{"spec":{"ports":[{"port":80,"targetPort":80,"name":"http"}]}}'

echo "Step 5: Getting frontend IP..."
FRONTEND_IP=$(kubectl get svc frontend -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "✅ Frontend available at: http://$FRONTEND_IP"
echo "✅ Product API: http://$FRONTEND_IP/api/products"
echo "✅ Ratings API: http://$FRONTEND_IP/api/ratings"

echo "Done! Test in browser: http://$FRONTEND_IP"
```

## Troubleshooting

### Issue: Still seeing localhost:5000 in browser console

**Solution:** Clear browser cache or do hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: 502 Bad Gateway from /api/products

**Check:**
```bash
# Verify backend services are running
kubectl get pods -n product-catalog | grep -E "product-service|ratings-service"

# Check service endpoints
kubectl get endpoints product-service -n product-catalog
kubectl get endpoints ratings-service -n product-catalog

# Test from inside frontend pod
kubectl exec -n product-catalog -it $(kubectl get pod -n product-catalog -l app=frontend -o jsonpath='{.items[0].metadata.name}') -- wget -O- http://product-service:5000/api/products
```

### Issue: CORS errors persist

**Check nginx config:**
```bash
# Verify nginx.conf was copied correctly
kubectl exec -n product-catalog -it $(kubectl get pod -n product-catalog -l app=frontend -o jsonpath='{.items[0].metadata.name}') -- cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api"
```

## Expected Result

After deployment:
- ✅ Frontend loads at `http://4.149.12.165`
- ✅ API calls go to `/api/products` and `/api/ratings` (relative URLs)
- ✅ nginx proxies these to `product-service:5000` and `ratings-service:5001`
- ✅ No CORS errors
- ✅ No localhost URLs in browser console

