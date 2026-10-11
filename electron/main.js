const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;
let server;

async function startLocalServer() {
  const next = require('next');
  const port = 38241;
  const nextApp = next({ dev: false, dir: path.join(__dirname, '..') });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(`http://127.0.0.1:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(`http://127.0.0.1:${port}`);
      } else {
        reject(err);
      }
    });
  });
}

async function createWindow() {
  const isDev = !app.isPackaged;
  let startUrl = 'http://localhost:3000';

  if (!isDev) {
    try {
      startUrl = await startLocalServer();
    } catch (err) {
      console.error('Failed to start embedded Next server:', err);
    }
  }

  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 960,
    minHeight: 640,
    title: 'Command Center',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#f8fafc',
    show: false,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
