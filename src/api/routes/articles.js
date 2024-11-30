const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const articlesSchema = new mongoose.Schema({
  article_title: { type: String },
  article_materials: { type: String },
  article_body: { type: String },
  article_img: { type: String },
  article_keywords: { type: String },
  article_liked_count: { type: Number, default: 0 },
  article_summary: { type: String },
  article_author_email: { type: String },
  article_author_name: { type: String },
  article_real_author_name: { type: String },
  article_author_id: { type: String },
  article_fonte: { type: String },
  article_published_date: { type: Date, default: Date.now },
  article_difficulty: { type: String, required: true },
  article_type: { type: String, required: true }
});

articlesSchema.index({ article_keywords: 'text' })

const Article = mongoose.model('Article', articlesSchema);

router.post('/cadastro', async (req, res) => {
  const article = req.body;
  if (article.article_difficulty) {
    article.article_difficulty = article.article_difficulty.charAt(0).toUpperCase() + article.article_difficulty.slice(1).toLowerCase();
  }
  if (article.article_type) {
    article.article_type = article.article_type.charAt(0).toUpperCase() + article.article_type.slice(1).toLowerCase();
  }
  try {
    const newArticle = await Article.create(article);
    console.log('Objeto salvo com sucesso!');
    res.json({ message: 'Artigo salvo com sucesso!', newArticle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/search', async (req, res) => {
  try {
    const { keywords, difficulty, type } = req.query;
    const filters = {};

    if (keywords) {
      filters.$text = { $search: keywords };
    }
    if (difficulty) {
      filters.article_difficulty = difficulty;
    }
    if (type) {
      filters.article_type = type;
    }

    const foundArticles = await Article.find(filters);

    res.status(200).json(foundArticles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/all', async (req, res) => {
  try {
    const foundArticles = await Article.find();
    console.log('Objetos encontrados com sucesso!');
    res.status(200).json(foundArticles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



router.get('/',  async (req, res) => {
  try {
    let foundArticles;

    foundArticles = await Article.find();

    // Se o usuário for um administrador, obtenha todos os artigos
    if (req.session.user && req.session.user.author_level === 'admin') {
      foundArticles = await Article.find();
    } else if (req.session.user) {
      // Se não for um administrador, obtenha apenas os artigos do usuário atual
      foundArticles = await Article.find({ article_author_id: req.session.user._id });
    } else {
      // Caso o usuário não esteja autenticado, retorne um erro ou uma mensagem apropriada
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    console.log('Objetos encontrados com sucesso!');
    res.status(200).json(foundArticles);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/like/:pid', async (req, res) => {
  const pid = req.params.pid;

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      pid,
      { $inc: { article_liked_count: 1 } },
      { new: true }
    );
    res.json({ message: 'Like adicionado com sucesso!', updatedArticle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:pid', async (req, res) => {
  const pid = req.params.pid;
  try {
    const foundArticle = await Article.findById(pid);
    console.log('Objeto encontrado com sucesso!');
    res.json({ message: 'Artigo encontrado com sucesso!', foundArticle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:pid', async (req, res) => {
  const pid = req.params.pid;
  const newArticle = req.body;

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      pid,
      {
        article_title: newArticle.article_title,
        article_body: newArticle.article_body,
        article_keywords: newArticle.article_keywords,
        article_summary: newArticle.article_summary,
        article_materials: newArticle.article_materials,
        article_img: newArticle.article_img,
        article_author_email: newArticle.article_author_email,
        article_author_name: newArticle.article_author_name,
        article_real_author_name: newArticle.article_real_author_name,
        article_fonte: newArticle.article_fonte,
        article_difficulty: newArticle.article_difficulty,
        article_type: newArticle.article_type,
        article_featured: newArticle.article_featured, // Optional: Ensure this exists in your schema
      },
      { new: true } // Return the updated document
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: 'Artigo não encontrado!' });
    }

    console.log('Artigo Atualizado:', updatedArticle);
    res.json({ message: 'Artigo alterado com sucesso!', updatedArticle });
  } catch (err) {
    console.error('Erro ao atualizar artigo:', err.message);
    res.status(400).json({ message: 'Erro ao atualizar artigo.', error: err.message });
  }
});

router.delete('/delete/:articleId', async (req, res) => {
  const articleId = req.params.articleId;
  try {
    const deletedArticle = await Article.findByIdAndDelete(articleId);
    res.json({ message: 'Artigo excluído com sucesso!', deletedArticle });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;