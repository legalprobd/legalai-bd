const fs = require('fs');
const files = [
  'src/app/court-fee/page.tsx',
  'src/app/billing/trust/page.tsx',
  'src/app/conflict-check/page.tsx',
  'src/app/research/page.tsx',
  'src/app/analytics/page.tsx',
  'src/app/contract-review/page.tsx',
  'src/app/chamber/settings/page.tsx',
  'src/app/super-admin/page.tsx',
  'src/app/billing/page.tsx',
  'src/app/clients/page.tsx',
  'src/app/tasks/page.tsx',
  'src/app/calendar/page.tsx',
  'src/components/layout/Sidebar.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/\sdark:[^\s"'`]+/g, '');
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Cleaned dark: from', file);
  }
}
