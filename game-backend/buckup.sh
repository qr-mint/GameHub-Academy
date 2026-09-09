#!/bin/bash
docker exec -i "qr-mint-postgres" pg_dump -Fc -U postgresql game_db > ./db_`date +%Y-%m-%d"_"%H_%M_%S`.dump

