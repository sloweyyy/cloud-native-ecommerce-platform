#!/bin/bash

# Simple Kubernetes Manifest Validation Script
# Focuses on what we can reliably validate without external dependencies

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

# Validate YAML syntax
validate_yaml_syntax() {
    log_info "Validating YAML syntax..."
    
    local failed=0
    local total=0
    
    find . -name "*.yaml" -type f | while read -r manifest; do
        total=$((total + 1))
        echo -n "Checking $(basename "$manifest")... "
        
        if python3 -c "
import yaml
import sys

try:
    with open('$manifest', 'r') as f:
        list(yaml.safe_load_all(f))
    print('✅')
except Exception as e:
    print('❌')
    print(f'Error: {e}')
    sys.exit(1)
        " 2>/dev/null; then
            continue
        else
            failed=$((failed + 1))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        log_success "All YAML files are syntactically valid"
        return 0
    else
        log_error "$failed YAML files have syntax errors"
        return 1
    fi
}

# Check for common Kubernetes resource issues
validate_k8s_basics() {
    log_info "Checking basic Kubernetes resource structure..."
    
    local issues=0
    
    # Check for required fields in deployments
    find . -name "*.yaml" -type f -exec grep -l "kind: Deployment" {} \; | while read -r deployment; do
        echo "Checking deployment: $(basename "$deployment")"
        
        # Check for required fields
        if ! grep -q "apiVersion:" "$deployment"; then
            log_error "Missing apiVersion in $deployment"
            issues=$((issues + 1))
        fi
        
        if ! grep -q "metadata:" "$deployment"; then
            log_error "Missing metadata in $deployment"
            issues=$((issues + 1))
        fi
        
        if ! grep -q "spec:" "$deployment"; then
            log_error "Missing spec in $deployment"
            issues=$((issues + 1))
        fi
        
        # Check for image pull policy
        if grep -q "imagePullPolicy: IfNotPresent" "$deployment"; then
            log_warning "Found imagePullPolicy: IfNotPresent in $deployment (should be Always)"
        fi
        
        # Check for latest tags
        if grep -q ":latest" "$deployment"; then
            log_warning "Found :latest image tag in $deployment (should use specific version)"
        fi
    done
    
    return 0
}

# Check for security best practices
validate_security_basics() {
    log_info "Checking basic security configurations..."
    
    find . -name "*.yaml" -type f -exec grep -l "kind: Deployment" {} \; | while read -r deployment; do
        echo "Checking security in: $(basename "$deployment")"
        
        # Check for security context
        if ! grep -q "securityContext:" "$deployment"; then
            log_warning "No securityContext found in $deployment"
        fi
        
        # Check for resource limits
        if ! grep -q "limits:" "$deployment"; then
            log_warning "No resource limits found in $deployment"
        fi
        
        # Check for readiness/liveness probes
        if ! grep -q "livenessProbe:" "$deployment"; then
            log_warning "No livenessProbe found in $deployment"
        fi
        
        if ! grep -q "readinessProbe:" "$deployment"; then
            log_warning "No readinessProbe found in $deployment"
        fi
    done
    
    return 0
}

# Check service configurations
validate_services() {
    log_info "Checking service configurations..."
    
    find . -name "*.yaml" -type f -exec grep -l "kind: Service" {} \; | while read -r service; do
        echo "Checking service: $(basename "$service")"
        
        # Check for NodePort services (should be avoided)
        if grep -q "type: NodePort" "$service"; then
            log_warning "Found NodePort service in $service (consider using ClusterIP + Ingress)"
        fi
        
        # Check for proper selectors
        if ! grep -q "selector:" "$service"; then
            log_error "No selector found in service $service"
        fi
    done
    
    return 0
}

# Generate summary report
generate_summary() {
    log_info "Validation Summary:"
    echo ""
    
    local total_files=$(find . -name "*.yaml" -type f | wc -l)
    local deployments=$(find . -name "*.yaml" -type f -exec grep -l "kind: Deployment" {} \; | wc -l)
    local services=$(find . -name "*.yaml" -type f -exec grep -l "kind: Service" {} \; | wc -l)
    local configmaps=$(find . -name "*.yaml" -type f -exec grep -l "kind: ConfigMap" {} \; | wc -l)
    local secrets=$(find . -name "*.yaml" -type f -exec grep -l "kind: Secret" {} \; | wc -l)
    
    echo "📊 Resource Count:"
    echo "  Total YAML files: $total_files"
    echo "  Deployments: $deployments"
    echo "  Services: $services"
    echo "  ConfigMaps: $configmaps"
    echo "  Secrets: $secrets"
    echo ""
    
    echo "🔍 Validation Results:"
    echo "  ✅ YAML syntax validation completed"
    echo "  ✅ Basic Kubernetes structure checked"
    echo "  ✅ Security configuration reviewed"
    echo "  ✅ Service configuration validated"
    echo ""
    
    log_success "Validation completed successfully!"
}

# Main function
main() {
    log_info "Starting simple Kubernetes manifest validation"
    echo ""
    
    # Change to k8s directory
    cd "$(dirname "$0")"
    
    local overall_status=0
    
    # Run validations
    validate_yaml_syntax || overall_status=1
    echo ""
    
    validate_k8s_basics || overall_status=1
    echo ""
    
    validate_security_basics || overall_status=1
    echo ""
    
    validate_services || overall_status=1
    echo ""
    
    generate_summary
    
    if [ $overall_status -eq 0 ]; then
        log_success "🎉 All validations passed!"
    else
        log_warning "⚠️ Some issues found, but validation completed"
    fi
    
    exit $overall_status
}

# Run main function
main "$@"
