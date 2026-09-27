# =============================================================================
# Networking Module — VPC, Subnets, NAT, Internet Gateway
# =============================================================================
# This is the foundation of your AWS infrastructure.
#
# Architecture:
#   VPC (10.0.0.0/16)
#   ├── Public Subnets  (10.0.1.0/24, 10.0.2.0/24)  — ALB, NAT Gateway
#   └── Private Subnets (10.0.10.0/24, 10.0.20.0/24) — EKS, Databases
#
# Public subnets can reach the internet directly via Internet Gateway.
# Private subnets reach the internet via NAT Gateway (outbound only).

# Fetch available AZs in the region
data "aws_availability_zones" "available" {
  state = "available"
}

# -----------------------------------------------------------------------------
# VPC — The isolated network for all resources
# -----------------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true # Needed for EKS and RDS endpoints
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# -----------------------------------------------------------------------------
# Internet Gateway — Allows public subnets to reach the internet
# -----------------------------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# -----------------------------------------------------------------------------
# Public Subnets — For load balancers and NAT gateways
# -----------------------------------------------------------------------------
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true # Instances get public IPs automatically

  tags = {
    Name = "${var.project_name}-${var.environment}-public-${data.aws_availability_zones.available.names[count.index]}"
    # These tags are required for EKS to discover subnets for load balancers
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${var.project_name}" = "shared"
  }
}

# -----------------------------------------------------------------------------
# Private Subnets — For EKS nodes, databases, and internal services
# -----------------------------------------------------------------------------
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-${var.environment}-private-${data.aws_availability_zones.available.names[count.index]}"
    # This tag lets EKS discover subnets for internal load balancers
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${var.project_name}" = "shared"
  }
}

# -----------------------------------------------------------------------------
# NAT Gateway — Lets private subnets make outbound internet requests
# (e.g., pulling Docker images, calling external APIs)
# -----------------------------------------------------------------------------
# NAT Gateway needs a public IP (Elastic IP)
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id # Place in first public subnet

  tags = {
    Name = "${var.project_name}-${var.environment}-nat"
  }

  depends_on = [aws_internet_gateway.main]
}

# -----------------------------------------------------------------------------
# Route Tables — Control where network traffic goes
# -----------------------------------------------------------------------------

# Public route table: traffic goes to Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

# Private route table: traffic goes to NAT Gateway
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-private-rt"
  }
}

# Associate public subnets with public route table
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Associate private subnets with private route table
resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
