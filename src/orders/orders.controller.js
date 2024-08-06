const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const bodyDataHas = require("../utils/bodyDataHas");

// TODO: Implement the /orders handlers needed to make the tests pass
// create, read, update, delete, and list
function dataIsValid(req, res, next){
    const { data: { id, deliverTo, mobileNumber, dishes,  status } } = req.body;

    if(Array.isArray(dishes)) {
        const hasInvalidQuantity = dishes.some((dish) => typeof (dish.quantity) !== "number" || dish.quantity <= 0)
        if (hasInvalidQuantity) {
            return next({
                status: 400,
                message: `Please put valid quantity such as 0, 1, 2`
            });
        }
    } else {
        return next({
            status: 400,
            message: `dish is missing`
        });
    }

    if (deliverTo === "" || mobileNumber === "" || dishes.length < 1 || status === "invalid") {
        return next({
            status: 400,
            message: `Please check dish deliverTo mobileNumber status prop`
        });
    }

    res.locals.orderData = { id, deliverTo, mobileNumber, dishes,  status };
    next();
}

function updateDataIsValid(req, res, next) {
    const { orderId } = req.params;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const orderStatus = orders.find((order) => order.id === orderId);
    if (id && id !== orderId) {
        return next({
            status: 400,
            message: `Order id does not match route id. id: ${id}, route id: ${orderId}`,
        });
    }

    if (!orderStatus) {
        return next({
            status: 404,
            message: `Order not found: ${orderId}`,
        });
    }

    if (status === "" || orderStatus.status === "delivered") {
        return next({
            status: 400,
            message: `Cannot update order because status cannot be updated. orderStatus: ${orderStatus.status}`,
        });
    }

    res.locals.orderId = orderId;
    res.locals.orderData = { id, deliverTo, mobileNumber, status, dishes };
    next();
}


function orderExists(req, res, next) {
    const { orderId } = req.params;
    const { data: { id  } = {} } = req.body;
    const orderById = orders.filter((order) => order.id === orderId)
    const index = orders.findIndex(order => order.id === orderId);

    if (orderById.length > 0 || id === orderId || index !== -1) {
        res.locals.order = orderById;
        res.locals.orderIndex = index;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`,
    });
}

function deleteDataIsValid(req, res, next){
    const { orderId } = req.params;
    const { data: { status } = {} } = req.body;
    const orderStatus = orders.filter((order) => order.id === orderId)
    if (orderStatus[0].status !== "pending") {
        return next({
            status: 400,
            message: `Cannot delete order because status !== pending`
        });
    }
    next();
}

function list(req, res) {
    res.json({ data: orders });
}

function read(req, res) {
    const order = res.locals.order;
    res.json({ data: order[0] });
}

function create(req, res) {
    const { deliverTo, mobileNumber, status, dishes } = res.locals.orderData;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    };

    orders.push(newOrder)
    res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
    const { deliverTo, mobileNumber, status, dishes } = res.locals.orderData
    const updatedOrder = {
        id: req.params.orderId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    };

    orders[ res.locals.orderIndex ] = updatedOrder;
    res.json({ data: updatedOrder });
}


function destroy(req, res) {
    orders.splice(res.locals.orderIndex, 1);
    res.sendStatus(204);
}
module.exports = {
    list,
    create:[
        dataIsValid,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("quantity"),
        create
    ],
    read: [
        orderExists,
        read
    ],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        dataIsValid,
        updateDataIsValid,
        update
    ],
    delete: [orderExists, deleteDataIsValid, destroy],
};