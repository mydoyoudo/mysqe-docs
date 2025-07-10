// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'mysqe',
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
        { name: 'description', content: '部门文档下载中心 - 提供各类技术文档、操作手册和软件下载' },
        { name: 'keywords', content: '文档下载, 技术文档, 操作手册, 软件下载, 部门文档' },
      ],
      // Replace with your project's social card
      image: 'img/mysqe-social-card.jpg',
      navbar: {
        title: 'mysqe',
        logo: {
          alt: 'mysqe Logo',
          src: 'img/logo.svg',
        },
        items: [
          { to: '/docs/software', label: '软件下载', position: 'left' },
          { to: '/docs/manuals', label: '操作手册', position: 'left' },
          { to: '/docs/technical', label: '技术文档', position: 'left' },
          { to: '/docs/forms', label: '表格模板', position: 'left' },
          { to: '/blog', label: '更新日志', position: 'left' },

        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '文档分类',
            items: [
              {
                label: '软件下载',
                to: '/docs/software',
              },
              {
                label: '操作手册',
                to: '/docs/manuals',
              },
              {
                label: '技术文档',
                to: '/docs/technical',
              },
            ],
          },
          {
            title: '其他资源',
            items: [
              {
                label: '表格模板',
                to: '/docs/forms',
              },
              {
                label: '更新日志',
                to: '/blog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} mysqe.work`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
