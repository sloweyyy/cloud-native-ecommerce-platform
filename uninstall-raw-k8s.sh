#!/bin/bash

echo "Uninstalling microservices from Kubernetes cluster..."

# Delete API Gateway
echo "Deleting API Gateway..."
kubectl delete -f Deployments/k8s/ocelotapigw/ -n eshop --ignore-not-found=true

# Delete microservices
echo "Deleting microservices..."
kubectl delete -f Deployments/k8s/catalog/catalog-api/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/basket/basket-api/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/discount/discount-api/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/ordering/ordering-api/ -n eshop --ignore-not-found=true

# Delete RabbitMQ
echo "Deleting RabbitMQ..."
kubectl delete -f Deployments/k8s/rabbitmq/ -n eshop --ignore-not-found=true

# Delete Elasticsearch and Kibana
echo "Deleting logging infrastructure..."
kubectl delete -f Deployments/k8s/elasticsearch/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/kibana/ -n eshop --ignore-not-found=true

# Delete monitoring infrastructure
echo "Deleting monitoring infrastructure..."
kubectl delete -f Deployments/k8s/monitoring/prometheus/ -n monitoring --ignore-not-found=true
kubectl delete -f Deployments/k8s/monitoring/grafana/ -n monitoring --ignore-not-found=true

# Delete databases
echo "Deleting databases..."
kubectl delete -f Deployments/k8s/catalog/catalog-db/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/basket/basket-db/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/ordering/ordering-db/ -n eshop --ignore-not-found=true
kubectl delete -f Deployments/k8s/discount/discount-db/ -n eshop --ignore-not-found=true

# Delete ingress
echo "Deleting ingress..."
kubectl delete -f Deployments/k8s/ingress/ -n eshop --ignore-not-found=true

echo "Uninstallation completed" 