# LoadBalancer Configuration Guide for Product Catalog App

This guide explains how to configure and access your Product Catalog application using LoadBalancer services after deployment via ArgoCD.

## 🤔 Is LoadBalancer the Best Approach?

**Short Answer:** It depends on your situation. Let's help you decide!

### Quick Decision Tree

**First, check if you have an Ingress Controller:**

```bash
# Check for NGINX Ingress Controller
kubectl get pods -n ingress-nginx 2>/dev/null && echo "✅ Ingress Controller exists" || echo "❌ No Ingress Controller"

# Check Ingress Controller service
kubectl get svc -n ingress-nginx 2>/dev/null | grep LoadBalancer && echo "✅ Ingress Controller has LoadBalancer" || echo "❌ No Ingress Controller LoadBalancer"
```

### Comparison: LoadBalancer vs Ingress

| Aspect | LoadBalancer (Both Services) | Ingress (Single IP) | Hybrid (Frontend LB + Ingress for APIs) |
|--------|------------------------------|---------------------|------------------------------------------|
| **Setup Complexity** | ⭐⭐ Simple | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium |
| **Cost (Monthly)** | ~$36 (2 additional LBs) | ~$18 (1 Ingress Controller LB) | ~$18 (1 Ingress Controller LB) |
| **Total LoadBalancers** | 4 (ArgoCD + Frontend + Product + Ratings) | 3 (ArgoCD + Frontend + Ingress Controller) | 3 (ArgoCD + Frontend + Ingress Controller) |
| **Ingress Quota Used** | 0 | 1 | 1 |
| **URLs** | Different IPs per service | Single IP with paths | Frontend: LB IP, APIs: Ingress IP |
| **SSL/TLS** | Hard (per service) | Easy (single cert) | Easy (single cert for APIs) |
| **Production Ready** | ⚠️ Works but not ideal | ✅ Best practice | ✅ Good balance |
| **Time to Deploy** | ⚡ Immediate | 🕐 10-15 min setup | 🕐 10-15 min setup |
| **Code Changes** | None | Frontend URLs | Frontend URLs |

### Recommendations by Scenario

#### ✅ **Use LoadBalancer for Both Services If:**
- ❌ No Ingress Controller installed
- ✅ Quick development/testing needed
- ✅ Want simplest setup
- ✅ Cost is acceptable (~$36/month)
- ✅ Don't need SSL immediately
- ✅ Limited Ingress quota (want to save it)

**Best for:** Development, staging, quick testing, learning

#### ✅ **Use Ingress (Single IP) If:**
- ✅ Ingress Controller already exists
- ✅ Production environment
- ✅ Want to save costs (~$18/month savings)
- ✅ Need SSL/TLS certificates
- ✅ Want clean URLs (`/api/products` vs different IPs)
- ✅ Planning to scale to more services

**Best for:** Production, cost optimization, professional setup

**👉 [Jump to Ingress Setup Steps](#-ingress-single-ip-approach-step-by-step-guide)**

#### ✅ **Use Hybrid (Frontend LB + Ingress for APIs) If:**
- ✅ Frontend already has LoadBalancer (keep it)
- ✅ Want single IP for all APIs
- ✅ Want to minimize LoadBalancer count
- ✅ Need SSL for APIs

**Best for:** Transitioning from LoadBalancer to Ingress, balanced approach

---

## 📋 Current Service Configuration

- ✅ **Frontend Service**: `LoadBalancer` on port `80` (Already configured)
- ❌ **Product-service**: `ClusterIP` on port `5000` (Needs external access)
- ❌ **Ratings-service**: `ClusterIP` on port `5001` (Needs external access)
- ✅ **MongoDB**: `ClusterIP` (Internal only - no change needed)
- ✅ **Redis**: `ClusterIP` (Internal only - no change needed)
- ✅ **Worker-service**: `ClusterIP` (Internal only - no change needed)

**Namespace**: `product-catalog`

---

## 🎯 Recommended Approach

**For Most Cases: Check Ingress Controller First**

```bash
# Run this command to check
kubectl get svc -n ingress-nginx 2>/dev/null | grep LoadBalancer
```

**If Ingress Controller EXISTS:**
- ✅ **Use Ingress** - Better long-term solution
- See: `installation-docs/EXPOSE-SERVICES-OPTIONS.md` (Option 2)

**If Ingress Controller DOES NOT EXIST:**
- ✅ **Use LoadBalancer** - Quick and simple
- Continue with this guide below

---

## 📝 This Guide Covers: LoadBalancer Approach

**Note:** This guide focuses on using LoadBalancer for both services. If you prefer Ingress, see:
- `installation-docs/EXPOSE-SERVICES-OPTIONS.md` (Option 2)
- `installation-docs/LOADBALANCER-VS-INGRESS-DECISION.md`

### Target Configuration (LoadBalancer Approach)

- ✅ **Frontend Service**: `LoadBalancer` on port `80` (Already done)
- ✅ **Product-service**: `LoadBalancer` on port `5000` (To be configured)
- ✅ **Ratings-service**: `LoadBalancer` on port `5001` (To be configured)

---

## 🚀 Step-by-Step Guide

### Step 1: Update Service Manifests to Use LoadBalancer

#### Option A: Modify Service Files in Git Repository (Recommended for GitOps)

Update the service definitions in your Kubernetes manifests:

**1. Update `kubernetes/product-service/deployment.yaml`:**

Find the Service section (at the top of the file) and change:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: product-service
  namespace: product-catalog
spec:
  type: LoadBalancer  # Changed from ClusterIP
  ports:
    - port: 5000
      targetPort: 5000
      name: http
  selector:
    app: product-service
```

**2. Update `kubernetes/ratings-service/deployment.yaml`:**

Find the Service section (at the top of the file) and change:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ratings-service
  namespace: product-catalog
spec:
  type: LoadBalancer  # Changed from ClusterIP
  ports:
    - port: 5001
      targetPort: 5001
      name: http
  selector:
    app: ratings-service
```

**3. Commit and push changes to your Git repository:**

```bash
cd /path/to/product-catalog-app
git add kubernetes/product-service/deployment.yaml kubernetes/ratings-service/deployment.yaml
git commit -m "Change product-service and ratings-service to LoadBalancer type for external access"
git push origin main  # or master, depending on your default branch
```

#### Option B: Patch Services After Deployment (Quick Test - Not Recommended for Production)

If you want to test quickly without modifying Git:

```bash
# Patch product-service to LoadBalancer
kubectl patch svc product-service -n product-catalog -p '{"spec": {"type": "LoadBalancer"}}'

# Patch ratings-service to LoadBalancer
kubectl patch svc ratings-service -n product-catalog -p '{"spec": {"type": "LoadBalancer"}}'
```

**⚠️ Important Note:** Option B changes will be overwritten by ArgoCD if auto-sync is enabled. Use Option A for permanent changes that persist through ArgoCD syncs.

---

### Step 2: Deploy via ArgoCD

#### If Using GitOps (Option A from Step 1)

ArgoCD will automatically detect the changes and sync them:

**1. Check ArgoCD Application Status:**

```bash
# List all ArgoCD applications
kubectl get applications -n argocd

# Check specific application (if using single app)
kubectl get application product-catalog-app -n argocd

# Or check individual service applications
kubectl get application product-catalog-product-service -n argocd
kubectl get application product-catalog-ratings-service -n argocd
```

**2. If Auto-Sync is Enabled:**

ArgoCD will automatically sync the changes within a few minutes. Monitor the sync:

```bash
# Watch ArgoCD sync status
kubectl get application product-catalog-app -n argocd -w

# Or use ArgoCD CLI
argocd app get product-catalog-app
argocd app sync product-catalog-app
```

**3. If Auto-Sync is Disabled:**

Manually trigger sync:

```bash
# Via kubectl
kubectl patch application product-catalog-app -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'

# Or via ArgoCD CLI
argocd app sync product-catalog-app

# Or via ArgoCD UI
# Navigate to the application and click "Sync"
```

**4. Verify Sync in ArgoCD UI:**

- Access ArgoCD UI (via LoadBalancer IP or port-forward)
- Navigate to your application
- Verify services show as "Synced" (green status)
- Check that service types are now `LoadBalancer`

#### If Using Manual Patch (Option B from Step 1)

The changes are already applied. Skip to Step 3.

---

### Step 3: Wait for LoadBalancer IP Assignment

LoadBalancer IPs are assigned by Azure (since you're using AKS). This typically takes 2-5 minutes.

**Monitor service status:**

```bash
# Watch all services until EXTERNAL-IP is assigned
kubectl get svc -n product-catalog -w

# Or check specific services
kubectl get svc product-service -n product-catalog -w
kubectl get svc ratings-service -n product-catalog -w
kubectl get svc frontend -n product-catalog
```

**Expected output (before IP assignment):**

```
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
frontend          LoadBalancer   10.0.100.50     <pending>       80:XXXXX/TCP     5m
product-service   LoadBalancer   10.0.100.51     <pending>       5000:XXXXX/TCP   1m
ratings-service   LoadBalancer   10.0.100.52     <pending>       5001:XXXXX/TCP   1m
```

**After a few minutes:**

```
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
frontend          LoadBalancer   10.0.100.50     20.123.45.67    80:XXXXX/TCP     5m
product-service   LoadBalancer   10.0.100.51     20.123.45.68    5000:XXXXX/TCP    5m
ratings-service   LoadBalancer   10.0.100.52     20.123.45.69    5001:XXXXX/TCP   5m
```

---

### Step 4: Get LoadBalancer External IPs

Once the LoadBalancer IPs are assigned, retrieve them:

**Get All Service IPs:**

```bash
# Get all LoadBalancer services with their external IPs
kubectl get svc -n product-catalog -o wide | grep LoadBalancer

# Or formatted output
echo "=== LoadBalancer Services ==="
kubectl get svc -n product-catalog -o custom-columns=NAME:.metadata.name,TYPE:.spec.type,EXTERNAL-IP:.status.loadBalancer.ingress[0].ip,PORT:.spec.ports[0].port | grep LoadBalancer
```

**Get Individual Service IPs:**

```bash
# Get Frontend IP (already configured)
FRONTEND_IP=$(kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Frontend URL: http://$FRONTEND_IP"

# Get Product Service IP
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Product Service URL: http://$PRODUCT_IP:5000"

# Get Ratings Service IP
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ratings Service URL: http://$RATINGS_IP:5001"
```

**Get All IPs in One Command:**

```bash
# Create a script to get all IPs
cat << 'EOF' > get-ips.sh
#!/bin/bash
echo "=== Product Catalog App LoadBalancer IPs ==="
echo ""
echo "Frontend:"
kubectl get svc frontend -n product-catalog -o jsonpath='http://{.status.loadBalancer.ingress[0].ip}' && echo ""
echo "Product Service:"
kubectl get svc product-service -n product-catalog -o jsonpath='http://{.status.loadBalancer.ingress[0].ip}:5000' && echo ""
echo "Ratings Service:"
kubectl get svc ratings-service -n product-catalog -o jsonpath='http://{.status.loadBalancer.ingress[0].ip}:5001' && echo ""
EOF

chmod +x get-ips.sh
./get-ips.sh
```

---

### Step 5: Connect to Your Application

#### Access Frontend (Port 80)

**1. Access Frontend in Browser:**

```bash
# Get frontend IP
FRONTEND_IP=$(kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Open in browser
echo "Open in browser: http://$FRONTEND_IP"
```

**2. Test Frontend:**

```bash
curl http://$FRONTEND_IP
curl http://$FRONTEND_IP/health
```

#### Access Product Service API (Port 5000)

**1. Test Product Service:**

```bash
# Get product service IP
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test health endpoint
curl http://$PRODUCT_IP:5000/health

# Test products API
curl http://$PRODUCT_IP:5000/api/products

# Get specific product
curl http://$PRODUCT_IP:5000/api/products/1
```

**2. Access in Browser:**

```
http://YOUR_PRODUCT_IP:5000/api/products
```

#### Access Ratings Service API (Port 5001)

**1. Test Ratings Service:**

```bash
# Get ratings service IP
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test health endpoint
curl http://$RATINGS_IP:5001/health

# Test ratings API
curl http://$RATINGS_IP:5001/api/ratings

# Get ratings for a product
curl http://$RATINGS_IP:5001/api/ratings/product/1
```

**2. Access in Browser:**

```
http://YOUR_RATINGS_IP:5001/api/ratings
```

---

### Step 6: Update Frontend Configuration

The frontend React app needs to know the backend service URLs. Update your frontend build configuration:

**Option 1: Update Frontend Build Arguments (Recommended)**

If using Azure DevOps Pipeline or similar CI/CD:

```yaml
# In your pipeline YAML
variables:
  PRODUCT_IP: $(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  RATINGS_IP: $(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

steps:
  - task: Docker@2
    inputs:
      command: build
      dockerfile: 'frontend/Dockerfile'
      arguments: |
        --build-arg REACT_APP_PRODUCT_SERVICE_URL=http://$(PRODUCT_IP):5000
        --build-arg REACT_APP_RATINGS_SERVICE_URL=http://$(RATINGS_IP):5001
```

**Option 2: Update Frontend Dockerfile**

Update `frontend/Dockerfile`:

```dockerfile
ARG REACT_APP_PRODUCT_SERVICE_URL=http://YOUR_PRODUCT_IP:5000
ARG REACT_APP_RATINGS_SERVICE_URL=http://YOUR_RATINGS_IP:5001

ENV REACT_APP_PRODUCT_SERVICE_URL=$REACT_APP_PRODUCT_SERVICE_URL
ENV REACT_APP_RATINGS_SERVICE_URL=$REACT_APP_RATINGS_SERVICE_URL
```

**Option 3: Use ConfigMap (For Runtime Configuration)**

Create a ConfigMap for frontend environment variables:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: product-catalog
data:
  REACT_APP_PRODUCT_SERVICE_URL: "http://YOUR_PRODUCT_IP:5000"
  REACT_APP_RATINGS_SERVICE_URL: "http://YOUR_RATINGS_IP:5001"
```

Then update frontend deployment to use these environment variables.

**After updating frontend configuration:**

1. Rebuild frontend image
2. Push to ACR
3. ArgoCD Image Updater will automatically update the deployment (if configured)
4. Or manually trigger sync in ArgoCD

---

### Step 7: Verify Application Access

**1. Check Pod Status:**

```bash
# Check all pods are running
kubectl get pods -n product-catalog

# Check specific service pods
kubectl get pods -n product-catalog -l app=product-service
kubectl get pods -n product-catalog -l app=ratings-service
kubectl get pods -n product-catalog -l app=frontend
```

**2. Check Pod Logs:**

```bash
# Check product-service logs
kubectl logs -n product-catalog -l app=product-service --tail=50

# Check ratings-service logs
kubectl logs -n product-catalog -l app=ratings-service --tail=50

# Check frontend logs
kubectl logs -n product-catalog -l app=frontend --tail=50
```

**3. Test Connectivity:**

```bash
# Test backend services
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test product service
curl -v http://$PRODUCT_IP:5000/health
curl -v http://$PRODUCT_IP:5000/api/products

# Test ratings service
curl -v http://$RATINGS_IP:5001/health
curl -v http://$RATINGS_IP:5001/api/ratings

# Test frontend
FRONTEND_IP=$(kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -v http://$FRONTEND_IP
```

**4. Check Service Endpoints:**

```bash
# Verify services have endpoints
kubectl get endpoints -n product-catalog

# Check specific service endpoints
kubectl get endpoints product-service -n product-catalog
kubectl get endpoints ratings-service -n product-catalog
kubectl get endpoints frontend -n product-catalog
```

**5. Test from Browser:**

- Frontend: `http://YOUR_FRONTEND_IP`
- Product API: `http://YOUR_PRODUCT_IP:5000/api/products`
- Ratings API: `http://YOUR_RATINGS_IP:5001/api/ratings`

---

## 🔧 Azure-Specific Considerations

### Azure Load Balancer Details

**1. Check Load Balancer in Azure Portal:**

- Navigate to Azure Portal → Your AKS Cluster → **Networking** → **Load balancers**
- You should see 3 Load Balancers (one for each service)
- Each Load Balancer will have a public IP address

**2. View Load Balancer Rules:**

```bash
# Get Load Balancer details
az network lb list --resource-group YOUR_RESOURCE_GROUP --query "[].{Name:name,PublicIP:frontendIpConfigurations[0].publicIpAddress.id}" -o table

# Or via kubectl
kubectl get svc -n product-catalog -o json | jq '.items[] | select(.spec.type=="LoadBalancer") | {name: .metadata.name, ip: .status.loadBalancer.ingress[0].ip}'
```

**3. Azure Network Security Groups (NSG):**

Ensure NSG rules allow traffic on ports 80, 5000, and 5001:

```bash
# Check NSG rules (if needed)
az network nsg rule list --resource-group YOUR_RESOURCE_GROUP --nsg-name YOUR_NSG_NAME -o table
```

**4. Azure Public IP Addresses:**

Each LoadBalancer service gets its own public IP. You can view them:

```bash
# List public IPs
az network public-ip list --resource-group YOUR_RESOURCE_GROUP -o table
```

---

## 🔍 Troubleshooting

### Issue 1: LoadBalancer IP Stuck in "Pending"

**Symptoms:**
```
EXTERNAL-IP: <pending>
```

**Solutions:**

```bash
# 1. Check service events
kubectl describe svc product-service -n product-catalog
kubectl describe svc ratings-service -n product-catalog

# 2. Check for errors in events
kubectl get events -n product-catalog --sort-by='.lastTimestamp' | grep -i "service\|loadbalancer"

# 3. Verify AKS cluster has proper permissions
# Check if cluster has Contributor role on the resource group

# 4. Check Azure quota limits
az vm list-usage --location YOUR_LOCATION --query "[?contains(name.value, 'PublicIPAddresses')]"

# 5. Verify node resource group exists
az aks show --resource-group YOUR_RESOURCE_GROUP --name YOUR_AKS_NAME --query nodeResourceGroup -o tsv
```

### Issue 2: Cannot Access Application via LoadBalancer IP

**Symptoms:**
- Timeout when accessing LoadBalancer IP
- Connection refused
- 502 Bad Gateway

**Solutions:**

```bash
# 1. Verify pods are running
kubectl get pods -n product-catalog

# 2. Check service endpoints
kubectl get endpoints product-service -n product-catalog
kubectl get endpoints ratings-service -n product-catalog

# 3. Test from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://product-service.product-catalog.svc.cluster.local:5000/health

# 4. Check pod logs
kubectl logs -n product-catalog -l app=product-service --tail=100
kubectl logs -n product-catalog -l app=ratings-service --tail=100

# 5. Check Azure NSG rules (allow ports 80, 5000, 5001)
# 6. Verify Load Balancer health probes are passing
```

### Issue 3: ArgoCD Not Syncing Changes

**Symptoms:**
- Changes in Git not reflected in cluster
- Services still show ClusterIP after Git update

**Solutions:**

```bash
# 1. Check ArgoCD application status
kubectl get application product-catalog-app -n argocd -o yaml

# 2. Force refresh
argocd app get product-catalog-app --refresh

# 3. Manual sync
argocd app sync product-catalog-app

# 4. Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-application-controller --tail=50
kubectl logs -n argocd deployment/argocd-repo-server --tail=50

# 5. Verify Git repository access
argocd repo get https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/product-catalog-project

# 6. Check if namespace matches
kubectl get application product-catalog-app -n argocd -o jsonpath='{.spec.destination.namespace}'
```

### Issue 4: Service Type Reverts to ClusterIP

**Symptoms:**
- After ArgoCD sync, service type changes back to ClusterIP

**Solutions:**

```bash
# 1. Ensure service YAML in Git has type: LoadBalancer
# Check your Git repository files

# 2. Verify ArgoCD is reading from correct path
kubectl get application product-catalog-app -n argocd -o jsonpath='{.spec.source.path}'

# 3. Check if there are multiple service definitions
kubectl get svc -n product-catalog --show-labels

# 4. Disable auto-sync temporarily (if needed)
kubectl patch application product-catalog-app -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":null}}}'

# 5. Make changes and sync manually
argocd app sync product-catalog-app
```

### Issue 5: Frontend Cannot Connect to Backend Services

**Symptoms:**
- Frontend loads but cannot fetch products/ratings
- CORS errors in browser console
- Network errors

**Solutions:**

```bash
# 1. Verify backend services are accessible
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

curl http://$PRODUCT_IP:5000/api/products
curl http://$RATINGS_IP:5001/api/ratings

# 2. Check frontend environment variables
kubectl get deployment frontend -n product-catalog -o yaml | grep -A 10 env

# 3. Verify CORS is configured in backend services
# Check backend service code for CORS configuration

# 4. Check browser console for errors
# Open browser DevTools → Console → Look for CORS or network errors

# 5. Verify frontend was rebuilt with correct API URLs
# Check frontend Docker image environment variables
```

---

## 📊 Monitoring LoadBalancer Services

### Check Service Status

```bash
# Get all services with LoadBalancer type
kubectl get svc -n product-catalog -o wide

# Get detailed service information
kubectl describe svc product-service -n product-catalog
kubectl describe svc ratings-service -n product-catalog
kubectl describe svc frontend -n product-catalog

# Watch service changes
kubectl get svc -n product-catalog -w
```

### Check LoadBalancer Events

```bash
# View service events
kubectl get events -n product-catalog --sort-by='.lastTimestamp' | grep -i "service\|loadbalancer"

# Check specific service events
kubectl get events -n product-catalog --field-selector involvedObject.name=product-service --sort-by='.lastTimestamp'
```

### Monitor Pod Health

```bash
# Check pod status
kubectl get pods -n product-catalog -o wide

# Check pod logs
kubectl logs -n product-catalog -l app=product-service --tail=50 -f
kubectl logs -n product-catalog -l app=ratings-service --tail=50 -f
kubectl logs -n product-catalog -l app=frontend --tail=50 -f

# Check pod resource usage
kubectl top pods -n product-catalog
```

### Monitor ArgoCD Sync Status

```bash
# Check ArgoCD application status
kubectl get application -n argocd

# Get detailed application status
argocd app get product-catalog-app

# Watch application sync
kubectl get application product-catalog-app -n argocd -w
```

---

## 💰 Cost Considerations

### Azure Load Balancer Costs

- **Standard Load Balancer**: ~$0.025/hour per LoadBalancer (~$18/month)
- **Public IP Address**: ~$0.004/hour per IP (~$3/month)

**For this setup:**
- Frontend LoadBalancer: ~$18/month
- Product-service LoadBalancer: ~$18/month
- Ratings-service LoadBalancer: ~$18/month
- **Total**: ~$54/month for LoadBalancers + ~$9/month for IPs = **~$63/month**

### Cost Optimization Tips

1. **Use LoadBalancer only when needed** (development/staging)
2. **Consider Ingress** for production (single LoadBalancer for Ingress Controller)
3. **Delete LoadBalancers** when not in use
4. **Use NodePort** for internal-only access (no cost, but requires node IP access)
5. **Combine services behind Ingress** to reduce LoadBalancer count

---

## 🔐 Security Considerations

### 1. Network Security Groups (NSG)

Ensure Azure NSG rules allow traffic on required ports:

- Port 80 (Frontend)
- Port 5000 (Product Service)
- Port 5001 (Ratings Service)

### 2. Restrict Access (Optional)

You can restrict LoadBalancer access to specific IPs using Azure NSG rules:

```bash
# Example: Restrict to specific IP range
az network nsg rule create \
  --resource-group YOUR_RESOURCE_GROUP \
  --nsg-name YOUR_NSG_NAME \
  --name AllowProductService \
  --priority 100 \
  --source-address-prefixes 203.0.113.0/24 \
  --destination-port-ranges 5000 \
  --access Allow \
  --protocol Tcp
```

### 3. Use HTTPS (Recommended for Production)

For production, consider:
- Using Ingress with TLS certificates
- Or configuring TLS termination at LoadBalancer level
- Or using Azure Application Gateway with SSL

### 4. Enable Azure DDoS Protection

Consider enabling DDoS protection for production workloads:

```bash
az network ddos-protection plan create \
  --resource-group YOUR_RESOURCE_GROUP \
  --name ddos-protection-plan
```

---

## 📝 Quick Reference Commands

```bash
# Get all LoadBalancer IPs
kubectl get svc -n product-catalog -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.loadBalancer.ingress[0].ip}{"\n"}{end}'

# Get frontend IP
kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Get product service IP
kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Get ratings service IP
kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Test all services
FRONTEND_IP=$(kubectl get svc frontend -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
PRODUCT_IP=$(kubectl get svc product-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RATINGS_IP=$(kubectl get svc ratings-service -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Frontend: http://$FRONTEND_IP"
echo "Product Service: http://$PRODUCT_IP:5000"
echo "Ratings Service: http://$RATINGS_IP:5001"

# Test services
curl http://$FRONTEND_IP
curl http://$PRODUCT_IP:5000/api/products
curl http://$RATINGS_IP:5001/api/ratings

# Watch services
kubectl get svc -n product-catalog -w

# Check ArgoCD sync status
kubectl get application -n argocd
argocd app get product-catalog-app
```

---

## 🎯 Summary

After completing these steps, you should have:

1. ✅ Services configured as LoadBalancer type
2. ✅ External IPs assigned to your services
3. ✅ Application accessible via LoadBalancer IPs
4. ✅ ArgoCD syncing changes from Git
5. ✅ Application running and accessible

**Access URLs:**
- Frontend: `http://YOUR_FRONTEND_IP`
- Product Service: `http://YOUR_PRODUCT_IP:5000`
- Ratings Service: `http://YOUR_RATINGS_IP:5001`

**Next Steps:**
- Configure domain names pointing to LoadBalancer IPs (optional)
- Set up SSL/TLS certificates (for production)
- Configure monitoring and alerting
- Set up CI/CD pipeline for automated deployments
- Consider migrating to Ingress for production (cost optimization)

---

## 🌐 Ingress (Single IP) Approach - Step-by-Step Guide

This section provides detailed steps for using Ingress instead of LoadBalancer for both services. This approach uses a single IP address for all services and is recommended for production.

### Prerequisites

- AKS cluster running
- `kubectl` configured and connected to your cluster
- ArgoCD installed (for GitOps deployment)
- Git repository with Kubernetes manifests

---

### Step 1: Check if Ingress Controller Exists

First, verify if NGINX Ingress Controller is already installed:

```bash
# Check for NGINX Ingress Controller pods
kubectl get pods -n ingress-nginx

# Check for Ingress Controller service
kubectl get svc -n ingress-nginx

# Quick check command
kubectl get svc -n ingress-nginx 2>/dev/null | grep LoadBalancer && echo "✅ Ingress Controller exists" || echo "❌ No Ingress Controller"
```

**If Ingress Controller exists:** Skip to Step 3.

**If Ingress Controller does NOT exist:** Continue to Step 2.

---

### Step 2: Install NGINX Ingress Controller

If Ingress Controller is not installed, install it:

```bash
# Install NGINX Ingress Controller for Azure/AKS
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Wait for Ingress Controller to be ready (this may take 2-5 minutes)
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

**Expected output:**

```
NAME                                        READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-xxxxxxxxx-xxxxx   1/1     Running   0          2m

NAME                                 TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)                      AGE
ingress-nginx-controller             LoadBalancer   10.0.100.10    <pending>       80:XXXXX/TCP,443:XXXXX/TCP   2m
```

Wait for the `EXTERNAL-IP` to be assigned (2-5 minutes).

**Get Ingress Controller IP:**

```bash
INGRESS_CONTROLLER_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress Controller IP: $INGRESS_CONTROLLER_IP"
```

---

### Step 3: Update Ingress YAML File

Update your `kubernetes/ingress.yaml` file with the correct configuration:

**Current issues to fix:**
- ❌ Namespace is `default` (should be `product-catalog`)
- ❌ Has `host: product-catalog.local` (remove for IP-based access)
- ✅ Path routing is correct

**Updated `kubernetes/ingress.yaml`:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: product-catalog-ingress
  namespace: product-catalog  # Changed from default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
  # Remove host field to use IP-based access
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

**Key changes:**
1. ✅ Namespace changed to `product-catalog`
2. ✅ Removed `host: product-catalog.local` (allows IP-based access)
3. ✅ Added CORS annotations (important for frontend to call APIs)
4. ✅ Added `use-regex: "true"` for better path matching

---

### Step 4: Commit and Push to Git

```bash
cd /path/to/product-catalog-app

# Update the ingress.yaml file
# (Edit kubernetes/ingress.yaml with the content above)

# Commit changes
git add kubernetes/ingress.yaml
git commit -m "Update Ingress configuration for product-catalog namespace with CORS support"
git push origin main  # or master
```

---

### Step 5: Deploy via ArgoCD

#### Option A: If ArgoCD Auto-Sync is Enabled

ArgoCD will automatically detect and sync the changes:

```bash
# Monitor ArgoCD sync status
kubectl get application product-catalog-app -n argocd -w

# Or check specific application (if using separate apps)
kubectl get application -n argocd | grep product-catalog
```

#### Option B: Manual Sync

If auto-sync is disabled:

```bash
# Via ArgoCD CLI
argocd app sync product-catalog-app

# Or via kubectl
kubectl patch application product-catalog-app -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'

# Or via ArgoCD UI
# Navigate to the application and click "Sync"
```

**Verify Ingress is created:**

```bash
# Check Ingress resource
kubectl get ingress -n product-catalog

# Get detailed Ingress information
kubectl describe ingress product-catalog-ingress -n product-catalog
```

---

### Step 6: Wait for Ingress IP Assignment

The Ingress will use the Ingress Controller's LoadBalancer IP. Wait for it to be assigned:

```bash
# Watch Ingress until IP is assigned
kubectl get ingress product-catalog-ingress -n product-catalog -w
```

**Expected output (before IP assignment):**

```
NAME                        CLASS   HOSTS   ADDRESS   PORTS   AGE
product-catalog-ingress     nginx   *       <pending> 80      1m
```

**After IP assignment (2-5 minutes):**

```
NAME                        CLASS   HOSTS   ADDRESS         PORTS   AGE
product-catalog-ingress     nginx   *       20.123.45.67   80      5m
```

---

### Step 7: Get Ingress External IP

Once the IP is assigned, retrieve it:

```bash
# Get Ingress IP
INGRESS_IP=$(kubectl get ingress product-catalog-ingress -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress IP: http://$INGRESS_IP"

# Or get it directly
kubectl get ingress product-catalog-ingress -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

**Note:** The Ingress IP will be the same as the Ingress Controller's LoadBalancer IP.

---

### Step 8: Test Ingress Connectivity

Test all endpoints through the Ingress:

```bash
# Set the Ingress IP
INGRESS_IP=$(kubectl get ingress product-catalog-ingress -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test Frontend
echo "Testing Frontend:"
curl -v http://$INGRESS_IP/

# Test Product Service API
echo "Testing Product Service:"
curl -v http://$INGRESS_IP/api/products

# Test Ratings Service API
echo "Testing Ratings Service:"
curl -v http://$INGRESS_IP/api/ratings

# Test health endpoints
curl http://$INGRESS_IP/api/products/health  # If your service has /health endpoint
curl http://$INGRESS_IP/api/ratings/health
```

**Expected responses:**
- Frontend: HTML content
- Product API: JSON array of products
- Ratings API: JSON array of ratings

---

### Step 9: Update Frontend Configuration

The frontend needs to use relative URLs or the Ingress IP for API calls.

#### Option 1: Use Relative URLs (Recommended)

Update your frontend code to use relative URLs:

**Update `frontend/src/App.js` (or wherever you make API calls):**

```javascript
// Change from:
const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:5000';
const RATINGS_SERVICE_URL = process.env.REACT_APP_RATINGS_SERVICE_URL || 'http://localhost:5001';

// To (using relative URLs):
const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || '/api/products';
const RATINGS_SERVICE_URL = process.env.REACT_APP_RATINGS_SERVICE_URL || '/api/ratings';

// Then in your fetch calls:
// Change from:
const response = await fetch(`${PRODUCT_SERVICE_URL}/api/products`);

// To:
const response = await fetch(`${PRODUCT_SERVICE_URL}`);
```

**Update `frontend/Dockerfile`:**

```dockerfile
# Set environment variables for relative URLs
ARG REACT_APP_PRODUCT_SERVICE_URL=/api/products
ARG REACT_APP_RATINGS_SERVICE_URL=/api/ratings

ENV REACT_APP_PRODUCT_SERVICE_URL=$REACT_APP_PRODUCT_SERVICE_URL
ENV REACT_APP_RATINGS_SERVICE_URL=$REACT_APP_RATINGS_SERVICE_URL
```

#### Option 2: Use Ingress IP (Alternative)

If you prefer to use the full Ingress IP:

```dockerfile
# Get Ingress IP first
INGRESS_IP=$(kubectl get ingress product-catalog-ingress -n product-catalog -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# In Dockerfile or build args
ARG REACT_APP_PRODUCT_SERVICE_URL=http://${INGRESS_IP}/api/products
ARG REACT_APP_RATINGS_SERVICE_URL=http://${INGRESS_IP}/api/ratings
```

**After updating frontend:**

1. Rebuild frontend image
2. Push to ACR
3. ArgoCD Image Updater will automatically update (if configured)
4. Or manually trigger sync in ArgoCD

---

### Step 10: Verify Application Access

**1. Check Pod Status:**

```bash
# Check all pods are running
kubectl get pods -n product-catalog

# Check Ingress Controller pods
kubectl get pods -n ingress-nginx
```

**2. Check Ingress Status:**

```bash
# Get Ingress details
kubectl describe ingress product-catalog-ingress -n product-catalog

# Check Ingress events
kubectl get events -n product-catalog --sort-by='.lastTimestamp' | grep ingress
```

**3. Test from Browser:**

- Frontend: `http://YOUR_INGRESS_IP/`
- Product API: `http://YOUR_INGRESS_IP/api/products`
- Ratings API: `http://YOUR_INGRESS_IP/api/ratings`

**4. Test Frontend → Backend Connection:**

- Open browser DevTools (F12)
- Navigate to `http://YOUR_INGRESS_IP/`
- Check Network tab for API calls
- Verify no CORS errors

---

### Step 11: Optional - Change Frontend Service to ClusterIP

Since you're using Ingress, you can change the frontend service from LoadBalancer to ClusterIP to save costs:

**Update `kubernetes/frontend/deployment.yaml`:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: product-catalog
spec:
  type: ClusterIP  # Changed from LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
      name: http
  selector:
    app: frontend
```

**Benefits:**
- Saves ~$18/month (one less LoadBalancer)
- Frontend still accessible via Ingress
- Total LoadBalancers: 2 (ArgoCD + Ingress Controller)

**Commit and push:**

```bash
git add kubernetes/frontend/deployment.yaml
git commit -m "Change frontend service to ClusterIP - using Ingress for access"
git push origin main
```

ArgoCD will sync this change automatically.

---

## 🔍 Troubleshooting Ingress Setup

### Issue 1: Ingress IP Stuck in "Pending"

**Symptoms:**
```
ADDRESS: <pending>
```

**Solutions:**

```bash
# 1. Check Ingress Controller service
kubectl get svc -n ingress-nginx

# 2. Check Ingress Controller pods
kubectl get pods -n ingress-nginx

# 3. Check Ingress Controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=50

# 4. Verify Ingress Controller has LoadBalancer IP
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

### Issue 2: 404 Not Found on API Paths

**Symptoms:**
- Frontend loads but API calls return 404

**Solutions:**

```bash
# 1. Check Ingress configuration
kubectl get ingress product-catalog-ingress -n product-catalog -o yaml

# 2. Verify service names match
kubectl get svc -n product-catalog

# 3. Check Ingress Controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=100 | grep product-catalog

# 4. Test services directly (bypass Ingress)
kubectl port-forward svc/product-service -n product-catalog 5000:5000
# Then test: curl http://localhost:5000/api/products
```

### Issue 3: CORS Errors

**Symptoms:**
- Browser console shows CORS errors

**Solutions:**

```bash
# 1. Verify CORS annotations in Ingress
kubectl get ingress product-catalog-ingress -n product-catalog -o yaml | grep cors

# 2. Add/update CORS annotations
kubectl annotate ingress product-catalog-ingress -n product-catalog \
  nginx.ingress.kubernetes.io/cors-allow-origin="*" \
  nginx.ingress.kubernetes.io/enable-cors="true" \
  --overwrite

# 3. Check backend services also have CORS configured
# (CORS should be handled at Ingress level, but verify backend code)
```

### Issue 4: Path Rewriting Issues

**Symptoms:**
- API calls work but paths are incorrect

**Solutions:**

```bash
# 1. Check rewrite-target annotation
kubectl get ingress product-catalog-ingress -n product-catalog -o yaml | grep rewrite

# 2. Verify path configuration
# Path: /api/products should route to product-service:5000
# The rewrite-target: / removes /api/products prefix

# 3. If backend expects /api/products, remove rewrite-target:
kubectl annotate ingress product-catalog-ingress -n product-catalog \
  nginx.ingress.kubernetes.io/rewrite-target="" \
  --overwrite
```

---

## 📊 Monitoring Ingress

### Check Ingress Status

```bash
# Get Ingress information
kubectl get ingress -n product-catalog

# Get detailed Ingress info
kubectl describe ingress product-catalog-ingress -n product-catalog

# Watch Ingress changes
kubectl get ingress -n product-catalog -w
```

### Check Ingress Controller

```bash
# Get Ingress Controller pods
kubectl get pods -n ingress-nginx

# Get Ingress Controller service
kubectl get svc -n ingress-nginx

# Check Ingress Controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=50 -f
```

### Monitor Requests

```bash
# Check Ingress Controller metrics (if enabled)
kubectl port-forward svc/ingress-nginx-controller -n ingress-nginx 10254:10254
# Then access: http://localhost:10254/metrics
```

---

## 💰 Cost Comparison: LoadBalancer vs Ingress

### Current Setup (LoadBalancer Approach)
- ArgoCD LoadBalancer: ~$18/month
- Frontend LoadBalancer: ~$18/month
- Product-service LoadBalancer: ~$18/month
- Ratings-service LoadBalancer: ~$18/month
- **Total: ~$72/month**

### Ingress Approach
- ArgoCD LoadBalancer: ~$18/month
- Ingress Controller LoadBalancer: ~$18/month
- Frontend: ClusterIP (no cost)
- Product-service: ClusterIP (no cost)
- Ratings-service: ClusterIP (no cost)
- **Total: ~$36/month**

**Savings: ~$36/month (50% reduction!)**

---

## 🎯 Summary: Ingress Approach

After completing these steps, you should have:

1. ✅ NGINX Ingress Controller installed and running
2. ✅ Ingress resource configured for all services
3. ✅ Single IP address for all services
4. ✅ Frontend accessible at `http://INGRESS_IP/`
5. ✅ Product API accessible at `http://INGRESS_IP/api/products`
6. ✅ Ratings API accessible at `http://INGRESS_IP/api/ratings`
7. ✅ Frontend configured to use Ingress URLs
8. ✅ ArgoCD syncing changes from Git
9. ✅ Cost savings (~$36/month)

**Access URLs:**
- Frontend: `http://YOUR_INGRESS_IP/`
- Product API: `http://YOUR_INGRESS_IP/api/products`
- Ratings API: `http://YOUR_INGRESS_IP/api/ratings`

**Next Steps:**
- Configure domain name pointing to Ingress IP (optional)
- Set up SSL/TLS certificates (for production)
- Configure monitoring and alerting
- Set up CI/CD pipeline for automated deployments

---

## 📚 Additional Resources

- [Kubernetes Service Types](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Azure Load Balancer](https://docs.microsoft.com/en-us/azure/load-balancer/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [AKS Networking](https://docs.microsoft.com/en-us/azure/aks/concepts-network)

---

## 🔄 Migration from LoadBalancer to Ingress

If you've already deployed with LoadBalancer and want to migrate to Ingress:

1. **Install Ingress Controller** (Step 2)
2. **Update Ingress YAML** (Step 3)
3. **Deploy via ArgoCD** (Step 5)
4. **Get Ingress IP** (Step 7)
5. **Update frontend configuration** (Step 9)
6. **Change frontend service to ClusterIP** (Step 11 - optional)
7. **Delete old LoadBalancer services** (after verifying Ingress works):
   ```bash
   # Change services back to ClusterIP in Git
   # ArgoCD will sync and Azure will delete the LoadBalancers
   ```

The migration is seamless - ArgoCD will handle the changes automatically!

