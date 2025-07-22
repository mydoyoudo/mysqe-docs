// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SQM专家 | 供应商质量管理',
  tagline: '专业的供应商质量管理解决方案与行业洞察',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mysqe.work',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mysqe', // Usually your GitHub org/user name.
  projectName: 'mysqe.work', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',



  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mysqe/mysqe.work/tree/main/',
          // Disable auto-generated navigation
          routeBasePath: '/docs',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mysqe/mysqe.work/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: 'description', content: 'SQM供应商质量管理专家 - 提供专业的质量管理工具、行业知识、趋势洞察和实践经验分享' },
        { name: 'keywords', content: 'SQM, 供应商质量管理, 质量控制, 供应链管理, 质量工具, 行业洞察, 质量体系' },
      ],
      // Replace with your project's social card
      image: 'img/mysqe-social-card.jpg',
      navbar: {
        title: 'SQM专家',
        logo: {
          alt: 'SQM专家 Logo',
          src: 'img/logo.svg',
        },
        items: [
          { to: '/docs/tools', label: '🔧 SQM工具箱', position: 'left' },
          { to: '/docs/knowledge', label: '📚 知识库', position: 'left' },
          { to: '/docs/insights', label: '📈 行业洞察', position: 'left' },
          { to: '/docs/about', label: '👤 关于我', position: 'left' },
          { to: '/blog', label: '📝 博客', position: 'left' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'SQM专业服务',
            items: [
              {
                label: 'SQM工具箱',
                to: '/docs/tools',
              },
              {
                label: '专业知识库',
                to: '/docs/knowledge',
              },
              {
                label: '行业洞察',
                to: '/docs/insights',
              },
            ],
          },
          {
            title: '关于专家',
            items: [
              {
                label: '个人简介',
                to: '/docs/about',
              },
              {
                label: '实践博客',
                to: '/blog',
              },
            ],
          },
          {
            title: '联系方式',
            items: [
              {
                label: '邮箱咨询',
                href: 'mailto:contact@sqm-expert.com',
              },
              {
                label: 'LinkedIn',
                href: 'https://linkedin.com/in/sqm-expert',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} SQM专家. All rights reserved.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
