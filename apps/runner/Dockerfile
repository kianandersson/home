FROM ghcr.io/catthehacker/ubuntu:act-24.04

RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 && \
    chmod 700 get_helm.sh && \
    ./get_helm.sh

RUN helm plugin install https://github.com/databus23/helm-diff
