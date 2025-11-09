deploy:
	helm upgrade --install ingress charts/ingress -n ingress \
		-f values/ingress/values.yaml \
		-f values/ingress/values.secrets.yaml
	
	helm upgrade --install api charts/api -n api \
		-f values/api/values.yaml \
		-f values/api/values.secrets.yaml \
		--set-file keys.private=./apps/api/keys/private.pem \
        --set-file keys.public=./apps/api/keys/public.pem \
		--set application.image=gitea.anderssonfischer.com/kianandersson/api:8885d7834c9d363ab79c5b0923dd78f97db2669f

	helm upgrade --install home-assistant charts/home-assistant -n home-assistant \
		-f values/home-assistant/values.secrets.yaml

diff:
	helm diff upgrade ingress charts/ingress -n ingress \
		-f values/ingress/values.yaml \
		-f values/ingress/values.secrets.yaml

	helm diff upgrade api charts/api -n api \
		-f values/api/values.yaml \
		-f values/api/values.secrets.yaml \
		--set-file keys.private=./apps/api/keys/private.pem \
        --set-file keys.public=./apps/api/keys/public.pem \
		--set application.image=gitea.anderssonfischer.com/kianandersson/api:8885d7834c9d363ab79c5b0923dd78f97db2669f

	helm diff upgrade home-assistant charts/home-assistant -n home-assistant \
		-f values/home-assistant/values.secrets.yaml

download-certificates:
	mkdir -p certs
	kubectl get secret local-root-ca-keypair -n cert-manager -o jsonpath='{.data.tls\.crt}' | base64 --decode > certs/anderssonfischer-local-root.crt
