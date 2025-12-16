#!/bin/bash

# Quick log checking script for the e-commerce platform

echo "🔍 E-Commerce Platform Log Checker"
echo "===================================="
echo ""

# Function to show menu
show_menu() {
    echo "Select a service to check logs:"
    echo "1) Catalog API"
    echo "2) Basket API"
    echo "3) Discount API"
    echo "4) Ordering API"
    echo "5) API Gateway (Ocelot)"
    echo "6) RabbitMQ"
    echo "7) All Infrastructure Pods"
    echo "8) All API Pods"
    echo "9) Prometheus"
    echo "10) Grafana"
    echo "11) Kibana"
    echo "12) Metricbeat"
    echo "13) Elasticsearch"
    echo "14) Recent Events"
    echo "15) All Pods Status"
    echo "q) Quit"
    echo ""
}

# Get pod name by label
get_pod() {
    kubectl get pods -n $1 -l $2 -o jsonpath="{.items[0].metadata.name}" 2>/dev/null
}

while true; do
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
        1)
            POD=$(get_pod "default" "app.kubernetes.io/name=catalog")
            echo "📋 Catalog API Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        2)
            POD=$(get_pod "default" "app.kubernetes.io/name=basket")
            echo "📋 Basket API Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        3)
            POD=$(get_pod "default" "app.kubernetes.io/name=discount-grpc")
            echo "📋 Discount API Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        4)
            POD=$(get_pod "default" "app.kubernetes.io/name=ordering")
            echo "📋 Ordering API Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        5)
            POD=$(get_pod "default" "app.kubernetes.io/name=ocelotapigw")
            echo "📋 API Gateway Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        6)
            POD=$(get_pod "default" "app.kubernetes.io/name=rabbitmq")
            echo "📋 RabbitMQ Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        7)
            echo "📋 All Infrastructure Pods:"
            kubectl get pods -n default | grep -E "(db|rabbitmq|elasticsearch|kibana)"
            ;;
        8)
            echo "📋 All API Pods Status:"
            kubectl get pods -n default | grep -E "(catalog|basket|discount|ordering|ocelot)"
            ;;
        9)
            POD=$(get_pod "monitoring" "app.kubernetes.io/name=prometheus")
            echo "📋 Prometheus Server Logs:"
            kubectl logs $POD -n monitoring -c prometheus-server --tail=50
            ;;
        10)
            POD=$(get_pod "istio-system" "app=grafana")
            echo "📋 Grafana Logs:"
            kubectl logs $POD -n istio-system --tail=50
            ;;
        11)
            POD=$(get_pod "default" "app.kubernetes.io/name=kibana")
            echo "📋 Kibana Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        12)
            echo "📋 Metricbeat DaemonSet Logs (from all pods):"
            kubectl logs -l app.kubernetes.io/name=metricbeat -n default --tail=30 --prefix=true
            ;;
        13)
            POD=$(get_pod "default" "app.kubernetes.io/name=elasticsearch")
            echo "📋 Elasticsearch Logs:"
            kubectl logs $POD -n default --tail=50
            ;;
        14)
            echo "📋 Recent Events (last 20):"
            kubectl get events -n default --sort-by='.lastTimestamp' | tail -20
            ;;
        15)
            echo "📋 All Pods Status:"
            echo ""
            echo "Default Namespace:"
            kubectl get pods -n default
            echo ""
            echo "Monitoring Namespace:"
            kubectl get pods -n monitoring
            echo ""
            echo "Istio System:"
            kubectl get pods -n istio-system
            ;;
        q|Q)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    echo "Press Enter to continue..."
    read
    clear
done
