# Add certificate to system key chain

certPath=${certPath}
certificateName=${certName}

echo -e "certificateName: ${certificateName}"
echo -e "certPath: ${certPath}"

# keychain
keychain=$(security default-keychain -d user | sed 's/"//g')
security delete-certificate -c ${certificateName} ${keychain}
security add-trusted-cert -r trustRoot -k ${keychain} ${certPath}
certDir=$(dirname ${certPath})
echo -e "certDir: ${certDir}"
mkdir "$certDir/mkcert"
cp ${certPath} "$certDir/mkcert/rootCA.pem"
CAROOT="$certDir/mkcert" TRUST_STORES=system mkcert -install