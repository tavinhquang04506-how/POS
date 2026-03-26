"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Đặt cờ Packaged
if (electron_1.app.isPackaged) {
    process.env.NODE_ENV = 'production';
}
// Khởi chạy Express backend server
require('../src/index');
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        title: "POS System",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    if (electron_1.app.isPackaged) {
        // Production: express chạy ở port 3000 và serve file tĩnh
        setTimeout(() => {
            mainWindow?.loadURL('http://localhost:3000');
        }, 1000);
    }
    else {
        // Development: Tải trực tiếp Vite localhost
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
