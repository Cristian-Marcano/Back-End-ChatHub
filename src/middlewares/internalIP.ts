import { networkInterfaces } from "os"

let ip = '0.0.0.0'

let ips = networkInterfaces()

Object
    .keys(ips)
    .forEach(function(_interface) {
        ips[_interface]
        ?.forEach(function(_dev) {
            if(_dev.family === 'IPv4' && !_dev.internal) ip = _dev.address
        }) 
    })

export default ip;