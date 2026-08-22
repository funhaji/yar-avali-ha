const fs = require('fs');

let code = fs.readFileSync('app/blog/[slug]/page.tsx', 'utf8');

// 1. Add redirect_url to SQL query
code = code.replace(
  'p.video_provider,',
  'p.video_provider,\\n      p.redirect_url,'
);

// 2. Parse Markdown function
const markdownFix = \          <div 
            className="prose prose-lg max-w-none text-ink text-lg leading-relaxed mb-12"
            style={{ direction: 'rtl' }}
            dangerouslySetInnerHTML={{ __html: post.content
              // Parse images
              .replace(/!\\\[([^\\]]*)\\\]\\(([^)]+)\\)/g, '<img src="\\" alt="\\" style="max-width:100%; border-radius:8px; margin: 1.5rem auto; display: block;" />')
              // Parse links
              .replace(/\\\[([^\\]]+)\\\]\\(([^)]+)\\)/g, (match, text, url) => {
                const finalUrl = url.startsWith('http') ? url : 'https://' + url;
                return '<a href="' + finalUrl + '" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9; text-decoration:underline; font-weight:600;">' + text + '</a>';
              })
              .replace(/\\n/g, '<br>') 
            }}
          />\;

code = code.replace(
  /<div\\s+className="prose prose-lg max-w-none text-ink text-lg leading-relaxed mb-12"\\s+style=\\{\\{ direction: 'rtl' \\}\\}\\s+dangerouslySetInnerHTML=\\{\\{ __html: post\\.content\\.replace\\(\\/\\\\n\\/g, '<br>'\\) \\}\\}\\s+\\/>/m,
  markdownFix
);

// 3. Add the redirect button
const buttonFix = \          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {post.redirect_url && (
            <div className="mb-6">
              <a 
                href={post.redirect_url.startsWith('http') ? post.redirect_url : 'https://' + post.redirect_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="button button-primary"
                style={{ display: 'inline-flex', padding: '0.6rem 1.2rem', borderRadius: '8px', fontSize: '1rem', background: 'var(--teal)', color: 'white', fontWeight: 'bold' }}
              >
                ??? ???? ????
              </a>
            </div>
          )}\;

code = code.replace(
  '<h1 className="text-4xl font-bold mb-4">{post.title}</h1>',
  buttonFix
);

fs.writeFileSync('app/blog/[slug]/page.tsx', code);
