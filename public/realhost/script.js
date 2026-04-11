const host = window.location.hostname;
document.title = host;

const output = document.getElementById('output');
const input  = document.getElementById('hidden-input');
const shortHost = host.replace(/^www\./, '');

let history = [];
let historyIndex = -1;

const FILES = {
  'README':        `This is ${shortHost}.\nThe real hostname is ${shortHost}.\nYou're welcome.`,
  'hostname.conf': `HOSTNAME=${shortHost}\nFQDN=${shortHost}\n`,
  'is_this_real':  'yes',
  '.bash_history': `hostname\nhostname --fqdn\nhostname -i\nwhoami\nls\n`,
};

const COMMANDS = {
  hostname(args) {
    if (!args.length)         return shortHost;
    if (args[0] === '--fqdn') return shortHost;
    if (args[0] === '-f')     return shortHost;
    if (args[0] === '-s')     return shortHost.split('.')[0];
    if (args[0] === '-i')     return 'yes';
    if (args[0] === '-A')     return `${shortHost} ${shortHost}`;
    return err(`hostname: unknown option: ${args[0]}`);
  },
  whoami()   { return 'you'; },
  pwd()      { return '/home/you'; },
  id()       { return `uid=1000(you) gid=1000(you) groups=1000(you)`; },
  uname(args) {
    if (args[0] === '-a') return `Linux ${shortHost} 6.1.0-cursed #1 SMP PREEMPT x86_64 GNU/Linux`;
    return 'Linux';
  },
  echo(args)  { return args.join(' '); },
  clear()     { return '__CLEAR__'; },
  help()      {
    return [
      'available commands:',
      '  hostname [-s|-i|-f|--fqdn|-A]',
      '  whoami, id, pwd, uname [-a]',
      '  ls, cat <file>',
      '  echo, clear, exit',
      '  sudo, ssh, ping',
    ].join('\n');
  },
  ls(args) {
    const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const keys = Object.keys(FILES).filter(k => all || !k.startsWith('.'));
    return keys.join('  ');
  },
  cat(args) {
    if (!args.length) return err('cat: missing operand');
    const name = args[0];
    if (FILES[name] !== undefined) return FILES[name];
    return err(`cat: ${name}: No such file or directory`);
  },
  sudo(args) {
    if (!args.length) return err('sudo: no command specified');
    return err(`[sudo] password for you: \nsudo: you are not in the sudoers file. This incident will be reported.`);
  },
  ssh(args) {
    const target = args[args.length - 1] || 'somewhere';
    return err(`ssh: connect to host ${target} port 22: Connection refused`);
  },
  ping(args) {
    const target = args[0] || shortHost;
    return `PING ${target}: Operation not permitted`;
  },
  exit() {
    return `logout\nThere is no outside.`;
  },
};

function err(msg) {
  return { error: true, text: msg };
}

function promptStr() {
  return `<span class="prompt-color">you@<span>${shortHost}</span>:~$&nbsp;</span>`;
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
  text.toString().split('\n').forEach(line => {
    appendLine(escHtml(line), cls);
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
  const args  = parts.slice(1);

  if (cmd in COMMANDS) {
    const result = COMMANDS[cmd](args);
    if (result === '__CLEAR__') {
      output.innerHTML = '';
    } else if (result && typeof result === 'object' && result.error) {
      appendOutput(result.text, true);
    } else if (result !== undefined && result !== null && result !== '') {
      appendOutput(result, false);
    }
  } else {
    appendOutput(`bash: ${cmd}: command not found`, true);
  }

  renderInputLine();
}

document.addEventListener('click', () => input.focus());
input.focus();

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

input.addEventListener('input', () => {
  renderInputLine(input.value);
});

appendLine(`<span class="output-color">Last login: ${new Date().toUTCString()} on ttys000</span>`);
appendLine('');
appendLine(`<span class="output-color">Welcome to ${shortHost}.</span>`);
appendLine(`<span class="prompt-color">Try: <span class="cmd-color">hostname</span>, <span class="cmd-color">whoami</span>, <span class="cmd-color">ls</span>, <span class="cmd-color">cat README</span>. Type <span class="cmd-color">help</span> for more.</span>`);
appendLine('');
renderInputLine();
