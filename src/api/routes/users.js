const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};


router.use(cors(corsOptions));

const usersSchema = new mongoose.Schema({
  author_name: String,
  author_email: String,
  author_user: String,
  author_pwd: String,
  author_level: String,
  author_status: Boolean,
  author_create_date: { type: Date, default: Date.now },
  author_address: String,
  author_instagram: String,
  author_occupation: String,
  author_pinterest: String,
  author_bio: String,
  author_pic: String,
});

const User = mongoose.model('User', usersSchema);


router.post('/cadastro', async (req, res) => {
  const user = req.body;
  
  console.log("Tentativa de cadastro", user)

  try {
    if (user.author_pwd) {
      const hashedPassword = await bcrypt.hash(user.author_pwd, 10);
      user.author_pwd = hashedPassword;
    }
 
    const newUser = await User.create(user);
    console.log('Objeto salvo com sucesso!');
    res.json({ message: 'Usuário salvo com sucesso!', newUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Tentativa de login:', username);

  try {
    const user = await User.findOne({ author_user: username });

    if (user && user.author_status) {
      const verifyPassword = await bcrypt.compare(password, user.author_pwd);
      if(verifyPassword){
        req.session.user = {
          _id: user._id,
          author_name: user.author_name,
          author_user: user.author_user,
          author_email: user.author_email,
          author_level: user.author_level,
          author_address: user.author_address,
          author_instagram: user.author_instagram,
          author_occupation: user.author_occupation,
          author_pinterest: user.author_pinterest,
          author_bio: user.author_bio,
          author_pic: user.author_pic,
        };
        res.status(200).json({ message: 'Login bem sucecido!'})
      } 
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/session', (req, res) => {
  try {
    if (req.session && req.session.user) {
      res.status(200).json({ user: req.session.user });
    } else {
      res.status(200).json({ user: null });
    }
  } catch (error) {
    console.error('Erro ao obter detalhes da sessão:', error.message);
    res.status(500).json({ error: 'Erro ao obter detalhes da sessão' });
  }
});


router.post('/logout', (req, res) => {
  req.session.destroy ((err) => {
    if (err) {
      console.error('Erro ao encerrar a sessão:', err);
      res.status(500).json({ error: 'Erro ao encerrar a sessão' });
    } else {
      res.status(200).json({ message: 'Logout bem-sucedido!' });
    }
  });
});

router.get('/getAll', async (req, res) => {
  try {
    const users = await User.find();
    console.log('Objetos encontrados com sucesso!');
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:pid', async (req, res) => {
  const pid = req.params.pid;
  try {
    const foundUser = await User.findById( pid );
    console.log('Objeto encontrado com sucesso!');
    res.json({ message: 'Usuário encontrado com sucesso!', foundUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:pid', async (req, res) => {
  const pid = req.params.pid;
  const newUser = req.body;
  console.log(newUser);

  if (newUser.author_pwd) {
    const hashedPassword = await bcrypt.hash(newUser.author_pwd, 10);
    newUser.author_pwd = hashedPassword;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(pid, 
      { 
        author_name: newUser.author_name, 
        author_email: newUser.author_email,
        author_pwd: newUser.author_pwd,
        author_level: newUser.author_level,
        author_status: newUser.author_status,
      }, { new: true });
    console.log('Objeto Atualizado:', updatedUser);
    res.json({ message: 'Usuário alterado com sucesso!', updatedUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:pid', async (req, res) => {
  const pid = req.params.pid;
  try {
    const deletedUser = await User.findByIdAndDelete(pid);
    console.log('Objeto deletado:', deletedUser);
    res.json({ message: 'Usuário deletado com sucesso!', deletedUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




module.exports = router;