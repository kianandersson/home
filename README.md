# Home

## Recover node

### Install K3s

```sh
curl -sfL https://get.k3s.io | K3S_URL=https://home.anderssonfischer.com:6443 sh -
```

### Add Helm chart repositories

```sh
helm repo add jetstack https://charts.jetstack.io
helm repo add simply-dns-webhook https://runnerm.github.io/simply-dns-webhook
helm repo add gitea-charts https://dl.gitea.com/charts
```

### Update Helm chart repository cache

```sh
helm repo update
```

### Install Cert Manager

```sh
helm upgrade --install cert-manager jetstack/cert-manager \
  --create-namespace \
  --namespace cert-manager \
  --set installCRDs=true
```

### Install Simply DNS Webhook

```sh
helm upgrade --install simply-dns-webhook simply-dns-webhook/simply-dns-webhook \
  --create-namespace \
  --namespace cert-manager \
  --version 1.5.0
```

### Install Gitea

```sh
helm upgrade --install gitea gitea-charts/gitea \
  --create-namespace \
  --namespace gitea \
  --values values/gitea/values.yaml
```

### Install Gitea Actions

```sh
helm upgrade --install gitea-actions gitea-charts/actions \
  --create-namespace \
  --namespace gitea \
  --values values/gitea/actions/values.yaml
```

### Install RBAC

```sh
helm upgrade --install rbac ./charts/rbac \
  --create-namespace \
  --namespace rbac
```
