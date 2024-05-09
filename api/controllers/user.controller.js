const mongoose = require('mongoose')
const UserModel = require('../models/user.model')
const ObjectID = require("mongoose").Types.ObjectId;


module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select('-password'); // ici, dans le select on fais "-passwort pour dans postman, quand les users vont s'aficher, ils s'afficherons sans le password"
  res.status(200).json(users);
}

module.exports.userInfo = async (req, res) => {
  console.log(req.params);
  try {
    if (!ObjectID.isValid(req.params.id)) {
      return res.status(400).send("L'id " + req.params.id + " est inconnue");
    } else {
      const userData = await UserModel.findById(req.params.id).select('-password').exec()
      res.json(userData).send()
    }
  } catch (error) {
    // res.status(400).json(error.message)
    console.log(error);
  }
};

module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("L'id " + req.params.id + " est inconnue");

  try {
    await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          pseudo: req.body.pseudo,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true })
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("L'id " + req.params.id + " est inconnue");

  try {
    await UserModel.deleteOne({ _id: req.params.id }).exec();
    res.status(200).json({ message: "Successfully deleted. " });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // add to the follower list
    const dataOne = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true },
    )

    // add to following list
    const dataTwo = await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true },
    )
    res.status(201).json({
      dataOne: dataOne,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}

module.exports.unFollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // add to the follower list
    const dataOne = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnFollow } },
      { new: true, upsert: true },
    )

    // add to following list
    const dataTwo = await UserModel.findByIdAndUpdate(
      req.body.idToUnFollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true },
    )
    res.status(201).json({
      dataOne: dataOne,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
}
