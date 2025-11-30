#!/bin/bash
echo Пароль для пользователя root для нового сервера обычно находится в почте

# скопируем локальный ключ с машины на удаленную
ssh-copy-id root@90.156.252.135


# На удаленной машине выполним полную подготовку проекта
ssh root@90.156.252.135 << 'EOFMain'

# server redeploy from the begining
curl --version # уже должно быть, либо поставить
apt update

# git до последней версии
apt install -y software-properties-common
add-apt-repository ppa:git-core/ppa -y
apt update
git config --global core.autocrlf false
git --version

# docker, docker compose
curl -fsSL https://get.docker.com | sh
apt update && sudo apt install docker-compose-plugin -y
docker compose --version

# Clone всех нужных репозиториев
# CannonJsWorld основной сайт
git clone https://github.com/shmykov-git/CannonJsWorld.git /opt/CannonJsWorld
# dehydrated для сертификации сайта
git clone https://github.com/dehydrated-io/dehydrated.git /opt/dehydrated

# настройка dehydrated для сертификации сайта
cd /opt/dehydrated
chmod +x dehydrated
cp dehydrated /usr/local/bin/
mkdir -p /etc/dehydrated
cd /etc/dehydrated
mkdir -p certs accounts

# domains.txt
echo "cannon.programbus.ru www.cannon.programbus.ru" | sudo tee /etc/dehydrated/domains.txt > /dev/null
cat /etc/dehydrated/domains.txt

# config
tee /etc/dehydrated/config > /dev/null <<EOF
BASEDIR="/etc/dehydrated"
WELLKNOWN="/var/www/dehydrated"
CONTACT_EMAIL="shmykov.dev@gmail.com"
EOF
cat /etc/dehydrated/config

# на всякий
mkdir -p /var/www/dehydrated
chown -R www-data:www-data /var/www/dehydrated

dehydrated --register --accept-terms

# первое получение сертификата сайта
docker run -d --name nginx-cert --restart unless-stopped -p 80:80 -p 443:443 -v /opt/CannonJsWorld/deploy_prod/nginx-cert.conf:/etc/nginx/nginx.conf -v /var/www/dehydrated:/var/www/dehydrated -v /etc/dehydrated/certs:/etc/dehydrated/certs:ro nginx:latest
dehydrated -c
docker stop nginx-cert

# настроить обновление сертификата сайта по рассписанию
echo "0 3 * * 0 /opt/dehydrated/dehydrated -c --cron" | crontab -
crontab -l

EOFMain


# скопируем локальную папку public на удаленную машину
scp -r ../public root@90.156.252.135:/opt/CannonJsWorld


# соберем 
ssh root@90.156.252.135 << 'EOFMain'
cd /opt/CannonJsWorld
git pull https://github.com/shmykov-git/CannonJsWorld.git
cd deploy_prod
docker compose up cannonworld nginx --build --remove-orphans --force-recreate -d
EOFMain

echo https://cannon.programbus.ru