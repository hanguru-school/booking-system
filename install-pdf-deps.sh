#!/bin/bash
expect <<EXPECT_SCRIPT
set timeout 600
set sudo_password "malmoi2020"

spawn ssh -t malmoi@100.80.210.105 "sudo apt-get update && sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 libatspi2.0-0 libxshmfence1"

expect {
    "password:" {
        send "${sudo_password}\r"
        exp_continue
    }
    "\[sudo\] password" {
        send "${sudo_password}\r"
        exp_continue
    }
    "Password:" {
        send "${sudo_password}\r"
        exp_continue
    }
    "password for" {
        send "${sudo_password}\r"
        exp_continue
    }
    eof
}
wait
EXPECT_SCRIPT



