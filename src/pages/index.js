import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="SQM专家 | 供应商质量管理" description="专业的供应商质量管理解决方案与行业洞察">
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
            SQM专家
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            margin: '0 0 1rem 0',
            fontWeight: 300,
            opacity: 0.9
          }}>
            供应商质量管理领域专家
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: '2rem', 
            textAlign: 'center', 
            maxWidth: '700px', 
            fontSize: '1.2rem', 
            lineHeight: '1.6',
            margin: '0 auto 2rem auto'
          }}>
            十年+质量管理经验 • 专业工具开发 • 行业趋势洞察 • 实践案例分享
          </p>
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
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>SQM工具箱</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>质量管理必备工具与模板</p>
          </Link>
          
          <Link 
            to="/docs/knowledge/sqm-fundamentals"
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
            <span style={{ fontSize: '3rem' }}>📚</span>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>专业知识库</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>SQM理论基础与最佳实践</p>
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
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>操作手册</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>详细操作指南与流程</p>
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link 
            to="/blog" 
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.8rem 2rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            📝 阅读专业博客
          </Link>
          <Link 
            to="/docs/technical" 
            style={{ 
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.5)',
              color: '#fff',
              padding: '0.8rem 2rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
          >
            📖 技术文档
          </Link>
        </div>
      </main>
    </Layout>
  );
}
