# Add certificate to system key chain

certPath=${appPath}/cert.pem
oldCertPath=${appPath}/old_cert.pem
certificateName="fortifyapp.com" 

# keychain
if [ -f ${oldCertPath} ]; then
    security remove-trusted-cert -d ${oldCertPath}
    security delete-certificate -c ${certificateName}
fi
security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}

# Firefox
# firefoxProfileDir=/Users/microshine/Library/Application\ Support/Firefox/Profiles
# firefoxProfiles=$( find "$firefoxProfileDir" -name "*.default" )
# firefoxDefaultProfile="${firefoxProfiles[0]}"
# Delete old cert
# /usr/local/Cellar/nss/3.31/bin/certutil -D -n "${certificateName}" -d "${firefoxDefaultProfile}"
# /Users/microshine/github/pv/fortify/resources/certutil -A -i "${certPath}" -n "${certificateName}" -t "C,," -d "${firefoxDefaultProfile}"
# /Users/microshine/github/pv/fortify/resources/certutil -A -i "${certPath}" -n "${certificateName}" -t "С,," -d "${firefoxDefaultProfile}"