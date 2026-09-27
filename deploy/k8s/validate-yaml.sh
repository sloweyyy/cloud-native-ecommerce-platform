#!/bin/bash

# YAML Validation Script for Kubernetes Manifests
# This script validates all YAML files in the k8s directory

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

# Check if Python and PyYAML are available
check_dependencies() {
    if ! command -v python3 &> /dev/null; then
        log_error "python3 is not installed or not in PATH"
        exit 1
    fi
    
    if ! python3 -c "import yaml" &> /dev/null; then
        log_error "PyYAML is not installed. Install it with: pip3 install PyYAML"
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

# Create Python validation script
create_validator() {
    cat > /tmp/validate_yaml.py << 'EOF'
import yaml
import sys

def validate_yaml_file(filename):
    try:
        with open(filename, 'r') as f:
            # Handle multi-document YAML files
            documents = list(yaml.safe_load_all(f))
            if not documents:
                print(f'Warning: No documents found in {filename}')
                return True
            else:
                print(f'Successfully parsed {len(documents)} document(s)')
                return True
    except yaml.YAMLError as e:
        print(f'YAML Error: {e}')
        return False
    except Exception as e:
        print(f'Error: {e}')
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python validate_yaml.py <filename>")
        sys.exit(1)
    
    filename = sys.argv[1]
    if validate_yaml_file(filename):
        sys.exit(0)
    else:
        sys.exit(1)
EOF
}

# Validate all YAML files
validate_yaml_files() {
    log_info "Validating YAML syntax for all Kubernetes manifests..."
    
    local failed=0
    local total=0
    
    # Find all YAML files
    while IFS= read -r -d '' manifest; do
        total=$((total + 1))
        echo ""
        log_info "Checking $(basename "$manifest")..."
        
        if python3 /tmp/validate_yaml.py "$manifest"; then
            log_success "✅ $manifest is valid YAML"
        else
            log_error "❌ YAML validation failed for $manifest"
            failed=$((failed + 1))
        fi
    done < <(find . -name "*.yaml" -type f -print0)
    
    echo ""
    log_info "Validation Summary:"
    echo "  Total files: $total"
    echo "  Passed: $((total - failed))"
    echo "  Failed: $failed"
    
    if [ $failed -eq 0 ]; then
        log_success "🎉 All YAML files are valid!"
        return 0
    else
        log_error "❌ $failed file(s) failed validation"
        return 1
    fi
}

# Cleanup function
cleanup() {
    rm -f /tmp/validate_yaml.py
}

# Main function
main() {
    log_info "Starting YAML validation for Kubernetes manifests"
    
    # Change to the k8s directory
    cd "$(dirname "$0")"
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Run validation
    check_dependencies
    create_validator
    validate_yaml_files
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "YAML validation completed successfully!"
    else
        log_error "YAML validation failed!"
    fi
    
    exit $exit_code
}

# Run main function
main "$@"
