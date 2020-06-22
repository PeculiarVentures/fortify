# Add certificate to system key chain

certPath=${certPath}
certificateName="${certName}" 

echo -e "certificateName: ${certificateName}"
echo -e "certPath: ${certPath}"

# keychain
security delete-certificate -c ${certificateName} /Library/Keychains/System.keychain
security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}