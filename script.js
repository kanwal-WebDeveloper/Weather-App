let current = '0', expr = '', operator = '', prevVal = '', justCalc = false, history = [];

function fmt(n) {
    let s = parseFloat(n);
    if (isNaN(s)) return n;
    return s.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function updateDisplay() {
    const r = document.getElementById('result');
    const e = document.getElementById('expr');
    r.textContent = fmt(current);
    r.className = 'display-result' + (current.replace(/[,.]/g, '').length > 9 ? ' small' : '');
    e.textContent = expr;
}

function pressNum(n) {
    if (justCalc && n !== '.') {
        current = ''; expr = ''; operator = ''; prevVal = ''; justCalc = false;
    }
    justCalc = false;
    if (n === '.' && current.includes('.')) return;
    if (current === '0' && n !== '.') current = n;
    else current += n;
    updateDisplay();
}

function pressOp(op) {
    justCalc = false;
    if (prevVal !== '' && operator) calculate(false);
    prevVal = current;
    operator = op;
    expr = fmt(current) + ' ' + op;
    current = '0';
    document.getElementById('exprTop').textContent = '';
    document.getElementById('expr').textContent = expr;
    document.getElementById('result').textContent = fmt(prevVal);
}

function calculate(finish) {
    if (!prevVal || !operator) return;
    let a = parseFloat(prevVal.replace(/,/g, '')), b = parseFloat(current.replace(/,/g, ''));
    let res;
    const fullExpr = fmt(a) + ' ' + operator + ' ' + fmt(b);
    if (operator === '+') res = a + b;
    else if (operator === '−') res = a - b;
    else if (operator === '×') res = a * b;
    else if (operator === '÷') res = b !== 0 ? a / b : 'Error';
    else if (operator === '%') res = a * (b / 100);
    current = String(res);
    if (finish) {
        const entry = fullExpr + ' = ' + fmt(res);
        document.getElementById('exprTop').textContent = entry;
        document.getElementById('expr').textContent = '';
        addHistory(entry);
        prevVal = ''; operator = ''; expr = '';
        justCalc = true;
    }
    const r = document.getElementById('result');
    r.textContent = fmt(current);
    r.className = 'display-result' + (String(fmt(res)).replace(/[,.]/g, '').length > 9 ? ' small' : '');
}

function pressEq() { calculate(true); }

function pressAC() {
    current = '0'; expr = ''; operator = ''; prevVal = ''; justCalc = false;
    document.getElementById('exprTop').textContent = '';
    document.getElementById('expr').textContent = '';
    document.getElementById('result').textContent = '0';
    document.getElementById('result').className = 'display-result';
}

function pressDel() {
    if (justCalc) return pressAC();
    if (current.length > 1) current = current.slice(0, -1);
    else current = '0';
    document.getElementById('result').textContent = fmt(current);
}

function addHistory(entry) {
    history.unshift(entry);
    const panel = document.getElementById('historyPanel');
    document.getElementById('historyEmpty').style.display = 'none';
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = entry;
    panel.insertBefore(div, panel.firstChild);
}

function toggleHistoryPanel() {
    document.getElementById('historyPanel').classList.toggle('open');
}

// Keyboard support
document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') pressNum(e.key);
    else if (e.key === '.') pressNum('.');
    else if (e.key === '+') pressOp('+');
    else if (e.key === '-') pressOp('−');
    else if (e.key === '*') pressOp('×');
    else if (e.key === '/') { e.preventDefault(); pressOp('÷'); }
    else if (e.key === '%') pressOp('%');
    else if (e.key === 'Enter' || e.key === '=') pressEq();
    else if (e.key === 'Backspace') pressDel();
    else if (e.key === 'Escape') pressAC();
});
