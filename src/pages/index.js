import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="mysqe" description="提供各类技术文档、操作手册和软件下载">
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        padding: '2rem'
      }}>
        <h1 style={{ fontWeight: 300, fontSize: '3rem', margin: '-4rem 0 2rem 0', color: '#32BEA6' }}>mysqe</h1>
        <p style={{ color: '#888', marginBottom: '3rem', textAlign: 'center', maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          提供便捷的文档支持（技术文档、操作手册、软件下载和表格模板）。
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem', 
          width: '100%', 
          maxWidth: '800px',
          marginBottom: '3rem'
        }}>
          <Link 
            className="button button--primary" 
            to="/docs/software"
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>💾</span>
            软件下载
          </Link>
          
          <Link 
            className="button button--secondary" 
            to="/docs/manuals"
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>📖</span>
            操作手册
          </Link>
          
          <Link 
            className="button button--outline" 
            to="/docs/technical"
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>🔧</span>
            技术文档
          </Link>
          
          <Link 
            className="button button--outline" 
            to="/docs/forms"
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>📋</span>
            表格模板
          </Link>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Link className="button button--outline" to="/blog" style={{ marginRight: '1rem' }}>
            查看更新日志
          </Link>
        </div>
      </main>
    </Layout>
  );
}
