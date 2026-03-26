import { app, BrowserWindow } from 'electron';
import path from 'path';

// Đặt cờ Packaged
if (app.isPackaged) {
  process.env.NODE_ENV = 'production';
}

// Khởi chạy Express backend server
require('../src/index');

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "POS System",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (app.isPackaged) {
    // Production: express chạy ở port 3000 và serve file tĩnh
    setTimeout(() => {
      mainWindow?.loadURL('http://localhost:3000');
    }, 1000);
  } else {
    // Development: Tải trực tiếp Vite localhost
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
