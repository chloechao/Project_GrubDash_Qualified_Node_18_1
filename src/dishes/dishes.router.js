const router = require("express").Router({ mergeParams: true });
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const notFound = require("../errors/notFound");

// TODO: Implement the /dishes routes needed to make the tests pass

router.route("/:dishId").get(controller.read).put(controller.update).delete(methodNotAllowed).all(notFound);
router.route("/").get(controller.list).post(controller.create).delete(methodNotAllowed).all(notFound);

module.exports = router;
