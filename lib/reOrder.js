function ReOrder(unOrdered) {
    var ke = [];

    Object.keys(unOrdered).forEach(function (k) {
        ke.push(k);
    });

    ke = ke.sort();

    var orderedObject = {};

    ke.forEach(function (y) {
        orderedObject[y] = unOrdered[y];
    });

    return orderedObject
}

module.exports = ReOrder;