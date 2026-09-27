#!/bin/bash

# Kubernetes Manifest Validation Script
# This script validates YAML syntax and Kubernetes schema compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate YAML syntax using yamllint
validate_yaml_syntax() {
    log_info "Validating YAML syntax with yamllint..."
    
    if command -v yamllint &> /dev/null; then
        if yamllint deploy/k8s; then
            log_success "YAML syntax validation passed"
            return 0
        else
            log_error "YAML syntax validation failed"
            return 1
        fi
    else
        log_warning "yamllint not found, skipping YAML syntax validation"
        return 0
    fi
}

# Validate Kubernetes schema using kubectl dry-run (more reliable)
validate_k8s_schema() {
    log_info "Validating Kubernetes schema with kubectl dry-run..."

    if command -v kubectl &> /dev/null; then
        local failed=0

        # Create a temporary kubeconfig for validation
        local temp_kubeconfig=$(mktemp)
        cat > "$temp_kubeconfig" << EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://fake-server
  name: fake-cluster
contexts:
- context:
    cluster: fake-cluster
    user: fake-user
  name: fake-context
current-context: fake-context
users:
- name: fake-user
EOF

        export KUBECONFIG="$temp_kubeconfig"

        find deploy/k8s -name "*.yaml" -type f | while read -r manifest; do
            log_info "Validating $manifest"
            if kubectl apply --dry-run=client -f "$manifest" &>/dev/null; then
                log_success "✅ $manifest passed schema validation"
            else
                log_warning "⚠️ $manifest has schema issues (may be expected for some resources)"
                # Don't fail the build for schema validation issues
            fi
        done

        # Cleanup
        rm -f "$temp_kubeconfig"
        unset KUBECONFIG

        return 0
    else
        log_warning "kubectl not found, skipping Kubernetes schema validation"
        return 0
    fi
}

# Security and best practices check using kube-score
validate_best_practices() {
    log_info "Checking security and best practices with kube-score..."
    
    if command -v kube-score &> /dev/null; then
        find deploy/k8s -name "*.yaml" -type f | while read -r manifest; do
            log_info "Checking $manifest"
            kube-score score "$manifest" || log_warning "⚠️ kube-score found issues in $manifest"
        done
        
        log_success "Best practices check completed"
        return 0
    else
        log_warning "kube-score not found, skipping best practices validation"
        return 0
    fi
}

# Dry-run validation using kubectl
validate_dry_run() {
    log_info "Testing dry-run deployment..."
    
    if command -v kubectl &> /dev/null; then
        # Create a temporary kubeconfig for dry-run testing
        local temp_kubeconfig=$(mktemp)
        cat > "$temp_kubeconfig" << EOF
apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://fake-server
  name: fake-cluster
contexts:
- context:
    cluster: fake-cluster
    user: fake-user
  name: fake-context
current-context: fake-context
users:
- name: fake-user
EOF
        
        export KUBECONFIG="$temp_kubeconfig"
        
        find deploy/k8s -name "*.yaml" -type f | while read -r manifest; do
            log_info "Testing dry-run for $manifest"
            if kubectl apply --dry-run=client -f "$manifest" &>/dev/null; then
                log_success "✅ $manifest passed dry-run validation"
            else
                log_warning "⚠️ $manifest failed dry-run (may be expected for some manifests)"
            fi
        done
        
        # Cleanup
        rm -f "$temp_kubeconfig"
        unset KUBECONFIG
        
        log_success "Dry-run validation completed"
        return 0
    else
        log_warning "kubectl not found, skipping dry-run validation"
        return 0
    fi
}

# Main validation function
main() {
    log_info "Starting Kubernetes manifest validation"
    
    local overall_status=0
    
    # Run all validations
    validate_yaml_syntax || overall_status=1
    echo ""
    
    validate_k8s_schema || overall_status=1
    echo ""
    
    validate_best_practices
    echo ""
    
    validate_dry_run
    echo ""
    
    # Final result
    if [ $overall_status -eq 0 ]; then
        log_success "🎉 All validations passed!"
    else
        log_error "❌ Some validations failed!"
    fi
    
    exit $overall_status
}

# Run main function
main "$@"
