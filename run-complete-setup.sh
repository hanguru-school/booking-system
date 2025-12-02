#!/usr/bin/expect -f
set timeout 300
set password "malmoi2020"

spawn ssh malmoi@100.80.210.105 "cd ~/booking-system && ./complete-setup.sh"

expect {
    "password:" {
        send "\r"
        exp_continue
    }
    "\[sudo\] password" {
        send "${password}\r"
        exp_continue
    }
    eof
}

wait



