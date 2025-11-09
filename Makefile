download-certificates:
	mkdir -p certs
	kubectl get secret local-root-ca-keypair -n cert-manager -o jsonpath='{.data.tls\.crt}' | base64 --decode > certs/anderssonfischer-local-root.crt
