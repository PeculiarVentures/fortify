# Add certificate to system key chain

certPath=${appPath}/ca.pem
certificateName="Fortify Local CA" 

echo -e "certificateName: ${certificateName}"
echo -e "certPath: ${certPath}"

# keychain
security delete-certificate -c ${certificateName} /Library/Keychains/System.keychain
security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}