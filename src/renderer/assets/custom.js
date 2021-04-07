const { remote } = require('electron')
const { Menu } = remote

const menu = Menu.buildFromTemplate([
  { label: '重新加载', role: 'reload' },
  { type: 'separator' },
  { label: '检查', role: 'toggleDevTools' }
]);

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup({ window: remote.getCurrentWindow() })
}, false);