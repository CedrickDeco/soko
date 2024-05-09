const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const { promisify } = require("util");
const { uploadErrors } = require("../utils/errors.utils");
const { writeFileSync } = require('node:fs')

module.exports.readPost = async (req, res) => {
  const posts = await PostModel.find().sort({ createdAt: -1 })
  res.status(200).json(posts);
};

module.exports.createPost = async (req, res) => {

  const fileName = req.body.posterId + Date.now() + '.jpg'

  if (req.file != null) {
    const name = req.file.originalname
    const extension = name.substring(name.lastIndexOf('.') + 1);
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

    const fileName = req.body.posterId + Date.now() + '.jpg'

    try {

      const destFilePath = `${__dirname}/../../client/public/uploads/posts/${fileName}`
      await writeFileSync(destFilePath, req.file.buffer)
      console.log('L\'image a été téléchargée avec succès.');
    } catch (error) {
      console.error('Une erreur s\'est produite lors de l\'upload de l\'image:', error);
    }
  }



  const newPost = new postModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file !== null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const updatedRecord = {
    message: req.body.message,
  };

  try {
    await PostModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updatedRecord },
      { new: true, upsert: true, setDefaultsOnInsert: true })
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.deletePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await PostModel.deleteOne({ _id: req.params.id }).exec();
    res.status(200).json({ message: "Successfully deleted. " });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // add to the post likers list
    const dataOne = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.id } },
      { new: true, upsert: true },
    )

    // add to the user likers list
    const dataTwo = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $addToSet: { likes: req.params.id } },
      { new: true, upsert: true },
    )
    res.status(201).json({
      dataTwo
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // remove to the post likers list
    const dataOne = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.id } },
      { new: true, upsert: true },
    )

    // remove to the user likes list
    const dataTwo = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $pull: { likes: req.params.id } },
      { new: true, upsert: true },
    )
    res.status(201).json({
      dataTwo
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.commentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true })
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.editCommentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return await PostModel.findOne(
      { _id: req.params.id }).then(
        (docs) => {

          console.log("contenu de docs.comments" + docs.comments);
          const theComment = docs.comments.find((comment) =>
            comment._id.equals(req.body.commentId)
          );

          console.log("contenu de theComment" + theComment);


          if (!theComment) return res.status(404).send("Comment not found");
          theComment.text = req.body.text;
          console.log("===> contenu de docs" + docs);
          docs.save()
          return res.status(200).send(docs);
        });
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true })
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(400).send(err);
  }
};