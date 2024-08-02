function bodyDataHas(propertyName) {
    return function (req, res, next) {
        if(propertyName === "quantity") {
            const {data = { dishes: {}}} = req.body;
            if (data.dishes[0].quantity) {
                return next();
            }
        }

        const {data = {}} = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Must include a ${propertyName}`
        });
    };
}

module.exports = bodyDataHas;
