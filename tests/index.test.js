const it = require("ava").default;
const chai = require("chai");
var expect = chai.expect;
const startDB = require("../helpers/DB");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { addUser, getUser, getUsers, deleteUser } = require("../index");
const User = require("../models/user");
const sinon = require("sinon");
const utils = require("../helpers/utils");

it.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  process.env.MONGOURI = t.context.mongod.getUri("cloudUnitTesting");
  await startDB();
});

it.after(async (t) => {
  await t.context.mongod.stop({ doCleanUp: true });
});

it("should add a user", async (t) => {
  const request = {
    body: {
      firstName: "Menna",
      lastName: "Hamdy",
      age: 11,
      job: "fs",
    },
  };
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };

  sinon.stub(utils, "getFullName").callsFake((fname, lname) => {
    expect(fname).to.be.equal(request.body.firstName);
    expect(lname).to.be.equal(request.body.lastName);
    return "Menna Hamdy";
  });
  const actualResult = await addUser(request);
  const result = {
    ...expectedResult,
    __v: actualResult.__v,
    _id: actualResult._id,
  };
  expect(actualResult).to.be.a("object");
  expect(actualResult._doc).to.deep.equal(result);
  t.teardown(async () => {
    await User.deleteMany({
      fullName: request.body.fullName,
    });
  });
  t.pass();
});

it("should get a user", async (t) => {
  const user = new User({
    fullName: "Sherry Osama",
    age: 11,
    job: "fs",
  });

  await user.save();
  const request = {
    params: {
      id: user._id,
    },
  };
  const actualResult = await getUser(request);
  const result = {
    ...user._doc,
    __v: actualResult.__v,
    _id: actualResult._id,
  };
  expect(actualResult).to.be.a("object");
  expect(actualResult._doc).to.deep.equal(result);
  t.pass();
});

it("should get all users", async (t) => {
    await User.deleteMany({});
  const user = new User({
    fullName: "Sherry Osama",
    age: 11,
    job: "fs",
  });
  await user.save();
  const actualResult = await getUsers();
  expect(actualResult).to.be.a("array");
  expect(actualResult.length).to.be.at.least(1);
  expect(actualResult[0]._doc).to.deep.equal(user._doc);
  t.pass();
});

it('should delete a user', async (t) => {
    const user = new User({
        fullName: "Sherry Osama",
        age: 11,
        job: "fs",
      });
      await user.save();
      const request = {
        params: {
          id: user._id,
        },
      };
      const actualResult = await deleteUser(request);
      const result = {
        ...user._doc,
        __v: actualResult.__v,
        _id: actualResult._id
      }
      expect(actualResult).to.be.a('object');
      expect(actualResult._doc).to.deep.equal(result);
      t.pass();
})
