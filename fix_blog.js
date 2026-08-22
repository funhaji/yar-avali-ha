const fs = require('fs');
let code = fs.readFileSync('components/admin/BlogManager.tsx', 'utf8');

const toolbarHTML = \
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => {
                  const content = formData.content + '\\n\\n[??? ????](https://...)';
                  setFormData({ ...formData, content });
                }} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200">
                  ?? ?????? ????
                </button>
                <button type="button" onClick={() => {
                  const content = formData.content + '\\n\\n![????? ?????](https://...)';
                  setFormData({ ...formData, content });
                }} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200">
                  ??? ?????? ????? ?? ???
                </button>
                <button type="button" onClick={() => {
                  const content = formData.content + '\\n\\n**??? ????**';
                  setFormData({ ...formData, content });
                }} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200">
                  ????
                </button>
              </div>
              <textarea\;

code = code.replace(
  '            <div>\\n              <label className="block font-medium mb-2">????? *</label>\\n              <textarea',
  '            <div>\\n              <label className="block font-medium mb-2">????? *</label>' + toolbarHTML
);

fs.writeFileSync('components/admin/BlogManager.tsx', code);
