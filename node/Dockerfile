FROM ubuntu:latest

RUN apt-get update \
    && apt-get install -y \
               wget git python vim \
               make gcc g++ \
               iputils-ping dnsutils

##################################################################################################
# Configure git:
#RUN git config --global user.email "dev@somebody.com" \
#&& git config --global user.name "dev"

#############################################################################################
# Install nvm: can't source /root/.bashrc because this stuff all runs in sh
# If you don't set NVM_DIR, then it will install to /bin instead of /root/.nvm
ENV NVM_DIR=/root/.nvm
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash \
    && . /root/.nvm/nvm.sh \
    && nvm install v7.0 \
    && nvm alias default v7.0
RUN . /root/.nvm/nvm.sh \
    && nvm use v7.0 

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod u+x /entrypoint.sh

##############################################################################
# install some oracle junk required for the node module oracledb
COPY ./prepOracledbLib.sh /prepOracledbLib.sh
COPY ./instantclient-basic-linux.x64-12.2.0.1.0.zip /instantclient-basic-linux.x64-12.2.0.1.0.zip
COPY ./instantclient-sdk-linux.x64-12.2.0.1.0.zip /instantclient-sdk-linux.x64-12.2.0.1.0.zip
RUN chmod u+x /prepOracledbLib.sh
RUN /prepOracledbLib.sh
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient:$LD_LIBRARY_PATH

WORKDIR "/code"
CMD /entrypoint.sh

