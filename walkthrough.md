# Walkthrough: Deploy POS lên Render.com

## Tóm tắt thay đổi

| File | Thay đổi |
|------|----------|
| [package.json](file:///c:/Users/tavin/Downloads/POS/package.json) | **[NEW]** Root monorepo config với `build` và `start` scripts |
| [render.yaml](file:///c:/Users/tavin/Downloads/POS/render.yaml) | **[NEW]** Render Blueprint tự động cấu hình service |
| [index.ts](file:///c:/Users/tavin/Downloads/POS/backend/src/index.ts) | Xóa Electron code, fix frontend path, bind `0.0.0.0` |
| 15 frontend [.tsx](file:///c:/Users/tavin/Downloads/POS/frontend/src/App.tsx) files | Thay `http://localhost:3000/api/...` → `/api/...` |

## Kết quả test

- ✅ Frontend build thành công (`vite build`)
- ✅ Backend compile thành công (`tsc`, không lỗi)
- ✅ Không còn hardcoded `localhost:3000` trong frontend

## Hướng dẫn Deploy lên Render.com

### Bước 1: Đẩy code lên GitHub

```bash
# Trong thư mục POS
git add -A
git commit -m "Configure for Render.com deployment"
git push origin main
```

> [!IMPORTANT]
> Nếu chưa có repo GitHub, tạo repo mới trên github.com rồi:
> ```bash
> git remote add origin https://github.com/<your-username>/POS.git
> git push -u origin main
> ```

### Bước 2: Tạo tài khoản Render.com
1. Vào [render.com](https://render.com) → **Sign Up** (có thể dùng GitHub account)

### Bước 3: Tạo Web Service
1. Click **"New +"** → **"Web Service"**
2. Chọn **"Build and deploy from a Git repository"**
3. Kết nối GitHub → chọn repo POS
4. Cấu hình:
   - **Name**: `pos-system` (hoặc tên tùy thích)
   - **Region**: Singapore (gần VN nhất)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
5. Thêm **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `file:./dev.db` |
   | `JWT_SECRET` | `pos_super_secret_key_2024` |
6. Click **"Create Web Service"**

### Bước 4: Chờ deploy
- Render sẽ tự build và deploy (~3-5 phút lần đầu)
- Sau khi xong, bạn sẽ có URL dạng: `https://pos-system-xxxx.onrender.com`

> [!NOTE]
> Free plan của Render sẽ tự tắt server sau 15 phút không hoạt động. Lần truy cập đầu tiên sau khi tắt sẽ mất ~30-60 giây để khởi động lại. Dữ liệu SQLite sẽ reset mỗi lần deploy mới.
