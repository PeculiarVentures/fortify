# Add certificate to system key chain

certPath=${appPath}/ca.pem
certificateName="Fortify Local CA" 

echo -e "certificateName: ${certificateName}"
echo -e "certPath: ${certPath}"
# keychain
security delete-certificate -c ${certificateName} /Library/Keychains/System.keychain
security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}

# Firefox
firefoxProfileDir=${userDir}/Library/Application\ Support/Firefox/Profiles
firefoxProfiles=$( find "$firefoxProfileDir" -name "*.default*" )
firefoxDefaultProfile="${firefoxProfiles[0]}"

if [ -z "${firefoxDefaultProfile}" ]
then
    echo "Firfox is not installed"
    exit 0
fi

CUR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "Delete old cert"
# Delete old cert
# /usr/local/Cellar/nss/3.31/bin/certutil -D -n "${certificateName}" -d "${firefoxDefaultProfile}"
${CUR_DIR}/certutil -D -n "${certificateName}" -d "${firefoxDefaultProfile}"
${CUR_DIR}/certutil -A -i "${certPath}" -n "${certificateName}" -t "C,c,c" -d "${firefoxDefaultProfile}"
${CUR_DIR}/certutil -L -d "${firefoxDefaultProfile}"

sudo -u ${USER} bash ${CUR_DIR}/osx_firefox.sh