function data_checker(data, props) {
    for (var prop in props)
        if (data[props[prop]] == undefined)
            return false;
    return true;
}

module.exports = {
    data_checker
}