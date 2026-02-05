async function loadPosts() {
  const response = await fetch('/api');
  const posts = await response.json();
  const main = document.querySelector('main');
  posts.forEach(post => {
    const article = document.createElement('article');
    article.innerHTML = `<h2>${post.title}</h2><p>${post.content}</p>`;
    main.appendChild(article);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
});
