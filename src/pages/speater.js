import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

export default function SpeaterPage() {
  useEffect(() => {
    // 直接跳转到构建好的 Speater 应用
    window.location.href = '/speater-app/app.html';
  }, []);

  return (
    <Layout
      title="Speater - 音频学习工具"
      description="专业的音频播放和学习工具，支持变速播放、A-B循环、字幕同步等功能">
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className="text--center margin-bottom--lg">
              <h1>正在加载 Speater...</h1>
              <p>如果页面没有自动跳转，请<a href="/speater-app/app.html">点击这里</a>访问 Speater 应用。</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}