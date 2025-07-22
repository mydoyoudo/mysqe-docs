// @ts-check

const sidebars = {
  docs: [
    'software',
    'forms',
    'manuals',
    'technical',
    {
      type: 'category',
      label: '🔧 SQM工具箱',
      items: ['tools/quality-tools', 'tools/audit-templates', 'tools/kpi-dashboard'],
    },
    {
      type: 'category', 
      label: '📚 专业知识库',
      items: ['knowledge/sqm-fundamentals', 'knowledge/quality-standards', 'knowledge/best-practices'],
    },
  ],
};

export default sidebars;

