const { exec } = require('child_process');

const PORT = 5000;

const killPort = (port) => {
    const command = process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port} -t`;

    exec(command, (err, stdout, stderr) => {
        if (err || !stdout) {
            console.log(`Port ${port} is free.`);
            return;
        }

        if (process.platform === 'win32') {
            const lines = stdout.trim().split('\n');
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid) {
                    exec(`taskkill /PID ${pid} /F`, (err) => {
                        if (!err) console.log(`Killed process ${pid} on port ${port}`);
                    });
                }
            });
        } else {
            // Linux/Mac implementation if needed, but user is on Windows
            const pids = stdout.trim().split('\n');
            pids.forEach(pid => {
                exec(`kill -9 ${pid}`);
            });
        }
    });
};

killPort(PORT);
