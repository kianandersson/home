deploy:
	helm upgrade --install ingress charts/ingress -n ingress --atomic --cleanup-on-fail \
		-f values/ingress/values.yaml \
		-f values/ingress/values.secrets.yaml
	
	helm upgrade --install api charts/api -n api --atomic --cleanup-on-fail

	helm upgrade --install home-assistant charts/home-assistant -n home-assistant --atomic --cleanup-on-fail \
		-f values/home-assistant/values.secrets.yaml

diff:
	helm diff upgrade ingress charts/ingress -n ingress \
		-f values/ingress/values.yaml \
		-f values/ingress/values.secrets.yaml

	helm diff upgrade api charts/api -n api

	helm diff upgrade home-assistant charts/home-assistant -n home-assistant --allow-unreleased \
		-f values/home-assistant/values.secrets.yaml

download-certificates:
	mkdir -p certs
	kubectl get secret local-root-ca-keypair -n cert-manager -o jsonpath='{.data.tls\.crt}' | base64 --decode > certs/anderssonfischer-local-root.crt
