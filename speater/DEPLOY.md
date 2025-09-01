# Speater 部署指南

## 方案A：直接挂在现有站点的子路径 `/speater/`

### 已完成的配置
- ✅ 设置了 Vite 配置：`base: '/speater/'` 
- ✅ 构建了生产版本静态文件在 `dist/` 目录
- ✅ 创建了 Apache/.htaccess 配置文件
- ✅ 准备了 Nginx 配置示例

### 部署步骤

#### 对于 Nginx 服务器：

1. **上传文件**：
   ```bash
   # 将 dist 整个目录上传到服务器
   scp -r dist/ user@yourserver:/var/www/mysqe.work/speater
   ```

2. **配置 Nginx**：
   在你的 Nginx 站点配置中添加以下内容：
   ```nginx
   location /speater/ {
     alias /var/www/mysqe.work/speater/;
     try_files $uri $uri/ /speater/index.html;
     add_header Cache-Control "public, max-age=31536000, immutable";
   }
   ```

3. **重载 Nginx**：
   ```bash
   sudo nginx -t
   sudo nginx -s reload
   ```

#### 对于 Apache/cPanel/虚拟主机（包括 WordPress）：

1. **上传文件**：
   - 将 `dist/` 目录中的所有文件上传到 `/public_html/speater/` 目录
   - 确保 `.htaccess` 文件也被上传

2. **验证 .htaccess**：
   确保 `/public_html/speater/.htaccess` 内容为：
   ```apache
   RewriteEngine On
   RewriteBase /speater/
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /speater/index.html [L]
   ```

### 访问地址

部署完成后，访问：
**https://mysqe.work/speater/**

### 验证部署

1. 访问主页应该能正常加载
2. 尝试刷新页面，不应出现 404 错误
3. 测试文件上传和播放功能

### 注意事项

1. **不会影响现有站点**：此方案只在 `/speater/` 子路径下工作
2. **完全免费版本**：无订阅按钮，纯净的 v8 版本
3. **本地运行**：所有音频处理都在浏览器本地进行，不上传到服务器
4. **兼容性好**：支持各种主流浏览器

### 构建命令记录

如需重新构建：
```bash
cd speater
npm install
npm run build
```

构建产物在 `dist/` 目录中。