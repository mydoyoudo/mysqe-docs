import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="mysqe | 供应商质量管理" description="专业的供应商质量管理解决方案与行业洞察">
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            fontWeight: 700, 
            fontSize: '3.5rem', 
            margin: '0 0 1rem 0', 
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            mysqe
          </h1>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem', 
          width: '100%', 
          maxWidth: '1000px',
          marginBottom: '3rem'
        }}>
          <Link 
            to="/docs/software"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '2rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              textDecoration: 'none',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: '#fff',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '3rem' }}>🔧</span>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>工具箱</h3>
          </Link>
          
          <Link 
            to="/docs/manuals"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '2rem',
              textAlign: 'center',
              fontSize: '1.1rem',
              textDecoration: 'none',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: '#fff',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '3rem' }}>📋</span>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>手册</h3>
          </Link>
        </div>
      </main>
    </Layout>
  );
}
