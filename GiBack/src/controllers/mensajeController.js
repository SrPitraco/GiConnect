const Mensaje = require('../models/Mensaje');

// Enviar mensaje
exports.create = async (req, res) => {
  try {
    const data = {
      de: req.userId,
      para: req.body.para,      // ID del destinatario
      texto: req.body.texto,
      mediaUrl: req.body.mediaUrl,
      tipo: req.body.tipo || 'texto'
    };
    const msg = await Mensaje.create(data);
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar conversación con otro usuario
exports.listConversation = async (req, res) => {
  try {
    const otroId = req.params.userId;
    const msgs = await Mensaje.find({
      $or: [
        { de: req.userId, para: otroId },
        { de: otroId, para: req.userId }
      ]
    }).sort('fecha');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
