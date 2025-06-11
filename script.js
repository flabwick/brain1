let draggedItem = null;

function toggleFolder(e) {
  const folder = e.target.closest('li.folder');
  if (folder && e.target.classList.contains('label')) {
    folder.classList.toggle('open');
  }
}

document.addEventListener('dragstart', (e) => {
  const li = e.target.closest('li');
  if (li) {
    draggedItem = li;
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  let targetFolder = e.target.closest('li.folder');
  const root = document.getElementById('file-tree');
  if (!targetFolder) {
    targetFolder = root; // drop on root
  }
  if (draggedItem) {
    const container = targetFolder.tagName === 'UL' ? targetFolder : targetFolder.querySelector('ul') || targetFolder.appendChild(document.createElement('ul'));
    container.appendChild(draggedItem);
    draggedItem = null;
  }
});

document.getElementById('file-tree').addEventListener('click', toggleFolder);

