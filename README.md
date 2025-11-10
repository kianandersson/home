# Home

## Recover node

### Install Ubuntu Server

- [86_64](https://ubuntu.com/download/server)
- [Raspberry Pi](https://ubuntu.com/download/raspberry-pi)

### Update dependencies

```sh
sudo apt update
sudo apt full-upgrade -y
sudo reboot
```

### Enable bluetooth

```sh
sudo apt install -y bluez dbus
sudo systemctl enable bluetooth
sudo systemctl start bluetooth
```

### Mount data disk

```sh
sudo mkdir -p /mnt/data
sudo mount /dev/sda1 /mnt/data
```

### Mount data disk on boot

```sh
uuid=$(blkid -s UUID -o value /dev/sda1) && grep -q "$uuid" /etc/fstab || echo "UUID=$uuid /mnt/data ext4 defaults,noatime,nofail,x-systemd.device-timeout=5s 0 2" | sudo tee -a /etc/fstab
```

### Install K3s

```sh
curl -sfL https://get.k3s.io | K3S_URL=https://home.anderssonfischer.com:6443 sh -
```

### Recover persistent volumes

TBD...

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

### Configure Gitea

TBD...

### Add local origin

```sh
git remote add origin ssh://git@gitea.anderssonfischer.com:2222/kianandersson/home.git
```

### Trigger a deploy

```sh
git commit --allow-empty -m "chore: deploy"
```
