const net = require("net");
const IpPicker = require("./ippick.js").defaultPicker;

const ROOM_ID = 220255323;
const API_KEY = "e871267f4eea79f1";
const REGNAME = "x1541916139";
const USER_ID = 1541916139;
let socket;
let packageY



// Assistant functions
const xmlToJson = (str) => {
    str = str.replace(/(\<|\s{2}|\/\>)/g, "");
    let splitted = str.split(" ");
    let pkg = splitted[0];
    splitted.splice(0, 1);
    let atts = {};
    splitted.forEach(a => {
        if (a.includes("=")) atts[a.split("=")[0]] = a.split("=")[1].replace(/(\'|\")/g, "")
    });
    return { pkg, atts };
}
const JsonToXml = (package, json) => {
    let xml = `<${package}`;
    Object.keys(json).forEach(k => xml += ` ${k}="${json[k]}"`);
    xml += ` />`
    return xml;
}
const isPackage = (package_name, str) => {
    let jsoned = xmlToJson(str);
    return jsoned.pkg == package_name;
}
const send = (package, attributes) => {
    let xml = JsonToXml(package, attributes);
    let buf = Buffer.from(xml + '\0', 'utf8');
    socket.write(buf);
    console.log("[SEND]", xml, "\n");
}
const rand = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
}
const Connect = async () => {
    const { ip, l5 } = await IpPicker.pickIp({
        todo: {
            w_useroom: 2,
        }
    });
    socket = net.connect(ip, function () {
        console.log(">>>> Connection initialized!");
        send("y", { r: "2", u: USER_ID })
    })

    socket.on('data', (data) => {
        let raw = data.toString();
        console.log("[DATA]", raw, "\n");

        if (isPackage("y", raw)) {
            packageY = xmlToJson(raw);
            send("v", { n: REGNAME, a: API_KEY })
        }

        if (isPackage("v", raw)) {
            let jsoned = xmlToJson(raw);
            let atts = jsoned ? jsoned.atts : {};
            let obj = {};

            obj["Y"] = "1"
            obj["cb"] = packageY.atts.cb
            obj["l5"] = l5
            obj["l4"] = rand(500, 1000)
            obj["l3"] = rand(500, 1000)
            obj["l2"] = 0
            obj["q"] = 1
            obj["y"] = USER_ID
            obj["k"] = atts.k1
            obj["k3"] = atts.k3

            obj["z"] = 12
            obj["p"] = 0
            obj["c"] = ROOM_ID
            obj["f"] = 0
            obj["u"] = USER_ID

            if (atts.d0) obj["d0"] = atts.d0
            if (atts.d3) obj["d3"] = atts.d3
            if (atts.dt) obj["dt"] = atts.dt

            obj["N"] = REGNAME
            obj["n"] = "ME"
            obj["a"] = "1"
            obj["h"] = "a"
            obj["v"] = "0"

            send("j2", obj)

        }
    })
    socket.on('close', (data) => {
        console.log("[CLOSE]", data)
    });
    socket.on('error', (data) => {
        console.log("[ERROR]", data)
    });
}
Connect();
