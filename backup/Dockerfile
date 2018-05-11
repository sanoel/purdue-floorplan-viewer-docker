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

##############################################################################################
# Install arangodb client tools:
RUN wget https://www.arangodb.com/repositories/arangodb31/xUbuntu_16.04/Release.key \
    && apt-key add - < Release.key \
    && echo 'deb https://www.arangodb.com/repositories/arangodb31/xUbuntu_16.04/ /' | tee /etc/apt/sources.list.d/arangodb.list \
    && apt-get install apt-transport-https \
    && apt-get update \
    && apt-get install arangodb3-client=3.1.17

COPY "./.vimrc" "/root/.vimrc"

ADD backup /etc/cron.d/backup-cron

RUN chmod 0644 /etc/cron.d/backup-cron

RUN touch /var/log/cron.log

CMD cron && tail -f /var/log/cron.log
