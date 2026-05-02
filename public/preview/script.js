const host = window.location.hostname;
document.title = host;

const output = document.getElementById('output');
const input  = document.getElementById('hidden-input');

let history = [];
let historyIndex = -1;

const SITES = {
  realhost:    { path: '/realhost/',    desc: 'your hostname. it is real.' },
  fornoreason: { path: '/fornoreason/', desc: 'loading reason...' },
  youhacked:   { path: '/youhacked/',   desc: 'you hacked me.' },
};

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function promptStr() {
  return `<span class="prompt-color">you@<span>${escHtml(host)}</span>:~$&nbsp;</span>`;
}

function appendLine(html, cls = '') {
  const div = document.createElement('div');
  div.className = 'line ' + cls;
  div.innerHTML = html;
  output.appendChild(div);
}

function appendOutput(text, isErr = false) {
  if (!text) return;
  const cls = isErr ? 'err-color' : 'output-color';
  text.toString().split('\n').forEach(line => appendLine(escHtml(line), cls));
}

let inputLine = null;

function renderInputLine(val = '') {
  if (inputLine) inputLine.remove();
  inputLine = document.createElement('div');
  inputLine.className = 'input-line';
  inputLine.innerHTML = promptStr() + `<span class="ghost cmd-color">${escHtml(val)}</span><span class="cursor"></span>`;
  output.appendChild(inputLine);
  output.scrollTop = output.scrollHeight;
}

function lsOutput() {
  const div = document.createElement('div');
  div.className = 'line output-color';
  div.innerHTML = Object.entries(SITES).map(([name, { path, desc }]) =>
    `<a class="site-link" href="${path}">${name}/</a>   <span style="color:#555">${escHtml(desc)}</span>`
  ).join('\n');
  output.appendChild(div);
}

function run(raw) {
  const trimmed = raw.trim();

  if (inputLine) inputLine.remove();
  inputLine = null;
  appendLine(promptStr() + `<span class="cmd-color">${escHtml(raw)}</span>`);

  if (!trimmed) { renderInputLine(); return; }

  history.unshift(trimmed);
  historyIndex = -1;

  const parts = trimmed.split(/\s+/);
  const cmd   = parts[0];
  const arg   = parts[1];

  switch (cmd) {
    case 'ls':
      lsOutput();
      break;
    case 'cd':
    case 'goto':
    case 'open': {
      const target = arg ? arg.replace(/\/$/, '') : null;
      if (!target) {
        appendOutput(`${cmd}: missing operand`, true);
      } else if (SITES[target]) {
        window.location.href = SITES[target].path;
        return;
      } else {
        appendOutput(`${cmd}: ${target}: no such site`, true);
      }
      break;
    }
    case 'help':
      appendOutput([
        'available commands:',
        '  ls                    list sites',
        '  cd <site>             navigate to site',
        '  goto <site>           navigate to site',
        '  open <site>           navigate to site',
        '  hostname              print hostname',
        '  clear                 clear terminal',
        '',
        'sites: ' + Object.keys(SITES).join(', '),
      ].join('\n'));
      break;
    case 'hostname':
      appendOutput(host);
      break;
    case 'clear':
      output.innerHTML = '';
      break;
    case 'exit':
      appendOutput('logout\nThere is no outside.');
      break;
    case 'whoami':
      appendOutput('you');
      break;
    case 'pwd':
      appendOutput('/');
      break;
    default:
      appendOutput(`bash: ${cmd}: command not found`, true);
  }

  renderInputLine();
}

document.getElementById('btn-close').addEventListener('click', e => {
  e.stopPropagation();
  run('exit');
});

document.getElementById('btn-minimise').addEventListener('click', e => {
  e.stopPropagation();
  const terminal = document.getElementById('terminal');
  terminal.classList.add('minimised');
  setTimeout(() => terminal.classList.remove('minimised'), 1200);
});

document.getElementById('btn-maximise').addEventListener('click', e => {
  e.stopPropagation();
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});

document.addEventListener('click', () => input.focus());

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = input.value;
    input.value = '';
    run(val);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
      renderInputLine(input.value);
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
      renderInputLine(input.value);
    } else {
      historyIndex = -1;
      input.value = '';
      renderInputLine('');
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    e.stopPropagation();
    const val = input.value;
    const parts = val.split(/\s+/);
    const prefix = parts[parts.length - 1];
    const isCmd = parts.length === 1;
    const candidates = isCmd
      ? ['ls', 'cd', 'goto', 'open', 'help', 'hostname', 'clear', 'whoami', 'pwd'].filter(c => c.startsWith(prefix))
      : Object.keys(SITES).filter(s => s.startsWith(prefix));
    if (candidates.length === 1) {
      parts[parts.length - 1] = candidates[0] + (isCmd ? ' ' : '');
      input.value = parts.join(' ');
      renderInputLine(input.value);
    } else if (candidates.length > 1) {
      appendLine(`<span class="output-color">${candidates.join('  ')}</span>`);
      renderInputLine(val);
    }
    input.focus();
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    output.innerHTML = '';
    renderInputLine(input.value);
  } else if (e.key === 'u' && e.ctrlKey) {
    e.preventDefault();
    input.value = '';
    renderInputLine('');
  }
});

input.addEventListener('input', () => renderInputLine(input.value));

function init() {
  input.focus();
  appendLine(`<span class="output-color">Last login: ${new Date().toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', hour12: false })} on ttys000</span>`);
  appendLine('');
  appendLine(`<span class="output-color">Welcome to ${escHtml(host)}.</span>`);
  appendLine(`<span class="prompt-color">this is a preview deployment. these are the sites:</span>`);
  appendLine('');
  lsOutput();
  appendLine('');
  renderInputLine();
}

init();
