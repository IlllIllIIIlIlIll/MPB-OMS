#!/usr/bin/env python3
"""
Generate self-signed SSL certificate for HTTPS server
"""

import os
import subprocess
import sys
from pathlib import Path

# Try to import cryptography library for Python-based certificate generation
try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    import datetime
    import ipaddress
    CRYPTOGRAPHY_AVAILABLE = True
except ImportError:
    CRYPTOGRAPHY_AVAILABLE = False

def generate_ssl_certificate_python():
    """Generate self-signed SSL certificate using Python cryptography library"""
    
    # Create certs directory
    certs_dir = Path(__file__).parent.parent / "certs"
    certs_dir.mkdir(exist_ok=True)
    
    cert_file = certs_dir / "cert.pem"
    key_file = certs_dir / "key.pem"
    
    # Check if certificates already exist
    if cert_file.exists() and key_file.exists():
        print("SSL certificates already exist:")
        print(f"Certificate: {cert_file}")
        print(f"Private Key: {key_file}")
        return str(cert_file), str(key_file)
    
    print("Generating self-signed SSL certificate using Python...")
    
    try:
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Create certificate subject
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "ID"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Jakarta"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Jakarta"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "MPB-OMS"),
            x509.NameAttribute(NameOID.COMMON_NAME, "192.168.1.113"),
        ])
        
        # Create certificate
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.DNSName("127.0.0.1"),
                x509.IPAddress(ipaddress.IPv4Address("192.168.1.113")),
                x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256())
        
        # Write private key
        with open(key_file, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        # Write certificate
        with open(cert_file, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        print("SSL certificate generated successfully!")
        print(f"Certificate: {cert_file}")
        print(f"Private Key: {key_file}")
        return str(cert_file), str(key_file)
    
    except Exception as e:
        print(f"Error generating certificate: {e}")
        return None, None

def generate_ssl_certificate_openssl():
    """Generate self-signed SSL certificate using openssl"""
    
    # Create certs directory
    certs_dir = Path(__file__).parent.parent / "certs"
    certs_dir.mkdir(exist_ok=True)
    
    cert_file = certs_dir / "cert.pem"
    key_file = certs_dir / "key.pem"
    
    # Check if certificates already exist
    if cert_file.exists() and key_file.exists():
        print("SSL certificates already exist:")
        print(f"Certificate: {cert_file}")
        print(f"Private Key: {key_file}")
        return str(cert_file), str(key_file)
    
    print("Generating self-signed SSL certificate using OpenSSL...")
    
    # Generate certificate using openssl
    cmd = [
        "openssl", "req", "-x509", "-newkey", "rsa:4096",
        "-keyout", str(key_file),
        "-out", str(cert_file),
        "-days", "365",
        "-nodes",
        "-subj", "/C=ID/ST=Jakarta/L=Jakarta/O=MPB-OMS/CN=192.168.1.113"
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("SSL certificate generated successfully!")
        print(f"Certificate: {cert_file}")
        print(f"Private Key: {key_file}")
        return str(cert_file), str(key_file)
    
    except subprocess.CalledProcessError as e:
        print(f"Error generating certificate: {e}")
        print("Make sure OpenSSL is installed on your system")
        return None, None
    except FileNotFoundError:
        print("OpenSSL not found.")
        return None, None

def generate_ssl_certificate():
    """Generate self-signed SSL certificate using available method"""
    
    # Try Python cryptography library first
    if CRYPTOGRAPHY_AVAILABLE:
        return generate_ssl_certificate_python()
    
    # Fallback to OpenSSL
    result = generate_ssl_certificate_openssl()
    if result[0] is None:
        print("\nFailed to generate certificate with OpenSSL.")
        print("Please install the cryptography library:")
        print("pip install cryptography")
        print("\nOr install OpenSSL:")
        print("Windows: Download from https://slproweb.com/products/Win32OpenSSL.html")
        print("Or use: choco install openssl (if you have Chocolatey)")
    
    return result

if __name__ == "__main__":
    generate_ssl_certificate()
