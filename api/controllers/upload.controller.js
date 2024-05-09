const UserModel = require("../models/user.model");
const fs = require("fs");
const path = require('path')
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline)
const { uploadErrors } = require("../utils/errors.utils")
const { writeFileSync } = require('node:fs')

module.exports.uploadProfil = async (req, res) => {

  const theName = req.file.originalname
  const goodName = theName.replace(/\s/g, "_")
  console.log("====> le nom du fichier" + goodName);
  const extension = theName.substring(theName.lastIndexOf('.') + 1);
  console.log("====> l'extension du fichier à uploader est: " + extension);

  try {
    if (
      extension != "jpg" &&
      extension != "png" &&
      extension != "jpeg"
    )
      throw Error("Invalid file type");

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(400).json({ errors });
  }

  const fileName = goodName;


  try {

    const destFilePath = `${__dirname}/../../client/public/uploads/profil/${fileName}`
    await writeFileSync(destFilePath, req.file.buffer)
    console.log('L\'image a été téléchargée avec succès.');
  } catch (error) {
    console.error('Une erreur s\'est produite lors de l\'upload de l\'image:', error);
  }

  try {
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + req.file.originalname.split(" ").join("_") } },
      { new: true, upsert: true, setDefaultsOnInsert: true })
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));

  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
