#!/bin/bash
# cron 작업 수정 스크립트

crontab -l 2>/dev/null | grep -v backup-database.sh > /tmp/crontab.tmp || true
echo "0 2 * * * /home/malmoi/backup-database.sh >> /home/malmoi/backups/logs/cron.log 2>&1" >> /tmp/crontab.tmp
crontab /tmp/crontab.tmp
rm /tmp/crontab.tmp

echo "✅ cron 작업 수정 완료!"
crontab -l | grep backup-database



