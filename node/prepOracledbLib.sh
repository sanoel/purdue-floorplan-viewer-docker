#! /bin/bash -i

apt-get install libaio1
apt-get install unzip
mkdir /opt/oracle
ls /opt
test -d "/opt/oracle" && echo Exists || echo Does not exist
cp ./instantclient-basic-linux.x64-12.2.0.1.0.zip /opt/oracle
cp ./instantclient-sdk-linux.x64-12.2.0.1.0.zip /opt/oracle
cd /opt/oracle
unzip instantclient-basic-linux.x64-12.2.0.1.0.zip
unzip instantclient-sdk-linux.x64-12.2.0.1.0.zip
mv instantclient_12_2 instantclient
cd instantclient
ln -s libclntsh.so.12.1 libclntsh.so
export LD_LIBRARY_PATH=/opt/oracle/instantclient:$LD_LIBRARY_PATH
export OCI_LIB_DIR=/opt/oracle/instantclient
export OCI_INC_DIR=/opt/oracle/instantclient/sdk/include


