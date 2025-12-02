#!/usr/bin/expect -f
set timeout 600

set remote_user "malmoi"
set remote_host "100.80.210.105"
set sudo_password "malmoi2020"

# SSH 접속
spawn ssh ${remote_user}@${remote_host}

expect {
    "password:" {
        send "\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "$ " {
        send "cd ~/booking-system\r"
    }
    "# " {
        send "cd ~/booking-system\r"
    }
}

expect {
    "$ " {
        send "if ! command -v psql &> /dev/null; then echo 'Installing PostgreSQL...'; sudo apt update && sudo apt install -y postgresql postgresql-contrib; fi\r"
    }
    "# " {
        send "if ! command -v psql &> /dev/null; then echo 'Installing PostgreSQL...'; sudo apt update && sudo apt install -y postgresql postgresql-contrib; fi\r"
    }
}

expect {
    "password" {
        send "${sudo_password}\r"
        exp_continue
    }
    "$ " {
        send "sudo systemctl start postgresql 2>/dev/null || true\r"
    }
    "# " {
        send "sudo systemctl start postgresql 2>/dev/null || true\r"
    }
}

expect {
    "password" {
        send "${sudo_password}\r"
        exp_continue
    }
    "$ " {
        send "sudo systemctl enable postgresql 2>/dev/null || true\r"
    }
    "# " {
        send "sudo systemctl enable postgresql 2>/dev/null || true\r"
    }
}

expect {
    "password" {
        send "${sudo_password}\r"
        exp_continue
    }
    "$ " {
        send "DB_EXISTS=\$(sudo -u postgres psql -tAc \"SELECT 1 FROM pg_database WHERE datname='malmoi_system'\" 2>/dev/null || echo '0')\r"
    }
    "# " {
        send "DB_EXISTS=\$(sudo -u postgres psql -tAc \"SELECT 1 FROM pg_database WHERE datname='malmoi_system'\" 2>/dev/null || echo '0')\r"
    }
}

expect {
    "$ " {
        send "if [ \"\$DB_EXISTS\" != \"1\" ]; then sudo -u postgres psql -c \"CREATE DATABASE malmoi_system; CREATE USER malmoi WITH PASSWORD 'malmoi2020'; GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi; ALTER USER malmoi CREATEDB;\"; fi\r"
    }
    "# " {
        send "if [ \"\$DB_EXISTS\" != \"1\" ]; then sudo -u postgres psql -c \"CREATE DATABASE malmoi_system; CREATE USER malmoi WITH PASSWORD 'malmoi2020'; GRANT ALL PRIVILEGES ON DATABASE malmoi_system TO malmoi; ALTER USER malmoi CREATEDB;\"; fi\r"
    }
}

expect {
    "$ " {
        send "if grep -q 'DATABASE_URL=' .env; then sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\"|g' .env; else echo '' >> .env && echo '# Local PostgreSQL Database' >> .env && echo 'DATABASE_URL=\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\"' >> .env; fi\r"
    }
    "# " {
        send "if grep -q 'DATABASE_URL=' .env; then sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\"|g' .env; else echo '' >> .env && echo '# Local PostgreSQL Database' >> .env && echo 'DATABASE_URL=\"postgresql://malmoi:malmoi2020@localhost:5432/malmoi_system?schema=public\"' >> .env; fi\r"
    }
}

expect {
    "$ " {
        send "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && npx prisma migrate deploy\r"
    }
    "# " {
        send "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && npx prisma migrate deploy\r"
    }
}

expect {
    "$ " {
        send "echo '✅ 설정 완료!'\r"
    }
    "# " {
        send "echo '✅ 설정 완료!'\r"
    }
}

expect {
    "$ " {
        send "exit\r"
    }
    "# " {
        send "exit\r"
    }
}

expect eof



