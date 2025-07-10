# 技术文档

这里提供各种技术架构和开发文档。

## 系统架构

### 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端服务      │    │   数据库        │
│   (React/Vue)   │◄──►│   (Spring Boot) │◄──►│   (MySQL/Redis) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈

- **前端**: React 18, TypeScript, Ant Design
- **后端**: Spring Boot 3, Java 17, MyBatis
- **数据库**: MySQL 8.0, Redis 7.0
- **部署**: Docker, Kubernetes

## API文档

### 用户管理API

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### 用户信息获取
```
GET /api/user/profile
Authorization: Bearer {token}
```

### 数据管理API

#### 数据查询
```
GET /api/data?page=1&size=10&sort=id,desc
Authorization: Bearer {token}
```

#### 数据创建
```
POST /api/data
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "string",
  "description": "string"
}
```

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 角色表 (roles)
```sql
CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 部署指南

### 开发环境

1. **克隆代码**
   ```bash
   git clone https://github.com/mysqe/project.git
   cd project
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务**
   ```bash
   npm run dev
   ```

### 生产环境

1. **构建应用**
   ```bash
   npm run build
   ```

2. **Docker部署**
   ```bash
   docker build -t mysqe-app .
   docker run -p 8080:8080 mysqe-app
   ```

## 性能优化

### 前端优化

- 代码分割和懒加载
- 图片压缩和CDN加速
- 缓存策略优化

### 后端优化

- 数据库索引优化
- 缓存机制实现
- 连接池配置

### 监控告警

- 应用性能监控
- 错误日志收集
- 系统资源监控 