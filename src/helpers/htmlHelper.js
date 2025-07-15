document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
});

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const preview = document.getElementById('preview');
  preview.innerHTML = '<p>Processing... Please wait.</p>';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    });

    const data = await response.json();

    if (!data.success) {
      let errorMessage = data.error || 'Unknown error occurred.';
      if (data.details) errorMessage += `<br><small>${data.details}</small>`;
      if (data.solution) errorMessage += `<br><br>Possible solution: ${data.solution}`;
      throw new Error(errorMessage);
    }

    displayPreview(data);
  } catch (error) {
    preview.innerHTML = `
      <div class="error-message">
        <h2>❌ Conversion Error</h2>
        <p>${error.message}</p>
      </div>
      <a href="/"><button>Try Again</button></a>
    `;
  }
}

function displayPreview(data) {
  const preview = document.getElementById('preview');
  let previewContent = '';

  if (data.files && data.files.length > 0) {
    if (data.fileType === 'txt') {
      previewContent = `
        <div class="text-preview">
          <iframe src="${data.files[0].url}" width="100%" height="400px"></iframe>
          <a href="${data.files[0].url}" download="${data.files[0].name}">
            <button class="download-btn">Download ${data.files[0].name}</button>
          </a>
        </div>
      `;
    } else {
      previewContent = `<div class="gallery">`;
      data.files.forEach(file => {
        previewContent += `
          <div class="gallery-item">
            ${file.url.endsWith('.jpg') || file.url.endsWith('.png') ? 
              `<img src="${file.url}" alt="Preview" />` : 
              `<div class="file-icon">📄 ${file.name}</div>`}
            <a href="${file.url}" download="${file.name}">
              <button class="download-btn">Download ${file.name}</button>
            </a>
          </div>
        `;
      });
      previewContent += `</div>`;
    }
  } else if (data.filename) {
    const fileUrl = `/output/${data.filename}`;
    previewContent = `
      <div class="single-file">
        ${data.fileType === 'txt' ? 
          `<iframe src="${fileUrl}" width="100%" height="400px"></iframe>` :
         data.fileType === 'pdf' ? 
          `<iframe src="${fileUrl}" width="100%" height="500px"></iframe>` :
          `<img src="${fileUrl}" alt="Preview" />`}
        <a href="${fileUrl}" download="${data.filename}">
          <button class="download-btn">Download ${data.filename}</button>
        </a>
      </div>
    `;
  }

  preview.innerHTML = `
    <h2>📥 ${data.title}</h2>
    ${previewContent}
  `;
}