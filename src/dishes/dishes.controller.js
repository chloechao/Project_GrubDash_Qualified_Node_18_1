const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const bodyDataHas = require("../utils/bodyDataHas");

// TODO: Implement the /dishes handlers needed to make the tests pass
// create, read, update, and list

function dataIsValid(req, res, next) {
    const { dishId } = req.params;
    const { data: { id, name, price, description, image_url } = {} } = req.body;

    if (id && id !== dishId) {
        return next({
            status: 400,
            message: `Dish id does not match route id. id: ${id}, route id: ${dishId}`,
        });
    }

    if (!name || typeof price !== "number" || price < 0 || !description || !image_url) {
        return next({
            status: 400,
            message: `Check name, price, description, and image_url in the payload`
        });
    }
    next();
}


function dishExists(req, res, next) {
    const { dishId } = req.params;
    const { data: { id  } = {} } = req.body;
    const dishById = dishes.filter((dish) => dish.id === dishId)
    if (dishById.length > 0  || id === dishId) {
        res.locals.dish = dishById;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`,
    });
}

function list(req, res) {
    res.json({ data: dishes });
}

function read(req, res) {
    const dish = res.locals.dish;
    res.json({ data: dish[0] });
}

function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };

    dishes.push(newDish)
    res.status(201).json({ data: newDish });
}

function update(req, res) {
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body;

    if (id && id !== dishId) {
        return next({
            status: 400,
            message: `Dish id does not match route id. id: ${id}, route id: ${dishId}`,
        });
    }

    const index = dishes.findIndex(dish => dish.id === dishId);
    if (index === -1) {
        return next({
            status: 404,
            message: `Dish not found: ${dishId}`,
        });
    }

    const updatedDish = {
        id: dishId,
        name: name,
        description: description,
        price: price,
        image_url: image_url
    };

    dishes[index] = updatedDish;
    res.json({ data: updatedDish });
}


module.exports = {
    list,
    read: [
        dishExists,
        read
    ],
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        dataIsValid,
        create
    ],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        dataIsValid,
        update
    ]
};