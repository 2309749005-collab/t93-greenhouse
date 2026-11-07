const statusLine = document.querySelector('#status');
const refresh = document.querySelector('#refresh');

async function checkHealth() {
    refresh.disabled = true;
    statusLine.textContent = '正在检查服务与 SQLite…';
    try {
        const response = await fetch('/api/health', { cache: 'no-store' });
        if (response.status === 503) {
            statusLine.textContent = '服务已启动，SQLite 暂不可用。请查看后端日志。';
            return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const health = await response.json();
        statusLine.textContent = `服务正常 · SQLite ${health.sqliteVersion}`;
    } catch {
        statusLine.textContent = '无法获取服务状态。请确认 Java 服务已启动，再重试。';
    } finally {
        refresh.disabled = false;
    }
}

refresh.addEventListener('click', checkHealth);
checkHealth();
