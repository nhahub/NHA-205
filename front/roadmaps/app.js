(() => {
  const roleGrid = document.getElementById('role-grid');
  const skillGrid = document.getElementById('skill-grid');
  const searchInput = document.getElementById('search-input');

  // Role-based roadmaps
  const ROLES = [
    { key: 'frontend', title: 'Frontend Developer', url: 'https://roadmap.sh/frontend', tag: 'role web javascript html css' },
    { key: 'backend', title: 'Backend Developer', url: 'https://roadmap.sh/backend', tag: 'role web server database api' },
    { key: 'full-stack', title: 'Full-Stack Developer', url: 'https://roadmap.sh/full-stack', tag: 'role web frontend backend' },
    { key: 'devops', title: 'DevOps Engineer', url: 'https://roadmap.sh/devops', tag: 'role infrastructure ci cd clouds' },
    { key: 'android', title: 'Android Developer', url: 'https://roadmap.sh/android', tag: 'role mobile kotlin java' },
    { key: 'ios', title: 'iOS Developer', url: 'https://roadmap.sh/ios', tag: 'role mobile swift' },
    { key: 'qa', title: 'QA Engineer', url: 'https://roadmap.sh/qa', tag: 'role testing automation' },
    { key: 'cyber-security', title: 'Cyber Security', url: 'https://roadmap.sh/cyber-security', tag: 'role security' },
    { key: 'ux-design', title: 'UX Design', url: 'https://roadmap.sh/ux-design', tag: 'role design product' },
    { key: 'blockchain', title: 'Blockchain Developer', url: 'https://roadmap.sh/blockchain', tag: 'role web3 solidity' },
    { key: 'postgres-dba', title: 'PostgreSQL DBA', url: 'https://roadmap.sh/postgresql-dba', tag: 'role database admin' },
    { key: 'computer-science', title: 'Computer Science', url: 'https://roadmap.sh/computer-science', tag: 'role cs fundamentals' },
    { key: 'data-engineer', title: 'Data Engineer', url: 'https://roadmap.sh/data-engineer', tag: 'role data pipelines' },
    { key: 'game-developer', title: 'Game Developer', url: 'https://roadmap.sh/game-developer', tag: 'role games' },
    { key: 'ai-data-scientist', title: 'AI & Data Scientist', url: 'https://roadmap.sh/ai-data-scientist', tag: 'role ai ml data' },
    { key: 'prompt-engineer', title: 'Prompt Engineer', url: 'https://roadmap.sh/prompt-engineering', tag: 'role ai llm' },
    { key: 'cloud', title: 'Cloud Engineer', url: 'https://roadmap.sh/cloud', tag: 'role aws azure gcp' },
    { key: 'cybersecurity-expert', title: 'Cybersecurity Expert', url: 'https://roadmap.sh/cyber-security', tag: 'role security analyst' },
    { key: 'terraform', title: 'Terraform Practitioner', url: 'https://roadmap.sh/terraform', tag: 'role devops iac' },
  ];

  // Skill-based roadmaps
  const SKILLS = [
    { key: 'javascript', title: 'JavaScript', url: 'https://roadmap.sh/javascript', tag: 'skill language web' },
    { key: 'typescript', title: 'TypeScript', url: 'https://roadmap.sh/typescript', tag: 'skill language web' },
    { key: 'nodejs', title: 'Node.js', url: 'https://roadmap.sh/nodejs', tag: 'skill runtime backend' },
    { key: 'react', title: 'React', url: 'https://roadmap.sh/react', tag: 'skill library frontend' },
    { key: 'angular', title: 'Angular', url: 'https://roadmap.sh/angular', tag: 'skill framework frontend' },
    { key: 'vue', title: 'Vue', url: 'https://roadmap.sh/vue', tag: 'skill framework frontend' },
    { key: 'html', title: 'HTML', url: 'https://roadmap.sh/html', tag: 'skill language web' },
    { key: 'css', title: 'CSS', url: 'https://roadmap.sh/css', tag: 'skill language web' },
    { key: 'python', title: 'Python', url: 'https://roadmap.sh/python', tag: 'skill language' },
    { key: 'java', title: 'Java', url: 'https://roadmap.sh/java', tag: 'skill language' },
    { key: 'golang', title: 'Go', url: 'https://roadmap.sh/golang', tag: 'skill language' },
    { key: 'rust', title: 'Rust', url: 'https://roadmap.sh/rust', tag: 'skill language systems' },
    { key: 'sql', title: 'SQL', url: 'https://roadmap.sh/sql', tag: 'skill database' },
    { key: 'mongodb', title: 'MongoDB', url: 'https://roadmap.sh/mongodb', tag: 'skill database nosql' },
    { key: 'redis', title: 'Redis', url: 'https://roadmap.sh/redis', tag: 'skill cache' },
    { key: 'linux', title: 'Linux', url: 'https://roadmap.sh/linux', tag: 'skill os' },
    { key: 'docker', title: 'Docker', url: 'https://roadmap.sh/docker', tag: 'skill container' },
    { key: 'kubernetes', title: 'Kubernetes', url: 'https://roadmap.sh/kubernetes', tag: 'skill orchestration' },
    { key: 'git-github', title: 'Git & GitHub', url: 'https://roadmap.sh/git-github', tag: 'skill vcs' },
    { key: 'aws', title: 'AWS', url: 'https://roadmap.sh/aws', tag: 'skill cloud' },
    { key: 'shell/bash', title: 'Shell / Bash', url: 'https://roadmap.sh/shell-bash', tag: 'skill ' },
    { key: 'php', title: 'PHP', url: 'https://roadmap.sh/php', tag: 'skill language' },
    { key: 'system-design', title: 'System Design', url: 'https://roadmap.sh/system-design', tag: 'skill architecture' },
    { key: 'laravel', title: 'Laravel', url: 'https://roadmap.sh/laravel', tag: 'skill framework backend' },
    { key: 'graphql', title: 'GraphQL', url: 'https://roadmap.sh/graphql', tag: 'skill api' },
  ];

  function createElement(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.className = options.className;
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    if (options.attrs) Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function renderCards(container, items) {
    container.innerHTML = '';
    items.forEach((rm) => {
      const card = createElement('article', { className: 'card' });
      const badge = createElement('div', { className: 'badge', html: '📍 Roadmap · ' + rm.key });
      const title = createElement('h3', { className: 'title', text: rm.title });
      const desc = createElement('p', { className: 'desc', text: 'Learn the skills and topics for ' + rm.title + '.' });
      const actions = createElement('div', { className: 'actions' });
      const link = createElement('a', { className: 'btn', text: 'Open', attrs: { href: rm.url, target: '_blank', rel: 'noopener noreferrer' } });
      const ext = createElement('span', { className: 'ext', text: 'roadmap.sh' });
      actions.append(link, ext);
      card.append(badge, title, desc, actions);
      container.appendChild(card);
    });
  }

  function filterAndRender() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const roleFiltered = !q ? ROLES : ROLES.filter((r) => `${r.title} ${r.key} ${r.tag}`.toLowerCase().includes(q));
    const skillFiltered = !q ? SKILLS : SKILLS.filter((r) => `${r.title} ${r.key} ${r.tag}`.toLowerCase().includes(q));
    renderCards(roleGrid, roleFiltered);
    renderCards(skillGrid, skillFiltered);
  }

  searchInput.addEventListener('input', filterAndRender);
  filterAndRender();
})();


