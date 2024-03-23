const fastify = require("fastify")({ logger: true });
const startDB = require("./helpers/DB");
const utils = require("./helpers/utils");
const User = require("./models/user");

fastify.register(startDB);
fastify.listen({ port: 5000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

const addUser = async function (request, reply) {
  try {
    const userBody = request.body;
    console.log(userBody);
    userBody.fullName = utils.getFullName(
      userBody.firstName,
      userBody.lastName
    );
    delete userBody.firstName;
    delete userBody.lastName;
    const user = new User(userBody);
    const addedUser = await user.save();
    return addedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};
fastify.post("/user", addUser);
const getUser = async function (request, reply) {
  try {
    const user = await User.findById(request.params.id);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
fastify.get("/users/:id", getUser);
const getUsers = async function () {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};
fastify.get("/users", getUsers);
const deleteUser = async function (request) {
  try {
    const user = await User.findByIdAndDelete(request.params.id);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
fastify.delete("/users/:id", deleteUser);

module.exports = { addUser, getUser, getUsers , deleteUser};
