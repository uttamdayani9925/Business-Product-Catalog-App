# Options to Expose Services in AKS

## 🎯 **SOLUTION: Connect Backend Services Through Frontend (Only 2 LoadBalancers Needed)**

**Problem:** You have only 2 LoadBalancer quota, and you're already using them for Frontend + ArgoCD.  
**Solution:** Use nginx reverse proxy in Frontend to route API requests to backend services (ClusterIP).  
**Result:** All traffic goes through Frontend LoadBalancer - no additional LoadBalancers needed!

### How It Works

1. **Frontend LoadBalancer** (port 80) - Already working ✅
2. **ArgoCD LoadBalancer** (port 443) - Already working ✅
3. **Backend Services** (Product & Ratings) - Stay as **ClusterIP** (internal only)
4. **nginx in Frontend** proxies `/api/products` → `product-service:5000` and `/api/ratings` → `ratings-service:5001`
5. **Frontend React app** uses relative URLs (`/api/products`, `/api/ratings`) instead of full URLs

**Architecture:**
```
Browser → Frontend LoadBalancer (4.149.12.165:80)
           ↓
         nginx (in Frontend container)
           ├─ / → Frontend React App
           ├─ /api/products → product-service:5000 (ClusterIP)
           └─ /api/ratings → ratings-service:5001 (ClusterIP)
```

---

## ✅ **IMPLEMENTATION STEPS (Already Done in Code)**

The following changes have been made to implement this solution:

### 1. ✅ Updated `frontend/nginx.conf`
- Added reverse proxy rules for `/api/products` → `product-service:5000`
- Added reverse proxy rules for `/api/ratings` → `ratings-service:5001`
- Added CORS headers for API requests

### 2. ✅ Updated Frontend React Code
- `App.js`: Changed to use relative URLs (`/api/products`)
- `ProductDetail.js`: Updated to use relative URLs
- `RatingForm.js`: Updated to use relative URLs

### 3. ✅ Backend Services Configuration
- `product-service`: Stays as **ClusterIP** (no LoadBalancer needed)
- `ratings-service`: Stays as **ClusterIP** (no LoadBalancer needed)

---

## 🚀 **DEPLOYMENT STEPS**

### Step 1: Verify Backend Services are ClusterIP

```bash
# Check service types
kubectl get svc -n product-catalog

# Should show:
# frontend          LoadBalancer   ✅
# product-service   ClusterIP      ✅ (correct - no LoadBalancer)
# ratings-service   ClusterIP      ✅ (correct - no LoadBalancer)
```

### Step 2: Rebuild and Push Frontend Image

The frontend code has been updated. You need to rebuild the Docker image:

```bash
cd product-catalog-app/frontend

# Build new image with updated nginx.conf and React code
docker build -t productacr2025.azurecr.io/frontend:latest \
  --build-arg REACT_APP_PRODUCT_SERVICE_URL="" \
  --build-arg REACT_APP_RATINGS_SERVICE_URL="" .

# Push to ACR
az acr login --name productacr2025
docker push productacr2025.azurecr.io/frontend:latest
```

### Step 3: Update Frontend Deployment

```bash
# Update the frontend deployment to use the new image
kubectl set image deployment/frontend \
  frontend=productacr2025.azurecr.io/frontend:latest \
  -n product-catalog

# Wait for rollout
kubectl rollout status deployment/frontend -n product-catalog
```

### Step 4: Verify Everything Works

```bash
# Get Frontend LoadBalancer IP
FRONTEND_IP=$(kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend: http://$FRONTEND_IP"

# Test Frontend
curl http://$FRONTEND_IP

# Test Product API (through Frontend proxy)
curl http://$FRONTEND_IP/api/products

# Test Ratings API (through Frontend proxy)
curl http://$FRONTEND_IP/api/ratings
```

### Step 5: Access ArgoCD (if not already exposed)

```bash
# Check ArgoCD service
kubectl get svc argocd-server -n argocd

# If it's ClusterIP, expose it
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Wait for IP
kubectl get svc argocd-server -n argocd -w

# Get ArgoCD IP
ARGOCD_IP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "ArgoCD: https://$ARGOCD_IP"

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

---

## 📋 **FINAL CONFIGURATION**

**LoadBalancers Used:** 2 (Frontend + ArgoCD) ✅  
**LoadBalancer Quota:** 2 ✅  
**Status:** Perfect match!

**Service Types:**
- ✅ `frontend`: LoadBalancer (External IP: `4.149.12.165`)
- ✅ `argocd-server`: LoadBalancer (External IP: `<ARGOCD_IP>`)
- ✅ `product-service`: ClusterIP (routed through Frontend)
- ✅ `ratings-service`: ClusterIP (routed through Frontend)

**Access URLs:**
- **Frontend**: `http://4.149.12.165`
- **Product API**: `http://4.149.12.165/api/products` (proxied through Frontend)
- **Ratings API**: `http://4.149.12.165/api/ratings` (proxied through Frontend)
- **ArgoCD**: `https://<ARGOCD_IP>`

---

## 🔍 **TROUBLESHOOTING**

### Issue: API requests return 502 Bad Gateway

**Check:**
```bash
# Verify backend services are running
kubectl get pods -n product-catalog | grep -E "product-service|ratings-service"

# Check service endpoints
kubectl get endpoints product-service -n product-catalog
kubectl get endpoints ratings-service -n product-catalog

# Check nginx logs in frontend pod
kubectl logs -n product-catalog -l app=frontend --tail=50
```

### Issue: CORS errors in browser

The nginx.conf already includes CORS headers. If you still see errors:
1. Check browser console for exact error
2. Verify nginx.conf was updated correctly
3. Rebuild frontend image

### Issue: Frontend can't reach backend services

**Verify services are in same namespace:**
```bash
kubectl get svc -n product-catalog
# All services should be in 'product-catalog' namespace
```

---

## 💰 **COST SAVINGS**

- **Old Plan:** 4 LoadBalancers = ~$72/month
- **New Plan:** 2 LoadBalancers = ~$36/month
- **Savings:** $36/month (50% reduction!)

---

## 🎯 **OLD PLAN (For Reference - Not Needed Anymore)**

**Since Ingress is not working, this plan uses LoadBalancer for everything.**

### Step-by-Step Execution Plan

#### **Step 1: Check Current Status**

```bash
# Check ArgoCD service status
kubectl get svc argocd-server -n argocd

# Check all services in product-catalog namespace
kubectl get svc -n product-catalog

# Check all LoadBalancers across all namespaces
kubectl get svc --all-namespaces | grep LoadBalancer
```

**Expected Output:**
- ArgoCD: May show `ClusterIP` or `LoadBalancer`
- Frontend: Should show `LoadBalancer` with IP `4.149.12.165`
- Product-service: Shows `ClusterIP`
- Ratings-service: Shows `ClusterIP`

---

#### **Step 2: Expose ArgoCD Server (if not already exposed)**

**Check if ArgoCD already has LoadBalancer:**
```bash
kubectl get svc argocd-server -n argocd -o jsonpath='{.spec.type}'
```

**If it shows `ClusterIP`, expose it:**

```bash
# Patch ArgoCD service to LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Wait for external IP (2-5 minutes)
kubectl get svc argocd-server -n argocd -w
# Press Ctrl+C when you see an IP (not <pending>)

# Get ArgoCD external IP
ARGOCD_IP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "ArgoCD URL: https://$ARGOCD_IP"
```

**Get ArgoCD Admin Password:**
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

**Access ArgoCD:**
- URL: `https://<ARGOCD_IP>` (use the IP from above)
- Username: `admin`
- Password: (from command above)

---

#### **Step 3: Expose Product-Service with LoadBalancer**

**Option A: Patch existing service (Recommended)**
```bash
# Change existing service from ClusterIP to LoadBalancer
kubectl patch svc product-service -n product-catalog -p '{"spec": {"type": "LoadBalancer"}}'

# Wait for external IP
kubectl get svc product-service -n product-catalog -w
# Press Ctrl+C when IP is assigned

# Get the IP
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Product Service: http://$PRODUCT_IP:5000"
```

**Option B: Create new LoadBalancer service (if patch doesn't work)**
```bash
kubectl expose deployment product-service \
  --type=LoadBalancer \
  --port=5000 \
  --target-port=5000 \
  --name=product-service-lb \
  -n product-catalog

# Wait and get IP
kubectl get svc product-service-lb -n product-catalog -w
PRODUCT_IP=$(kubectl get svc product-service-lb -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Product Service: http://$PRODUCT_IP:5000"
```

---

#### **Step 4: Expose Ratings-Service with LoadBalancer**

**Option A: Patch existing service (Recommended)**
```bash
# Change existing service from ClusterIP to LoadBalancer
kubectl patch svc ratings-service -n product-catalog -p '{"spec": {"type": "LoadBalancer"}}'

# Wait for external IP
kubectl get svc ratings-service -n product-catalog -w
# Press Ctrl+C when IP is assigned

# Get the IP
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ratings Service: http://$RATINGS_IP:5001"
```

**Option B: Create new LoadBalancer service (if patch doesn't work)**
```bash
kubectl expose deployment ratings-service \
  --type=LoadBalancer \
  --port=5001 \
  --target-port=5001 \
  --name=ratings-service-lb \
  -n product-catalog

# Wait and get IP
kubectl get svc ratings-service-lb -n product-catalog -w
RATINGS_IP=$(kubectl get svc ratings-service-lb -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ratings Service: http://$RATINGS_IP:5001"
```

---

#### **Step 5: Test All Services**

```bash
# Test Product Service
curl http://$PRODUCT_IP:5000/api/products
curl http://$PRODUCT_IP:5000/health

# Test Ratings Service
curl http://$RATINGS_IP:5001/api/ratings
curl http://$RATINGS_IP:5001/health

# Test Frontend (already working)
curl http://4.149.12.165

# Test ArgoCD (if exposed)
curl -k https://$ARGOCD_IP
```

---

#### **Step 6: Update Frontend to Use Backend IPs**

**Save the IPs:**
```bash
# Get all IPs and save them
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "PRODUCT_IP=$PRODUCT_IP" > service-ips.txt
echo "RATINGS_IP=$RATINGS_IP" >> service-ips.txt
cat service-ips.txt
```

**Update your frontend build pipeline or Dockerfile:**
```dockerfile
# In frontend/Dockerfile or build pipeline
ARG REACT_APP_PRODUCT_SERVICE_URL=http://<PRODUCT_IP>:5000
ARG REACT_APP_RATINGS_SERVICE_URL=http://<RATINGS_IP>:5001
```

**Or update via environment variables in deployment:**
```yaml
# Add to frontend deployment.yaml
env:
  - name: REACT_APP_PRODUCT_SERVICE_URL
    value: "http://<PRODUCT_IP>:5000"
  - name: REACT_APP_RATINGS_SERVICE_URL
    value: "http://<RATINGS_IP>:5001"
```

---

#### **Step 7: Verify Everything Works**

**Check all LoadBalancers:**
```bash
kubectl get svc --all-namespaces | grep LoadBalancer
```

**Expected Output:**
```
argocd              argocd-server          LoadBalancer   10.x.x.x    <ARGOCD_IP>     443:xxxxx/TCP
product-catalog     frontend               LoadBalancer   10.x.x.x    4.149.12.165    80:xxxxx/TCP
product-catalog     product-service        LoadBalancer   10.x.x.x    <PRODUCT_IP>    5000:xxxxx/TCP
product-catalog     ratings-service        LoadBalancer   10.x.x.x    <RATINGS_IP>    5001:xxxxx/TCP
```

**Access URLs:**
- **ArgoCD**: `https://<ARGOCD_IP>` (username: `admin`, password from Step 2)
- **Frontend**: `http://4.149.12.165`
- **Product API**: `http://<PRODUCT_IP>:5000/api/products`
- **Ratings API**: `http://<RATINGS_IP>:5001/api/ratings`

---

### 📋 **Quick Reference: All Commands in One Place**

```bash
# 1. Check ArgoCD
kubectl get svc argocd-server -n argocd

# 2. Expose ArgoCD (if needed)
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc argocd-server -n argocd -w

# 3. Expose Product Service
kubectl patch svc product-service -n product-catalog -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc product-service -n product-catalog -w

# 4. Expose Ratings Service
kubectl patch svc ratings-service -n product-catalog -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc ratings-service -n product-catalog -w

# 5. Get all IPs
ARGOCD_IP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "ArgoCD: https://$ARGOCD_IP"
echo "Frontend: http://4.149.12.165"
echo "Product API: http://$PRODUCT_IP:5000"
echo "Ratings API: http://$RATINGS_IP:5001"

# 6. Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

---

### 💰 **Cost Estimate**

- **Total LoadBalancers**: 4 (ArgoCD + Frontend + Product-service + Ratings-service)
- **Cost per LoadBalancer**: ~$18/month (~$0.025/hour)
- **Total Cost**: ~$72/month
- **Acceptable for**: Development, Staging, Testing

---

### ✅ **Success Checklist**

- [ ] ArgoCD service shows `LoadBalancer` type
- [ ] ArgoCD has external IP assigned
- [ ] Can access ArgoCD UI at `https://<IP>`
- [ ] Product-service shows `LoadBalancer` type
- [ ] Product-service has external IP assigned
- [ ] Can access Product API at `http://<IP>:5000/api/products`
- [ ] Ratings-service shows `LoadBalancer` type
- [ ] Ratings-service has external IP assigned
- [ ] Can access Ratings API at `http://<IP>:5001/api/ratings`
- [ ] Frontend updated with backend IPs
- [ ] Frontend can connect to backend services

---

## Current Situation

- ✅ **Frontend**: LoadBalancer with External IP `4.149.12.165` (port 80)
- ❌ **Product-service**: ClusterIP (no external access)
- ❌ **Ratings-service**: ClusterIP (no external access)
- ⚠️ **ArgoCD Server**: May or may not have LoadBalancer
- ⚠️ **Limited Ingress quota**: Only 2 Ingress resources available
- ❌ **Ingress not working**: Need LoadBalancer solution 

## Problem

Frontend (running in browser) needs to connect to backend services, but:
- Frontend is at: `http://4.149.12.165`
- Product-service has no external IP
- Browser cannot use Kubernetes internal service names

---

## Option 1: Use LoadBalancer for Each Service (Simplest - Recommended for Your Case)

**Pros:**
- ✅ Simple and straightforward
- ✅ Works immediately
- ✅ No Ingress quota needed
- ✅ Each service gets its own IP
- ✅ Easy to test and debug

**Cons:**
- ❌ Costs more (each LoadBalancer = ~$0.025/hour in Azure)
- ❌ More public IPs to manage
- ❌ Not ideal for production (but works)

**Steps:**

1. **Expose Product-Service:**
   ```bash
   kubectl expose deployment product-service \
     --type=LoadBalancer \
     --port=5000 \
     --target-port=5000 \
     --name=product-service-lb \
     -n product-catalog
   ```

2. **Expose Ratings-Service:**
   ```bash
   kubectl expose deployment ratings-service \
     --type=LoadBalancer \
     --port=5001 \
     --target-port=5001 \
     --name=ratings-service-lb \
     -n product-catalog
   ```

3. **Wait for External IPs (2-5 minutes):**
   ```bash
   kubectl get svc -n product-catalog -w
   ```

4. **Get the IPs:**
   ```bash
   PRODUCT_IP=$(kubectl get svc product-service-lb -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
   RATINGS_IP=$(kubectl get svc ratings-service-lb -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
   
   echo "Product Service: http://$PRODUCT_IP:5000"
   echo "Ratings Service: http://$RATINGS_IP:5001"
   ```

5. **Test:**
   ```bash
   curl http://$PRODUCT_IP:5000/api/products
   curl http://$RATINGS_IP:5001/api/ratings
   ```

6. **Update Frontend Pipeline:**
   ```yaml
   arguments: |
     --build-arg REACT_APP_PRODUCT_SERVICE_URL=http://$PRODUCT_IP:5000
     --build-arg REACT_APP_RATINGS_SERVICE_URL=http://$RATINGS_IP:5001
   ```

**Cost:** ~$18/month per LoadBalancer (2 services = ~$36/month)

---

## Option 2: Use Single Ingress with Path-Based Routing (Best Practice)

**Pros:**
- ✅ Uses only 1 Ingress (saves quota)
- ✅ Single domain/IP for everything
- ✅ Clean URLs (`/api/products` instead of different IPs)
- ✅ Better for production
- ✅ Easier to add SSL/TLS later

**Cons:**
- ❌ Requires Ingress Controller (NGINX) installed
- ❌ Slightly more complex setup
- ❌ Need to configure path routing

**Steps:**

1. **Install NGINX Ingress Controller (if not already):**
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
   
   # Wait for it to be ready
   kubectl wait --namespace ingress-nginx \
     --for=condition=ready pod \
     --selector=app.kubernetes.io/component=controller \
     --timeout=300s
   ```

2. **Create/Update Ingress with Path Routing:**
   
   Create `kubernetes/ingress.yaml`:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: product-catalog-ingress
     namespace: product-catalog
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
       nginx.ingress.kubernetes.io/ssl-redirect: "false"
       nginx.ingress.kubernetes.io/cors-allow-origin: "*"
       nginx.ingress.kubernetes.io/enable-cors: "true"
   spec:
     ingressClassName: nginx
     rules:
     - http:
         paths:
         # Frontend
         - path: /
           pathType: Prefix
           backend:
             service:
               name: frontend
               port:
                 number: 80
         # Product Service API
         - path: /api/products
           pathType: Prefix
           backend:
             service:
               name: product-service
               port:
                 number: 5000
         # Ratings Service API
         - path: /api/ratings
           pathType: Prefix
           backend:
             service:
               name: ratings-service
               port:
                 number: 5001
   ```

3. **Apply Ingress:**
   ```bash
   kubectl apply -f kubernetes/ingress.yaml
   ```

4. **Get Ingress External IP:**
   ```bash
   # Wait for IP assignment
   kubectl get ingress product-catalog-ingress -n product-catalog -w
   
   # Get the IP
   INGRESS_IP=$(kubectl get ingress product-catalog-ingress -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
   echo "Ingress IP: http://$INGRESS_IP"
   ```

5. **Update Frontend to Use Relative URLs:**
   
   Update `frontend/Dockerfile`:
   ```dockerfile
   ARG REACT_APP_PRODUCT_SERVICE_URL=/api/products
   ARG REACT_APP_RATINGS_SERVICE_URL=/api/ratings
   ```
   
   **Important:** Update `frontend/src/App.js` to not append `/api/products`:
   ```javascript
   // Change from:
   const response = await fetch(`${PRODUCT_SERVICE_URL}/api/products`);
   
   // To:
   const response = await fetch(PRODUCT_SERVICE_URL);
   ```

6. **Test:**
   ```bash
   # Frontend
   curl http://$INGRESS_IP/
   
   # Product API
   curl http://$INGRESS_IP/api/products
   
   # Ratings API
   curl http://$INGRESS_IP/api/ratings
   ```

**Cost:** Uses 1 Ingress (saves quota), but still needs LoadBalancer for Ingress Controller

---

## Option 3: Use Frontend LoadBalancer IP with Ingress for APIs Only

**Hybrid Approach:**
- Keep frontend LoadBalancer (already working)
- Use 1 Ingress only for backend APIs
- Frontend connects to Ingress IP for APIs

**Steps:**

1. **Create Ingress for APIs only:**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: product-catalog-api-ingress
     namespace: product-catalog
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
       nginx.ingress.kubernetes.io/cors-allow-origin: "*"
       nginx.ingress.kubernetes.io/enable-cors: "true"
   spec:
     ingressClassName: nginx
     rules:
     - http:
         paths:
         - path: /api/products
           pathType: Prefix
           backend:
             service:
               name: product-service
               port:
                 number: 5000
         - path: /api/ratings
           pathType: Prefix
           backend:
             service:
               name: ratings-service
               port:
                 number: 5001
   ```

2. **Get Ingress IP:**
   ```bash
   API_INGRESS_IP=$(kubectl get ingress product-catalog-api-ingress -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
   echo "API Ingress IP: http://$API_INGRESS_IP"
   ```

3. **Update Frontend:**
   ```dockerfile
   ARG REACT_APP_PRODUCT_SERVICE_URL=http://$API_INGRESS_IP/api/products
   ARG REACT_APP_RATINGS_SERVICE_URL=http://$API_INGRESS_IP/api/ratings
   ```

**Cost:** 1 Ingress + 1 LoadBalancer (frontend)

---

## Recommendation for Your Situation

**Given:**
- ✅ Frontend already has LoadBalancer working
- ✅ ArgoCD Server already has LoadBalancer
- ⚠️ Limited Ingress quota (only 2)
- ✅ Need quick solution

**First, Check if Ingress Controller Exists:**
```bash
kubectl get svc -n ingress-nginx
kubectl get pods -n ingress-nginx
```

**If Ingress Controller EXISTS (has LoadBalancer):**
- ✅ **Use Ingress (Option 2)** - Better organization, uses existing infrastructure
- No additional LoadBalancer cost (controller already has one)
- Uses 1 Ingress resource (you have 2 quota)

**If Ingress Controller does NOT exist:**
- ✅ **Use LoadBalancer (Option 1)** - Simplest, fastest
- No Ingress quota used (save for other projects)
- Works immediately

**Recommended: Option 1 (LoadBalancer) if no Ingress Controller**

**Why:**
1. **Simplest** - No Ingress configuration needed
2. **Works immediately** - Just expose services
3. **No code changes** - Frontend can use full URLs
4. **Easy to test** - Each service independently accessible
5. **No Ingress quota used** - Save it for other projects
6. **No need to install Ingress Controller**

**Cost:** ~$36/month for 2 additional LoadBalancers (acceptable for development/staging)

**Total LoadBalancers:** 4 (ArgoCD + Frontend + Product-service + Ratings-service)

**When to Switch to Ingress:**
- When you need SSL/TLS certificates
- When you want a single domain
- When you have more services (cost savings)
- For production environments

---

## Quick Start: LoadBalancer Approach

```bash
# 1. Expose product-service
kubectl expose deployment product-service \
  --type=LoadBalancer \
  --port=5000 \
  --target-port=5000 \
  --name=product-service-lb \
  -n product-catalog

# 2. Expose ratings-service
kubectl expose deployment ratings-service \
  --type=LoadBalancer \
  --port=5001 \
  --target-port=5001 \
  --name=ratings-service-lb \
  -n product-catalog

# 3. Wait for IPs (2-5 minutes)
kubectl get svc -n product-catalog -w

# 4. Get IPs
PRODUCT_IP=$(kubectl get svc product-service-lb -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RATINGS_IP=$(kubectl get svc ratings-service-lb -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Product Service: http://$PRODUCT_IP:5000"
echo "Ratings Service: http://$RATINGS_IP:5001"

# 5. Test
curl http://$PRODUCT_IP:5000/api/products
curl http://$RATINGS_IP:5001/api/ratings

# 6. Update frontend pipeline with these IPs
```

---

## Comparison Table

| Aspect | LoadBalancer (Option 1) | Ingress (Option 2) | Hybrid (Option 3) |
|--------|-------------------------|-------------------|-------------------|
| **Ingress Quota Used** | 0 | 1 | 1 |
| **Setup Complexity** | ⭐ Easy | ⭐⭐⭐ Medium | ⭐⭐ Medium |
| **Code Changes** | None | Frontend code | None |
| **Cost** | ~$36/month | ~$18/month | ~$18/month |
| **URLs** | Different IPs | Single IP, paths | Mixed |
| **SSL/TLS** | Hard | Easy | Easy |
| **Best For** | Quick setup | Production | Balanced |

---

## Final Recommendation

**For your current situation: Use Option 1 (LoadBalancer)**

1. ✅ Quickest to implement
2. ✅ No code changes needed
3. ✅ Saves Ingress quota for other projects
4. ✅ Easy to test and debug
5. ✅ Can migrate to Ingress later when needed

**Next Steps:**
1. Expose both services with LoadBalancer
2. Get the external IPs
3. Update frontend pipeline with those IPs
4. Rebuild frontend
5. Test in browser

You can always migrate to Ingress later when you need SSL or want to optimize costs!

