import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron'


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function configWindow() {
  Menu.setApplicationMenu(null)
}

function createWindow() {
  configWindow();
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    width: 1000,
    useContentSize: true,
    resizable: false,
    title: "索引可视化实验教学平台",
    webPreferences: { // 添加该属性
      nodeIntegration: true,
      enableRemoteModule: true
    },
  })
  mainWindow.maximize()
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

var childWin;
ipcMain.on('create-modal', () => {
  childWin = new BrowserWindow({
    width: 1200,
    height: 900,
    resizable: false,
    title: '操作记录',
    modal: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })
  childWin.maximize();
  childWin.loadURL(winURL + '#/MainPage/History');
  childWin.on('closed', () => {
    childWin = null;
  })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
