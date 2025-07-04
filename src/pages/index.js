import React from 'react';
import Layout from '@theme/Layout';

export default function Home() {
  return (
    <Layout title="首页" description="部门软件与文档平台">
      <main style={{ padding: '2rem' }}>
        <h1>欢迎来到 SQE 部门网站</h1>
        <p>📘 查看 <a href="/docs/intro">操作文档</a></p>
        <p>⬇️ 下载最新安装包：<a href="/downloads/Setup.exe">点击下载</a></p>
      </main>
    </Layout>
  );
}
