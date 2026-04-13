const host = window.location.hostname;
document.title = host;

const output = document.getElementById('output');
const input  = document.getElementById('hidden-input');
const shortHost = host.replace(/^www\./, '');

let history = [];
let historyIndex = -1;
let userData = {};

function getIP() { return userData.ip || '127.0.0.1'; }

function buildIpAddr(family) {
  const ip = getIP();
  const isV6 = ip.includes(':');
  const brd = !isV6 ? ip.split('.').slice(0, 3).join('.') + '.255' : null;
  const lines = [];

  if (family !== 6) {
    lines.push('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000');
    lines.push('    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00');
    lines.push('    inet 127.0.0.1/8 scope host lo');
    lines.push('       valid_lft forever preferred_lft forever');
    if (!isV6) {
      lines.push('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000');
      lines.push('    link/ether de:ad:be:ef:00:01 brd ff:ff:ff:ff:ff:ff');
      lines.push(`    inet ${ip}/24 brd ${brd} scope global dynamic eth0`);
      lines.push('       valid_lft forever preferred_lft forever');
    }
  }

  if (family !== 4) {
    if (family === 6) {
      lines.push('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000');
      lines.push('    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00');
      lines.push('    inet6 ::1/128 scope host');
      lines.push('       valid_lft forever preferred_lft forever');
    } else {
      lines.push('    inet6 ::1/128 scope host');
      lines.push('       valid_lft forever preferred_lft forever');
    }
    if (isV6) {
      if (family !== 6) {
        lines.push('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000');
        lines.push('    link/ether de:ad:be:ef:00:01 brd ff:ff:ff:ff:ff:ff');
      }
      lines.push(`    inet6 ${ip}/64 scope global dynamic mngtmpaddr`);
      lines.push('       valid_lft forever preferred_lft forever');
    }
  }

  return lines.join('\n');
}

function getFiles() {
  const d = userData;
  return {
    'README':        `This is ${shortHost}.\nThe real hostname is ${shortHost}.\nYou're welcome.`,
    'hostname.conf': [
      `HOSTNAME=${shortHost}`,
      `FQDN=${shortHost}`,
      `COUNTRY=${d.country ?? ''}`,
      `TIMEZONE=${d.timezone ?? ''}`,
    ].join('\n') + '\n',
    'network.conf': [
      `IP=${d.ip ?? ''}`,
      `ASN=AS${d.asn ?? ''}`,
      `ISP=${d.asOrganization ?? ''}`,
      `DATACENTER=${d.colo ?? ''}`,
      `PROTOCOL=${d.httpProtocol ?? ''}`,
      `TLS=${d.tlsVersion ?? ''}`,
      `CIPHER=${d.tlsCipher ?? ''}`,
      `CITY=${d.city ?? ''}`,
      `REGION=${d.region ?? ''} (${d.regionCode ?? ''})`,
      `POSTAL=${d.postalCode ?? ''}`,
      `LAT=${d.latitude ?? ''}`,
      `LON=${d.longitude ?? ''}`,
    ].join('\n') + '\n',
    'is_this_real':  'yes',
    '.bash_history': `hostname\nhostname --fqdn\nhostname -i\nip -4 a\nip -6 a\ncat network.conf\nwhoami\nls\n`,
  };
}

const COMMANDS = {
  hostname(args) {
    if (!args.length)         return shortHost;
    if (args[0] === '--fqdn') return shortHost;
    if (args[0] === '-f')     return shortHost;
    if (args[0] === '-s')     return shortHost.split('.')[0];
    if (args[0] === '-i')     return getIP();
    if (args[0] === '-A')     return `${shortHost} ${shortHost}`;
    return err(`hostname: unknown option: ${args[0]}`);
  },
  ip(args) {
    const rest = [...args];
    let family = 0;
    if (rest[0] === '-4') { family = 4; rest.shift(); }
    else if (rest[0] === '-6') { family = 6; rest.shift(); }
    const sub = rest[0];
    if (!sub || sub === 'a' || sub === 'addr' || sub === 'address') {
      return buildIpAddr(family);
    }
    return err(`ip: unknown object "${sub}"\nTry "ip help".`);
  },
  whoami()   { return 'you'; },
  pwd()      { return '/home/you'; },
  id()       { return `uid=1000(you) gid=1000(you) groups=1000(you)`; },
  uname(args) {
    const node = userData.colo ? `${userData.colo.toLowerCase()}-edge` : shortHost;
    if (args[0] === '-a') return `Linux ${node} 6.1.0-cursed #1 SMP PREEMPT x86_64 GNU/Linux`;
    return 'Linux';
  },
  echo(args)  { return args.join(' '); },
  clear()     { return '__CLEAR__'; },
  help()      {
    return [
      'available commands:',
      '  hostname [-s|-i|-f|--fqdn|-A]',
      '  ip [-4|-6] [a|addr]',
      '  whoami, id, pwd, uname [-a]',
      '  ls, cat <file>',
      '  echo, clear, exit',
      '  sudo, ssh, ping',
    ].join('\n');
  },
  ls(args) {
    const files = getFiles();
    const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const keys = Object.keys(files).filter(k => all || !k.startsWith('.'));
    return keys.join('  ');
  },
  cat(args) {
    if (!args.length) return err('cat: missing operand');
    const name = args[0];
    const files = getFiles();
    if (files[name] !== undefined) return files[name];
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

function init() {
  input.focus();
  appendLine(`<span class="output-color">Last login: ${new Date().toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', hour12: false })} on ttys000</span>`);
  appendLine('');
  appendLine(`<span class="output-color">Welcome to ${shortHost}.</span>`);
  appendLine(`<span class="prompt-color">Try: <span class="cmd-color">hostname -i</span>, <span class="cmd-color">ip -4 a</span>, <span class="cmd-color">ls</span>, <span class="cmd-color">cat README</span>. Type <span class="cmd-color">help</span> for more.</span>`);
  appendLine('');
  renderInputLine();
}

fetch('/whoami')
  .then(r => r.json())
  .then(data => { userData = data; })
  .catch(() => {})
  .finally(init);
