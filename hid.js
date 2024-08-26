(function() {
    const output = document.getElementById("output");

    navigator.hid.onconnect = ({ device }) => {
        console.log(`HID connected: ${device.productName}`);
        output.innerHTML += `<br> HID connected: ${device.productName}`;
    };
})()