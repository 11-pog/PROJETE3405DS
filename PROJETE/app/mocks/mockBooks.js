const TOTAL_LIVROS = 100; // isso aqui simula uma API enquanto a gente ainda não tem o back end

export const livrosMock = Array.from({ length: TOTAL_LIVROS }, (_, i) => ({
  id: i + 1,
  title: `Livro ${i + 1}`,
  author: `Autor ${i + 1}`,
  cover: `https://picsum.photos/seed/livro${i + 1}/200/300`, // imagem aleatória
  description: `Este é um resumo fictício do Livro ${i + 1}. Uma leitura envolvente sobre temas imaginários.`,
}));

export const fetchLivrosMock = (page, pageSize) => {
  return new Promise((resolve) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = livrosMock.slice(start, end);

    setTimeout(() => {
      resolve(data);
    }, 800); // simula atraso
  });
};
