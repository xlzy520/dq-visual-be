const filterParams = params => {
    const keys = Object.keys(params)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value =params[key]
        if (!value) {
            delete params[key]
        }
    }
    return params
}

module.exports = {
    filterParams
}
